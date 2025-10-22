"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const router = useRouter();

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error("Please enter your email address");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setEmailSent(true);
                toast.success("Password reset link sent to your email!");
            } else {
                toast.error(data.error || "Failed to send reset link");
            }
        } catch (error) {
            console.error("Forgot password error:", error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (emailSent) {
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
                                Check Your Email
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-4">
                                    We've sent a password reset link to:
                                </p>
                                <p className="font-medium text-gray-900">{email}</p>
                                <p className="text-sm text-gray-500 mt-4">
                                    Please check your email and click the link to reset your password.
                                    The link will expire in 1 hour.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <Button
                                    onClick={() => {
                                        setEmailSent(false);
                                        setEmail("");
                                    }}
                                    variant="outline"
                                    className="w-full"
                                >
                                    <Mail className="w-4 h-4 mr-2" />
                                    Send Another Email
                                </Button>

                                <Button
                                    asChild
                                    variant="ghost"
                                    className="w-full"
                                >
                                    <Link href="/auth/signin">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
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
                            <Mail className="h-6 w-6 text-blue-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-900">
                            Forgot Password?
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-2">
                            No worries! Enter your email address and we'll send you a link to reset your password.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleForgotPassword} className="space-y-6">
                            <div>
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter your email address"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Sending Reset Link...
                                    </div>
                                ) : (
                                    "Send Reset Link"
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
