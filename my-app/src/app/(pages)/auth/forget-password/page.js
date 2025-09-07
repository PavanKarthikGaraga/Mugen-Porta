"use client"
import { useState } from "react";
import { toast } from "react-hot-toast";
import { FiMail, FiArrowLeft } from "react-icons/fi";
import Link from "next/link";

export default function ForgetPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !email.includes('@')) {
            toast.error("Please enter a valid email address");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/forget-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setEmailSent(true);
                toast.success("Password reset link sent to your email!");
            } else {
                toast.error(data.message || "Failed to send reset email");
            }
        } catch (error) {
            console.error('Forget password error:', error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
                    <p className="text-gray-600">
                        Enter your email address and we&apos;ll send you a link to reset your password.
                    </p>
                </div>

                {!emailSent ? (
                    /* Forget Password Form */
                    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                        <div className="space-y-6">
                            {/* Email Input */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiMail className="text-gray-400" size={18} />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                                        placeholder="Enter your email"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-black text-white py-3 px-4 rounded-md  focus:outline-none focus:ring-2 focus:ring-red-800 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending...
                                    </>
                                ) : (
                                    "Send Reset Link"
                                )}
                            </button>
                        </div>
                    </form>
                ) : (
                    /* Success Message */
                    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 text-center">
                        <div className="mb-6">
                            {/* <div className="mx-auto w-16 h-16 bg-black rounded-full flex items-center justify-center mb-4">
                                <FiMail className="text-green-600" size={24} />
                            </div> */}
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Check Your Email</h2>
                            <p className="text-gray-600">
                                We&apos;ve sent a password reset link to <strong>{email}</strong>
                            </p>
                        </div>

                        <div className="text-sm text-gray-500 mb-6">
                            <p>Didn&apos;t receive the email? Check your spam folder or</p>
                            <button
                                onClick={() => setEmailSent(false)}
                                className="text-red-800 hover:text-red-900 font-medium underline"
                            >
                                try again
                            </button>
                        </div>

                        <Link
                            href="/auth/login"
                            className="inline-flex items-center justify-center w-full px-4 py-2 bg-black text-white rounded-md  transition-colors"
                        >
                            Back to Login
                        </Link>
                    </div>
                )}

                {/* Footer */}
                <div className="text-center mt-8 text-sm text-gray-500">
                    <p>Remember your password?
                        <Link href="/auth/login" className="text-red-800 hover:text-red-900 font-medium ml-1">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
