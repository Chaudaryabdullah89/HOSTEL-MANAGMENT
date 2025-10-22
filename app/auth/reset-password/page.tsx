"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [passwordReset, setPasswordReset] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setValidating(false);
                setTokenValid(false);
                return;
            }

            try {
                const response = await fetch(`/api/auth/validate-reset-token?token=${token}`);
                const data = await response.json();

                if (response.ok) {
                    setTokenValid(true);
                } else {
                    setTokenValid(false);
                    toast.error(data.error || "Invalid or expired reset link");
                }
            } catch (error) {
                console.error("Token validation error:", error);
                setTokenValid(false);
                toast.error("Failed to validate reset link");
            } finally {
                setValidating(false);
            }
        };

        validateToken();
    }, [token]);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            toast.error("Please fill in all fields");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token,
                    password,
                    confirmPassword
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setPasswordReset(true);
                toast.success("Password reset successfully!");
            } else {
                toast.error(data.error || "Failed to reset password");
            }
        } catch (error) {
            console.error("Reset password error:", error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (validating) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-md w-full space-y-8"
                >
                    <Card className="shadow-lg">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-sm text-gray-600">Validating reset link...</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    if (!tokenValid) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-md w-full space-y-8"
                >
                    <Card className="shadow-lg">
                        <CardHeader className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-gray-900">
                                Invalid Reset Link
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-4">
                                    This password reset link is invalid or has expired.
                                </p>
                                <p className="text-sm text-gray-500">
                                    Please request a new password reset link.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <Button
                                    asChild
                                    className="w-full"
                                >
                                    <Link href="/auth/forgot-password">
                                        Request New Reset Link
                                    </Link>
                                </Button>

                                <Button
                                    asChild
                                    variant="outline"
                                    className="w-full"
                                >
                                    <Link href="/auth/signin">
                                        Back to Sign In
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    if (passwordReset) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-md w-full space-y-8"
                >
                    <Card className="shadow-lg">
                        <CardHeader className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-gray-900">
                                Password Reset Successfully!
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-4">
                                    Your password has been successfully reset.
                                </p>
                                <p className="text-sm text-gray-500">
                                    You can now sign in with your new password.
                                </p>
                            </div>

                            <Button
                                asChild
                                className="w-full"
                            >
                                <Link href="/auth/signin">
                                    Sign In Now
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full space-y-8"
            >
                <Card className="shadow-lg">
                    <CardHeader className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                            <Lock className="h-6 w-6 text-blue-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-900">
                            Reset Your Password
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-2">
                            Enter your new password below.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div>
                                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                    New Password
                                </Label>
                                <div className="mt-1 relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter new password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                                    Confirm New Password
                                </Label>
                                <div className="mt-1 relative">
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Confirm new password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Resetting Password...
                                    </div>
                                ) : (
                                    "Reset Password"
                                )}
                            </Button>
                        </form>

                        <div className="mt-6">
                            <Separator className="my-4" />
                            <div className="text-center">
                                <p className="text-sm text-gray-600">
                                    Remember your password?{" "}
                                    <Link
                                        href="/auth/signin"
                                        className="font-medium text-blue-600 hover:text-blue-500"
                                    >
                                        Sign in here
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
