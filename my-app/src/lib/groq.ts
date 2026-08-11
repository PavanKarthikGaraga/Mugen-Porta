/**
 * Shared AI client with true API-key fallback.
 *
 * PRIMARY: Groq (9 keys × 4 model tiers)
 * ─────────────────────────────────────────────────────────────
 * The app is provisioned with up to 9 Groq API keys (env vars GROQ_KEY_1
 * .. GROQ_KEY_9) specifically so a single rate-limited/expired/invalid key
 * never takes the whole feature down. Every call here shuffles the
 * available keys and tries them in turn, and additionally falls back from
 * the primary model to a lighter secondary model if every key fails on the
 * first model. Only if every (model, key) combination fails does this
 * chain fall through to OpenRouter.
 *
 * Model tiers are ordered best-quality-first, so a request only degrades to
 * a weaker model once every key is exhausted on the stronger one. Groq
 * applies rate limits per (key, model), so each tier below carries its own
 * independent token budget.
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
 * FALLBACK: OpenRouter (free-tier models only — zero billing risk)
 * ─────────────────────────────────────────────────────────────────
 * Only reached when every Groq key × model combination is exhausted.
 * Only free models (pricing: $0/$0) are used; if none are available the
 * system throws rather than risk any charges.
 *
 * Free OpenRouter models used (ordered best-quality-first):
 *   google/gemma-4-31b-it:free          262K ctx
 *   google/gemma-4-26b-a4b-it:free      262K ctx
 *   nvidia/nemotron-3-super-120b-a12b:free  262K ctx
 *   nvidia/nemotron-3-nano-30b-a3b:free     256K ctx
 *   openai/gpt-oss-20b:free             131K ctx
 *
 * NOTE: OpenRouter free models do NOT support response_format: json_object
 * on all models. We rely on a system-prompt instruction + safeParseJson()
 * to extract the JSON instead.
 */

// ─── Groq configuration ──────────────────────────────────────────────────────

const GROQ_MODELS = [
    'openai/gpt-oss-120b',
    'llama-3.3-70b-versatile',
    'openai/gpt-oss-20b',
    'llama-3.1-8b-instant',
] as const;

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

// ─── OpenRouter configuration (FREE models only) ─────────────────────────────

/**
 * Only models with $0 input + $0 output pricing are listed here.
 * If you ever add a model, verify it is still free at:
 * https://openrouter.ai/models?max_price=0
 *
 * ⚠️  Do NOT add non-free models here — there is no billing guard in code.
 *
 * 5 free models × 5 keys (OPEN_KEY_1..5) = 25 attempts before giving up.
 */
const OPENROUTER_FREE_MODELS = [
    'google/gemma-4-31b-it:free',           // 262K ctx — best quality
    'google/gemma-4-26b-a4b-it:free',       // 262K ctx
    'nvidia/nemotron-3-super-120b-a12b:free', // 262K ctx
    'nvidia/nemotron-3-nano-30b-a3b:free',  // 256K ctx
    'openai/gpt-oss-20b:free',              // 131K ctx — lightest fallback
] as const;

// Supports up to 5 OpenRouter keys: OPEN_KEY_1 .. OPEN_KEY_5
// (env already has OPEN_KEY_1..5 — just add more to increase headroom)

const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

// ─── Shared helpers ───────────────────────────────────────────────────────────

export class GroqConfigError extends Error {
    constructor(message = 'No Groq API keys are configured') {
        super(message)
        this.name = 'GroqConfigError'
    }
}

function getGroqKeys(): string[] {
    const keys: string[] = []
    for (let i = 1; i <= 9; i++) {
        const key = process.env[`GROQ_KEY_${i}`]
        if (key) keys.push(key)
    }
    return keys
}

function getOpenRouterKeys(): string[] {
    const keys: string[] = []
    for (let i = 1; i <= 9; i++) {
        const key = process.env[`OPEN_KEY_${i}`]
        if (key) keys.push(key)
    }
    // Also accept the single OPENROUTER_KEY alias for convenience
    const alias = process.env.OPENROUTER_KEY
    if (alias && !keys.includes(alias)) keys.push(alias)
    return keys
}

// Attempts had no timeout at all -- a single stalled key/model connection
// could hang the whole 36-attempt Groq chain (or the 25-attempt OpenRouter
// one after it) indefinitely, which is long enough to blow past a reverse
// proxy's gateway timeout. The proxy then returns its own HTML error page,
// which breaks response.json() client-side and surfaces as an opaque
// "Network error" with no indication this was actually an AI-provider
// slowdown. Bounding each attempt keeps the whole chain's worst case sane.
const ATTEMPT_TIMEOUT_MS = 25_000

async function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), ATTEMPT_TIMEOUT_MS)
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
        // Model sometimes wraps JSON in prose or a markdown fence despite
        // json_object mode being requested — fall back to extracting the
        // first {...} block.
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

interface CallGroqOptions {
    systemPrompt: string
    userPrompt: string
    temperature?: number
    maxTokens?: number
}

// ─── Groq attempt ────────────────────────────────────────────────────────────

