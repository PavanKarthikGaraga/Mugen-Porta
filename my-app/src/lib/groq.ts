/**
 * Shared Groq client with true API-key fallback.
 *
 * The app is provisioned with up to 9 Groq API keys (env vars GROQ_KEY_1
 * .. GROQ_KEY_9) specifically so a single rate-limited/expired/invalid key
 * never takes the whole feature down. Every call here shuffles the
 * available keys and tries them in turn, and additionally falls back from
 * the primary model to a lighter secondary model if every key fails on the
 * first model. Only if every (model, key) combination fails does this
 * throw.
 *
 * Model tiers are ordered best-quality-first, so a request only degrades to
 * a weaker model once every key is exhausted on the stronger one. Groq
 * applies rate limits per (key, model), so each tier below carries its own
 * independent token budget -- the chain is a capacity multiplier, not just a
 * reliability net.
 *
 * Free-tier budget per key, and the total across 9 keys:
 *
 *   openai/gpt-oss-120b       200K TPD /  8K TPM  ->  1.8M tokens/day
 *   llama-3.3-70b-versatile   100K TPD / 12K TPM  ->  0.9M tokens/day
 *   openai/gpt-oss-20b        200K TPD /  8K TPM  ->  1.8M tokens/day
 *   llama-3.1-8b-instant      500K TPD /  6K TPM  ->  4.5M tokens/day
 *                                                    ----------------
 *                                                     9.0M tokens/day
 *
 * TPD is the binding constraint, not RPD: at ~3.5K tokens per analysis the
 * token ceiling is reached roughly 18x sooner than the request ceiling, so
 * adding model tiers buys far more headroom than adding keys would.
 */

const MODELS = [
    'openai/gpt-oss-120b',
    'llama-3.3-70b-versatile',
    'openai/gpt-oss-20b',
    'llama-3.1-8b-instant',
] as const;

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

export class GroqConfigError extends Error {
    constructor(message = 'No Groq API keys are configured') {
        super(message);
        this.name = 'GroqConfigError';
    }
}

function getGroqKeys(): string[] {
    const keys: string[] = [];
    for (let i = 1; i <= 9; i++) {
        const key = process.env[`GROQ_KEY_${i}`];
        if (key) keys.push(key);
    }
    return keys;
}

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function safeParseJson(text: string): any | null {
    try {
        return JSON.parse(text);
    } catch {
        // Model sometimes wraps JSON in prose or a markdown fence despite
        // json_object mode being requested — fall back to extracting the
        // first {...} block.
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
            try {
                return JSON.parse(match[0]);
            } catch {
                return null;
            }
        }
        return null;
    }
}

interface CallGroqOptions {
    systemPrompt: string;
    userPrompt: string;
    temperature?: number;
    maxTokens?: number;
}

/**
 * Calls Groq's chat completion API in JSON mode, trying every configured
 * key (in random order) against the primary model before moving on to the
 * fallback model. Returns the parsed JSON object from the model's reply.
 * Throws GroqConfigError if no keys are configured, or a regular Error
 * describing the last failure if every attempt failed.
 */
export async function callGroqJSON({
    systemPrompt,
    userPrompt,
    temperature = 0.5,
    maxTokens = 1800,
}: CallGroqOptions): Promise<any> {
    const keys = shuffle(getGroqKeys());
    if (keys.length === 0) {
        throw new GroqConfigError();
    }

    let lastError: Error = new Error('All Groq keys/models failed');

    for (const model of MODELS) {
        for (const key of keys) {
            try {
                const res = await fetch(GROQ_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${key}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model,
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: userPrompt },
                        ],
                        temperature,
                        max_tokens: maxTokens,
                        response_format: { type: 'json_object' },
                    }),
                });

                if (!res.ok) {
                    // 401/403 = bad or revoked key, 429 = this key is rate-limited,
                    // 5xx = transient provider issue — in every case, just move on
                    // to the next key/model rather than failing the request.
                    const bodyText = await res.text().catch(() => '');
                    lastError = new Error(`Groq request failed (${res.status}): ${bodyText.slice(0, 200)}`);
                    continue;
                }

                const data = await res.json();
                const content = data?.choices?.[0]?.message?.content;
                if (!content || typeof content !== 'string') {
                    lastError = new Error('Groq returned an empty response');
                    continue;
                }

                const parsed = safeParseJson(content);
                if (!parsed) {
                    lastError = new Error('Groq returned a response that was not valid JSON');
                    continue;
                }

                return parsed;
            } catch (err: any) {
                lastError = err instanceof Error ? err : new Error(String(err));
                continue;
            }
        }
    }

    throw lastError;
}
