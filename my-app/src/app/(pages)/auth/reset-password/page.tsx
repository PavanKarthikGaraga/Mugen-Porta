"use client"
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { FiLock, FiEye, FiEyeOff, FiArrowLeft, FiCheck } from "react-icons/fi";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ResetPasswordContent() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tokenValid, setTokenValid] = useState(null);
    const [resetSuccess, setResetSuccess] = useState(false);

    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const verifyToken = useCallback(async () => {
        try {
            const response = await fetch('/api/auth/verify-reset-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            });

            if (response.ok) {
                setTokenValid(true);
            } else {
                setTokenValid(false);
                const data = await response.json();
                toast.error(data.message || "Invalid or expired reset link");
            }
        } catch (error) {
            console.error('Token verification error:', error);
            setTokenValid(false);
            toast.error("Failed to verify reset link");
        }
    }, [token]);

    useEffect(() => {
        if (!token) {
            setTokenValid(false);
            toast.error("Invalid reset link. Please request a new password reset.");
        } else {
            // Verify token validity
            verifyToken();
        }
    }, [token, verifyToken]);

    const validatePassword = (password) => {
        if (password.length < 8) {
            return "Password must be at least 8 characters long";
        }
        if (!/[A-Z]/.test(password)) {
            return "Password must contain at least one uppercase letter";
        }
        if (!/[a-z]/.test(password)) {
            return "Password must contain at least one lowercase letter";
        }
        if (!/\d/.test(password)) {
            return "Password must contain at least one number";
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            toast.error("Please fill in all fields");
            return;
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            toast.error(passwordError);
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    password,
                    confirmPassword
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setResetSuccess(true);
                toast.success("Password reset successfully!");
            } else {
                toast.error(data.message || "Failed to reset password");
            }
        } catch (error) {
            console.error('Reset password error:', error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (tokenValid === null) {
        return (
            <div className="w-full h-screen flex flex-col justify-center items-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black-800"></div>
                <p className="mt-4 text-gray-600">Verifying reset link...</p>
            </div>
        );
    }

    if (tokenValid === false) {
        return (
            <div className="w-full h-screen flex flex-col justify-center items-center bg-gray-50">
                <div className="max-w-md w-full mx-4 text-center">
                    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                        <div className="mb-6">
                            {/* <div className="mx-auto w-16 h-16 bg-black rounded-full flex items-center justify-center mb-4">
                                <FiLock className="text-black-600" size={24} />
                            </div> */}
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Reset Link</h2>
                            <p className="text-gray-600">
                                This password reset link is invalid or has expired.
                            </p>
                        </div>

                        <Link
                            href="/auth/forget-password"
                            className="inline-flex items-center justify-center w-full px-4 py-2 bg-black text-white rounded-md hover:bg-black-900 transition-colors mb-4"
                        >
                            Request New Reset Link
                        </Link>

                        <Link
                            href="/auth/login"
                            className="inline-flex items-center text-black hover:text-black-900 font-medium"
                        >
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (resetSuccess) {
        return (
            <div className="w-full h-screen flex flex-col justify-center items-center bg-gray-50">
                <div className="max-w-md w-full mx-4 text-center">
                    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                        <div className="mb-6">
                            {/* <div className="mx-auto w-16 h-16 bg-black rounded-full flex items-center justify-center mb-4">
                                <FiCheck className="text-black-600" size={24} />
                            </div> */}
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Password Reset Successful</h2>
                            <p className="text-gray-600">
                                Your password has been successfully reset. You can now log in with your new password.
                            </p>
                        </div>

                        <Link
                            href="/auth/login"
                            className="inline-flex items-center justify-center w-full px-4 py-2 bg-black text-white rounded-md hover:bg-black-900 transition-colors mb-4"
                        >
                            Go to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen flex flex-col justify-center items-center bg-gray-50">
            <div className="max-w-md w-full mx-4">
                {/* Back to login link */}
                <Link
                    href="/auth/login"
                    className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
                >
                    <FiArrowLeft className="mr-2" size={16} />
                    Back to Login
                </Link>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
                    <p className="text-gray-600">
                        Enter your new password below.
                    </p>
                </div>

                {/* Reset Password Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-center">Set New Password</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* New Password Input */}
                            <div>
                                <Label htmlFor="password" className="block text-sm font-medium mb-2">
                                    New Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pr-10"
                                    placeholder="Enter new password"
                                    required
                                    disabled={loading}
                                    minLength={8}
                                />
                                <Button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    variant="ghost"
                                    size="sm"
                                    className="absolute inset-y-0 right-0 h-full px-3"
                                >
                                    {showPassword ? (
                                        <FiEyeOff className="text-gray-400 hover:text-gray-600" size={18} />
                                    ) : (
                                        <FiEye className="text-gray-400 hover:text-gray-600" size={18} />
                                    )}
                                </Button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Must be at least 8 characters with uppercase, lowercase, and number
                            </p>
                        </div>

                            {/* Confirm Password Input */}
                            <div>
                                <Label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                                    Confirm New Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pr-10"
                                        placeholder="Confirm new password"
                                        required
                                        disabled={loading}
                                        minLength={8}
                                    />
                                    <Button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        variant="ghost"
                                        size="sm"
                                        className="absolute inset-y-0 right-0 h-full px-3"
                                    >
                                        {showConfirmPassword ? (
                                            <FiEyeOff className="text-gray-400 hover:text-gray-600" size={18} />
                                        ) : (
                                            <FiEye className="text-gray-400 hover:text-gray-600" size={18} />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-black hover:bg-gray-900"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Resetting...
                                    </>
                                ) : (
                                    "Reset Password"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center mt-8 text-sm text-gray-500">
                    <p>Remember your password?
                        <Link href="/auth/login" className="text-black hover:text-black-900 font-medium ml-1">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function ResetPassword() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-800 mx-auto"></div>
                            <p className="mt-2 text-gray-600">Loading...</p>
                        </div>
                    </div>
                </div>
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}