async function tryGroq({
    systemPrompt,
    userPrompt,
    temperature = 0.5,
    maxTokens,
}: CallGroqOptions): Promise<{ success: true; data: any } | { success: false; lastError: Error }> {
    const keys = shuffle(getGroqKeys())
    if (keys.length === 0) {
        return { success: false, lastError: new GroqConfigError() }
    }

    let lastError: Error = new Error('All Groq keys/models failed')

    for (const model of GROQ_MODELS) {
        for (const key of keys) {
            try {
                const res = await fetchWithTimeout(GROQ_ENDPOINT, {
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
                        // Omitted entirely when not passed, rather than defaulted,
                        // so the provider uses the model's own max output — no
                        // artificial cap unless a caller explicitly asks for one.
                        ...(maxTokens ? { max_tokens: maxTokens } : {}),
                        response_format: { type: 'json_object' },
                    }),
                })

                if (!res.ok) {
                    // 401/403 = bad or revoked key, 429 = this key is rate-limited,
                    // 5xx = transient provider issue — in every case, just move on
                    // to the next key/model rather than failing the request.
                    const bodyText = await res.text().catch(() => '')
                    lastError = new Error(`Groq request failed (${res.status}): ${bodyText.slice(0, 200)}`)
                    continue
                }

                const data = await res.json()
                const content = data?.choices?.[0]?.message?.content
                if (!content || typeof content !== 'string') {
                    lastError = new Error('Groq returned an empty response')
                    continue
                }

                const parsed = safeParseJson(content)
                if (!parsed) {
                    lastError = new Error('Groq returned a response that was not valid JSON')
                    continue
                }

                return { success: true, data: parsed }
            } catch (err: any) {
                lastError = err instanceof Error ? err : new Error(String(err))
                continue
            }
        }
    }

    return { success: false, lastError }
}

// ─── OpenRouter fallback (free models only) ───────────────────────────────────

async function tryOpenRouter({
    systemPrompt,
    userPrompt,
    temperature = 0.5,
    maxTokens,
}: CallGroqOptions): Promise<{ success: true; data: any } | { success: false; lastError: Error }> {
    const keys = shuffle(getOpenRouterKeys())
    if (keys.length === 0) {
        return {
            success: false,
            lastError: new Error('No OpenRouter keys configured (OPEN_KEY_1..N) — cannot use fallback'),
        }
    }

    let lastError: Error = new Error('All OpenRouter free models failed')

    // Instruct the model to reply ONLY with JSON, since not all free models
    // support the response_format parameter.
    const jsonSystemPrompt = `${systemPrompt}\n\nIMPORTANT: Your entire response MUST be a single valid JSON object. Do not include any prose, explanation, or markdown fences — only raw JSON.`

    // Try every model × every key (keys shuffled for load distribution)
    for (const model of OPENROUTER_FREE_MODELS) {
        for (const key of keys) {
            try {
                const res = await fetchWithTimeout(OPENROUTER_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${key}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'https://zeroonedevs.in',
                        'X-Title': 'Mugen-Porta',
                    },
                    body: JSON.stringify({
                        model,
                        messages: [
                            { role: 'system', content: jsonSystemPrompt },
                            { role: 'user', content: userPrompt },
                        ],
                        temperature,
                        ...(maxTokens ? { max_tokens: maxTokens } : {}),
                    }),
                })

                if (!res.ok) {
                    const bodyText = await res.text().catch(() => '')
                    lastError = new Error(
                        `OpenRouter request failed (${res.status}) for model ${model}: ${bodyText.slice(0, 200)}`,
                    )
                    continue
                }

                const data = await res.json()
                const content = data?.choices?.[0]?.message?.content
                if (!content || typeof content !== 'string') {
                    lastError = new Error(`OpenRouter model ${model} returned an empty response`)
                    continue
                }

                const parsed = safeParseJson(content)
                if (!parsed) {
                    lastError = new Error(`OpenRouter model ${model} returned a response that was not valid JSON`)
                    continue
                }

                return { success: true, data: parsed }
            } catch (err: any) {
                lastError = err instanceof Error ? err : new Error(String(err))
                continue
            }
        } // end key loop
    } // end model loop

    return { success: false, lastError }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Calls the AI pipeline in JSON mode:
 *   1. Try every Groq key (shuffled) against every Groq model tier.
 *   2. If all Groq attempts fail, fall back to OpenRouter free-tier models.
 *   3. Only if every (provider, model, key) combination fails does this throw.
 *
 * Returns the parsed JSON object from the model's reply.
 * Throws GroqConfigError if no Groq keys are configured and OpenRouter is
 * also unavailable, or a regular Error describing the last failure.
 */
export async function callGroqJSON(options: CallGroqOptions): Promise<any> {
    // ── Phase 1: Groq ──────────────────────────────────────────────────────
    const groqResult = await tryGroq(options)
    if (groqResult.success) {
        return groqResult.data
    }

    // Narrow the failure branch explicitly so TypeScript sees lastError.
    const groqError = (groqResult as { success: false; lastError: Error }).lastError

    // ── Phase 2: OpenRouter free-tier fallback ────────────────────────────
    const orResult = await tryOpenRouter(options)
    if (orResult.success) {
        return orResult.data
    }

    // Both providers exhausted — surface the more informative of the two errors.
    const orError = (orResult as { success: false; lastError: Error }).lastError
    throw new Error(
        `All AI providers failed.\n` +
            `  Groq: ${groqError.message}\n` +
            `  OpenRouter: ${orError.message}`,
    )
}
