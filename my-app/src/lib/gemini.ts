/**
 * Shared AI client for Career Dashboard.
 *
 * Upgraded to use Google Gemini API for extreme speed and a massive
 * 1 Million token context window on the free tier.
 * Includes fallback logic to cycle through models and multiple API keys.
 */

export class GeminiConfigError extends Error {
    constructor(message = 'No GEMINI_API_KEY is configured in the environment') {
        super(message)
        this.name = 'GeminiConfigError'
    }
}

export interface CallAiOptions {
    systemPrompt: string
    userPrompt: string
    temperature?: number
}

export interface AiUsage {
    promptTokens: number
    completionTokens: number
    totalTokens: number
}

export interface AiCallResult {
    result: any
    usage: AiUsage | null
    provider: string
    model: string
}

function getGeminiKeys(): string[] {
    const keys: string[] = [];
    for (const [key, value] of Object.entries(process.env)) {
        if (key.startsWith('GEMINI_API_KEY') && value && value.trim() !== '') {
            keys.push(value.trim());
        }
    }
    return Array.from(new Set(keys)); // Deduplicate
}

const ATTEMPT_TIMEOUT_MS = 85_000; // 85s timeout per model attempt

const FALLBACK_MODELS = [
    // 1. Primary: High reasoning, highly stable, avoids the 3.8 traffic spike
    'gemini-3.7-flash',
    
    // 2. Secondary: The most intelligent model (currently 3.8). Placed second 
    // so if 3.7 is down, we still try to get the smartest possible output.
    'gemini-flash-latest',
    
    // 3. Fallback: Lighter model. Reasoning isn't as deep, but guarantees 
    // the student gets their roadmap instantly if the main servers are struggling.
    'gemini-3.5-flash-lite',
    
    // 4. Final Safety Net: The lightest, oldest model on the free tier.
    'gemini-3.1-flash-lite'
];

async function fetchWithTimeout(url: string, options: RequestInit, maxWaitMs: number): Promise<Response> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), maxWaitMs)
    try {
        return await fetch(url, { ...options, signal: controller.signal })
    } finally {
        clearTimeout(timer)
    }
}

function safeParseJson(text: string): any | null {
    try {
        return JSON.parse(text)
    } catch {
        const match = text.match(/\{[\s\S]*\}/)
        if (match) {
            try {
                return JSON.parse(match[0])
            } catch {
                return null
            }
        }
        return null
    }
}

/**
 * Calls the AI pipeline in JSON mode using Google Gemini.
 */
export async function callGeminiJSON(options: CallAiOptions): Promise<AiCallResult> {
    const { systemPrompt, userPrompt, temperature = 0.5 } = options;
    const apiKeys = getGeminiKeys();
    
    if (apiKeys.length === 0) {
        throw new GeminiConfigError();
    }

    // Instruct the model to reply ONLY with JSON.
    const jsonSystemPrompt = `${systemPrompt}\n\nIMPORTANT: Your entire response MUST be a single valid JSON object. Do not include any prose, explanation, or markdown fences — only raw JSON.`;

    const body = {
        systemInstruction: {
            parts: [{ text: jsonSystemPrompt }]
        },
        contents: [
            {
                role: 'user',
                parts: [{ text: userPrompt }]
            }
        ],
        generationConfig: {
            temperature,
            responseMimeType: 'application/json' // Forces Gemini into JSON output mode
        }
    };

    let lastError: Error = new Error('All fallback models and keys failed');

    for (const apiKey of apiKeys) {
        let keyFailed = false;

        for (const model of FALLBACK_MODELS) {
            if (keyFailed) break; // Skip remaining models for this rate-limited/invalid key

            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

            try {
                const res = await fetchWithTimeout(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body)
                }, ATTEMPT_TIMEOUT_MS);

                if (!res.ok) {
                    const bodyText = await res.text().catch(() => '');
                    lastError = new Error(`Gemini request failed (${res.status}) for model ${model}: ${bodyText.slice(0, 300)}`);
                    
                    if (res.status === 503) {
                        // 503 Overloaded: Server issue. Try the next MODEL with the SAME KEY.
                        continue;
                    } else if (res.status === 429 || res.status === 403) {
                        // 429 Rate Limit or 403 Invalid: Key issue. Break to try the NEXT KEY.
                        keyFailed = true;
                        break; 
                    } else {
                        // 400 Bad Request, etc. Prompt issue, fail immediately.
                        throw lastError; 
                    }
                }

                const data = await res.json();
                const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                
                if (!content || typeof content !== 'string') {
                    lastError = new Error(`Gemini model ${model} returned an empty response`);
                    continue;
                }

                const parsed = safeParseJson(content);
                if (!parsed) {
                    lastError = new Error(`Gemini model ${model} returned a response that was not valid JSON`);
                    continue;
                }

                let usage: AiUsage | null = null;
                if (data.usageMetadata) {
                    usage = {
                        promptTokens: data.usageMetadata.promptTokenCount || 0,
                        completionTokens: data.usageMetadata.candidatesTokenCount || 0,
                        totalTokens: data.usageMetadata.totalTokenCount || 0,
                    };
                }

                // Successfully got a response, return immediately!
                return {
                    result: parsed,
                    usage,
                    provider: 'gemini',
                    model: model
                };
                
            } catch (err: any) {
                lastError = err instanceof Error ? err : new Error(String(err));
                // If it's a hard error thrown manually above (like 400 Bad Request), break the entire pipeline
                if (err.message && !err.message.includes('503') && !err.message.includes('429') && !err.message.includes('403')) {
                    throw lastError;
                }
            }
        }
    }

    // If we exhaust the entire fallback list for all keys, throw the last error
    throw lastError;
}
