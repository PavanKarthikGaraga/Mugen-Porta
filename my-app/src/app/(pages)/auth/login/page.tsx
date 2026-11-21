"use client";
import { useState, useEffect, useCallback, type FormEvent, type KeyboardEvent } from "react";
import { LuEyeClosed, LuEye, LuRefreshCw, LuArrowRight, LuTriangleAlert } from "react-icons/lu";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import SamamLogo from "@/components/SamamLogo";
import { roleHome, safeNextPath } from "@/lib/roleHome";

const CAPTCHA_CHARS = "abcdefghjkmnpqrstuvwxyz23456789"; // no 0/o, 1/l/i look-alikes

function generateCaptcha(length = 6) {
    let out = "";
    for (let i = 0; i < length; i++) out += CAPTCHA_CHARS.charAt(Math.floor(Math.random() * CAPTCHA_CHARS.length));
    return out;
}

const HIGHLIGHTS = [
    "Discover and join activities across all SAC domains",
    "Earn SAMAM points, badges and verified certificates",
    "Build your Excellence Passport for placements",
];

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [capsLock, setCapsLock] = useState(false);
    const [captcha, setCaptcha] = useState("");
    const [captchaInput, setCaptchaInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [redirecting, setRedirecting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [showForgotModal, setShowForgotModal] = useState(false);

    const router = useRouter();

    const refreshCaptcha = useCallback(() => {
        setCaptcha(generateCaptcha());
        setCaptchaInput("");
    }, []);

    // Generated on the client only, so server and client HTML match.
    useEffect(() => { refreshCaptcha(); }, [refreshCaptcha]);

    const trackCapsLock = (e: KeyboardEvent<HTMLInputElement>) => {
        setCapsLock(typeof e.getModifierState === "function" && e.getModifierState("CapsLock"));
    };

    const fail = (message: string) => {
        setFormError(message);
        toast.error(message);
    };

    const handleLogin = async (e?: FormEvent) => {
        e?.preventDefault();
        setFormError(null);

        const user = username.trim();
        if (!user || user.length > 11) return fail("Enter a valid username (your university ID).");
        if (!password) return fail("Enter your password.");
        if (captcha.toLowerCase() !== captchaInput.trim().toLowerCase()) {
            refreshCaptcha();
            return fail("The captcha didn't match. Try the new one.");
        }

        setLoading(true);
        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: user, password }),
            });

            if (response.ok) {
                const userData = await response.json();
                const role = userData?.user?.role;
                // Send the user back to the page that bounced them to login,
                // when it's one their role may open.
                const next = safeNextPath(new URLSearchParams(window.location.search).get("next"), role);
                toast.success("Welcome back!");
                setRedirecting(true);
                router.replace(next ?? roleHome(role));
                return;
            }

            // 400 (bad input), 401 (wrong credentials), 429 (rate limited —
            // likely on campus, where everyone shares one NAT IP) or 500.
            let message = "Login failed. Please try again.";
            try {
                const errorData = await response.json();
                if (errorData?.error) message = errorData.error;
            } catch { /* body wasn't JSON — keep the fallback */ }
            if (response.status === 429) {
                message = "Too many login attempts right now. Please wait a minute and try again.";
            }
            refreshCaptcha();
            fail(message);
        } catch {
            refreshCaptcha();
            fail("Couldn't reach the server. Check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    if (redirecting) {
        return (
            <div className="w-full min-h-screen flex flex-col justify-center items-center gap-4 bg-white">
                <Spinner className="size-12 text-red-900 [animation-duration:1.5s]" />
                <p className="text-sm text-slate-500">Opening your dashboard…</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full grid lg:grid-cols-[1.05fr_1fr] bg-white">
            {/* Brand panel */}
            <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-red-950 via-red-900 to-[rgb(120,0,3)] p-12 text-white">
                <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-40 -left-20 h-[28rem] w-[28rem] rounded-full bg-red-500/20 blur-3xl" />

                <Link href="/" className="relative z-10 flex items-center gap-3 w-fit">
                    <SamamLogo className="h-12 w-12 rounded-xl" />
                    <span className="text-2xl font-extrabold tracking-tight">SAMAM</span>
                </Link>

                <div className="relative z-10 max-w-md">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-200">KL University · Student Activity Center</p>
                    <h1 className="mt-4 text-4xl font-extrabold leading-tight">
                        Your Journey.<br />Your Skills.<br />Your Future.
                    </h1>
                    <ul className="mt-8 space-y-3">
                        {HIGHLIGHTS.map((h) => (
                            <li key={h} className="flex items-start gap-3 text-red-50/90">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-300" />
                                <span className="text-sm leading-relaxed">{h}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="relative z-10 text-xs text-red-200/80">Student Activity Management &amp; Achievement Model</p>
            </aside>

            {/* Form */}
            <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10 sm:px-8">
                <div className="w-full max-w-sm">
                    <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
                        <SamamLogo className="h-10 w-10 rounded-xl" />
                        <span className="text-xl font-extrabold tracking-tight text-red-950">SAMAM</span>
                    </Link>

                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sign in</h2>
                    <p className="mt-1.5 text-sm text-slate-500">Welcome to the SAC Activities Portal.</p>

                    {formError && (
                        <div role="alert" className="mt-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">
                            <LuTriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>{formError}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="mt-6 space-y-5" noValidate>
                        <div className="space-y-1.5">
                            <Label htmlFor="username" className="text-slate-700">Username</Label>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                inputMode="text"
                                autoComplete="username"
                                autoCapitalize="none"
                                spellCheck={false}
                                autoFocus
                                placeholder="University ID, e.g. 2400030188"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                maxLength={11}
                                className="h-11 rounded-lg focus-visible:ring-2 focus-visible:ring-red-900/30 focus-visible:border-red-900"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-slate-700">Password</Label>
                                <button
                                    type="button"
                                    onClick={() => setShowForgotModal(true)}
                                    className="text-xs font-medium text-red-900 hover:text-red-700 hover:underline"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyUp={trackCapsLock}
                                    onKeyDown={trackCapsLock}
                                    onBlur={() => setCapsLock(false)}
                                    required
                                    className="h-11 rounded-lg pr-11 focus-visible:ring-2 focus-visible:ring-red-900/30 focus-visible:border-red-900"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    aria-pressed={showPassword}
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                                >
                                    {showPassword ? <LuEye size={16} /> : <LuEyeClosed size={16} />}
                                </button>
                            </div>
                            {capsLock && (
                                <p className="text-xs font-medium text-amber-700">Caps Lock is on.</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="captcha" className="text-slate-700">Captcha</Label>
                            <div className="flex h-11 overflow-hidden rounded-lg border border-input focus-within:ring-2 focus-within:ring-red-900/30 focus-within:border-red-900">
                                <div
                                    aria-label={`Captcha: ${captcha.split("").join(" ")}`}
                                    className="flex select-none items-center bg-slate-100 px-3 font-mono text-lg tracking-[0.25em] text-slate-800 line-through decoration-slate-400/60"
                                    style={{ WebkitUserSelect: "none", userSelect: "none" }}
                                >
                                    {captcha || "······"}
                                </div>
                                <button
                                    type="button"
                                    onClick={refreshCaptcha}
                                    aria-label="Get a new captcha"
                                    className="flex w-10 items-center justify-center border-l border-input bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                                >
                                    <LuRefreshCw size={15} />
                                </button>
                                <input
                                    id="captcha"
                                    name="captcha"
                                    type="text"
                                    autoComplete="off"
                                    autoCapitalize="none"
                                    spellCheck={false}
                                    placeholder="Type the code"
                                    value={captchaInput}
                                    onChange={(e) => setCaptchaInput(e.target.value)}
                                    onPaste={(e) => e.preventDefault()}
                                    maxLength={6}
                                    className="min-w-0 flex-1 border-l border-input bg-transparent px-3 text-base md:text-sm outline-none placeholder:text-muted-foreground"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="h-11 w-full rounded-lg bg-[rgb(151,0,3)] text-sm font-semibold text-white shadow-md shadow-red-900/20 hover:bg-[rgb(125,0,3)] focus-visible:ring-2 focus-visible:ring-red-900 focus-visible:ring-offset-2"
                        >
                            {loading ? (
                                <span className="inline-flex items-center gap-2">
                                    <Spinner className="size-4" /> Signing in…
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-2">
                                    Sign in <LuArrowRight size={16} />
                                </span>
                            )}
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-sm text-slate-600">
                        Don&apos;t have an account?{" "}
                        <Link href="/auth/register" className="font-semibold text-red-900 hover:text-red-700 hover:underline">
                            Register here
                        </Link>
                    </p>
                </div>
            </main>

            <Dialog open={showForgotModal} onOpenChange={setShowForgotModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogTitle className="text-xl font-bold">Default Password Format</DialogTitle>
                    <div className="space-y-4 text-sm text-gray-700 mt-2">
                        <p>Because email delivery is currently disabled, please use the default password format to log in.</p>
                        <div className="bg-gray-100 p-4 rounded-md space-y-2">
                            <p><strong>Username:</strong> Your ID</p>
                            <p><strong>Password:</strong> Your ID + last 4 digits of phone number</p>
                        </div>
                        <div className="space-y-1">
                            <p className="font-semibold text-gray-900">Example:</p>
                            <ul className="list-disc list-inside space-y-1 ml-1 text-gray-600">
                                <li>If ID is <span className="font-mono bg-gray-100 px-1 rounded">2400030188</span></li>
                                <li>And Phone is <span className="font-mono bg-gray-100 px-1 rounded">1234567890</span></li>
                                <li><strong>Username:</strong> <span className="font-mono bg-red-50 px-1 rounded text-red-900">2400030188</span></li>
                                <li><strong>Password:</strong> <span className="font-mono bg-red-50 px-1 rounded text-red-900">24000301887890</span> <span className="text-xs text-gray-400">(14 digits)</span></li>
                            </ul>
                        </div>
                        <Button className="w-full mt-4 bg-[rgb(151,0,3)] hover:bg-[rgb(125,0,3)]" onClick={() => setShowForgotModal(false)}>Got it</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
