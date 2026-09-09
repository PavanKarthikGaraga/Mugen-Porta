/**
 * Shared AI client for Career Dashboard.
 *
 * Exclusively uses OpenRouter's free-tier models ($0/$0) with up to 17 fallback keys
 * (OPEN_KEY_1 .. OPEN_KEY_17).
 *
 * Free OpenRouter models used (ordered best-quality-first):
 *   nvidia/nemotron-3-ultra-550b-a55b:free
 *   nvidia/nemotron-3-super-120b-a12b:free
 *   nvidia/nemotron-3.5-lightning:free
 *   google/gemini-2.5-flash:free
 *   meta-llama/llama-3.3-70b-instruct:free
 *
 * NOTE: Some OpenRouter free models do NOT support response_format: json_object.
 * We rely on a system-prompt instruction + safeParseJson() to extract the JSON.
 */

const OPENROUTER_FREE_MODELS = [
    'nvidia/nemotron-3-ultra-550b-a55b:free',
    'nvidia/nemotron-3-super-120b-a12b:free',
    'nvidia/nemotron-3.5-lightning:free',
    'google/gemini-2.5-flash:free',
    'meta-llama/llama-3.3-70b-instruct:free',
] as const;

const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

export class OpenRouterConfigError extends Error {
    constructor(message = 'No OpenRouter API keys are configured (OPEN_KEY_1..17)') {
        super(message)
        this.name = 'OpenRouterConfigError'
    }
}

function getOpenRouterKeys(): string[] {
    const keys: string[] = []
    for (let i = 1; i <= 17; i++) {
        const key = process.env[`OPEN_KEY_${i}`]
        if (key) keys.push(key)
    }
    // Also accept the single OPENROUTER_KEY alias for convenience
    const alias = process.env.OPENROUTER_KEY
    if (alias && !keys.includes(alias)) keys.push(alias)
    return keys
}

// Reduced timeout so it doesn't hang forever on slow models (like Nemotron)
const ATTEMPT_TIMEOUT_MS = 25_000 // 25s per individual API call attempt
const OPENROUTER_BUDGET_MS = 85_000 // Total fallback budget 85s to prevent 100s proxy timeout

async function fetchWithTimeout(url: string, options: RequestInit, maxWaitMs: number): Promise<Response> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), Math.max(1000, maxWaitMs))
    try {
        return await fetch(url, { ...options, signal: controller.signal })
    } finally {
        clearTimeout(timer)
    }
}

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
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

interface CallAiOptions {
    systemPrompt: string
    userPrompt: string
    temperature?: number
    // maxTokens omitted entirely so it doesn't arbitrarily clip output
}

export interface AiUsage {
    promptTokens: number
    completionTokens: number
    totalTokens: number
}

export interface AiCallResult {
    result: any
    usage: AiUsage | null
    provider: 'openrouter'
    model: string
}

function extractUsage(data: any): AiUsage | null {
    const u = data?.usage
    if (!u) return null
    return {
        promptTokens: Number(u.prompt_tokens) || 0,
        completionTokens: Number(u.completion_tokens) || 0,
        totalTokens: Number(u.total_tokens) || 0,
    }
}

async function tryOpenRouter(
    { systemPrompt, userPrompt, temperature = 0.5 }: CallAiOptions,
    deadline: number,
): Promise<{ success: true; data: any; usage: AiUsage | null; model: string } | { success: false; lastError: Error }> {
    const keys = shuffle(getOpenRouterKeys())
    if (keys.length === 0) {
        return {
            success: false,
            lastError: new OpenRouterConfigError(),
        }
    }

    let lastError: Error = new Error('All OpenRouter free models failed')

    // Instruct the model to reply ONLY with JSON.
    const jsonSystemPrompt = `${systemPrompt}\n\nIMPORTANT: Your entire response MUST be a single valid JSON object. Do not include any prose, explanation, or markdown fences — only raw JSON.`

    for (const model of OPENROUTER_FREE_MODELS) {
        for (const key of keys) {
            const remaining = deadline - Date.now()
            if (remaining <= 0) {
                return { success: false, lastError: new Error(`Timed out after ${OPENROUTER_BUDGET_MS / 1000}s budget. Last error: ${lastError.message}`) }
            }
            try {
                const res = await fetchWithTimeout(OPENROUTER_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${key}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'https://sacactivities.kluniversity.in',
                        'X-Title': 'KL University SAC',
                    },
                    body: JSON.stringify({
                        model,
                        messages: [
                            { role: 'system', content: jsonSystemPrompt },
                            { role: 'user', content: userPrompt },
                        ],
                        temperature,
                    }),
                }, Math.min(ATTEMPT_TIMEOUT_MS, remaining))

                if (!res.ok) {
                    const bodyText = await res.text().catch(() => '')
                    lastError = new Error(
                        `OpenRouter request failed (${res.status}) for model ${model}: ${bodyText.slice(0, 200)}`,
                    )
                    // If it's a model routing/overloaded error (502, 503, 529), or invalid request, switch model completely
                    if (res.status >= 500 && res.status !== 529) {
                        break; // Move to next model
                    }
                    // Otherwise (like 429 Rate Limit or Auth Error), just try the next key
                    continue;
                }

                const data = await res.json()
                const content = data?.choices?.[0]?.message?.content
                if (!content || typeof content !== 'string') {
                    lastError = new Error(`OpenRouter model ${model} returned an empty response`)
                    break; // Model failure, don't waste other keys on it
                }

                const parsed = safeParseJson(content)
                if (!parsed) {
                    lastError = new Error(`OpenRouter model ${model} returned a response that was not valid JSON`)
                    break; // Model failure, don't waste other keys on it
                }

                return { success: true, data: parsed, usage: extractUsage(data), model }
            } catch (err: any) {
                lastError = err instanceof Error ? err : new Error(String(err))
                continue
            }
        } 
    } 

    return { success: false, lastError }
}

/**
 * Calls the AI pipeline in JSON mode using OpenRouter's free tier.
 */
export async function callOpenRouterJSON(options: CallAiOptions): Promise<AiCallResult> {
    const deadline = Date.now() + OPENROUTER_BUDGET_MS
    const result = await tryOpenRouter(options, deadline)
    if (!result.success) {
        throw (result as { success: false; lastError: Error }).lastError;
    }
    
    return { result: result.data, usage: result.usage, provider: 'openrouter', model: result.model }
}
