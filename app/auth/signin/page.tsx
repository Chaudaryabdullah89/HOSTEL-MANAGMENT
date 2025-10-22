// File: SigninPage.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Mail } from "lucide-react";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useContext } from "react";
import { SessionContext } from "../../context/sessiondata";
import Link from "next/link";

export default function SigninPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const sessionCtx = useContext(SessionContext);
  const setSession = sessionCtx && "setSession" in sessionCtx ? sessionCtx.setSession : undefined;

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter your email and password");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Login successful");
        // console.log("Login response data:", data);
        // console.log("User role:", data?.user?.role);

        // Defensive: update session context only if setSession is available
        if (setSession) {
          setSession({
            loggedIn: true,
            user: data.user,
            error: null
          });
        }

        // Redirect to dashboard - middleware will handle role-based routing
        setTimeout(() => {
          router.push("/dashboard");
        }, 200);
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (err) {
      toast.error("Network error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg border border-gray-200 rounded-2xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-semibold">
              Welcome Back
            </CardTitle>
            <p className="text-sm text-gray-500">Sign in to your account</p>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSignin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
              <Link href="/auth/forgot-password" className="hover:underline">
                Forgot password?
              </Link>
              <Link href="/auth/signup" className="text-primary hover:underline">
                Create account
              </Link>
            </div>

            {/* Divider */}
            <div className="relative">
              <Separator className="my-6" />
              <div className="absolute inset-x-0 -top-3 text-center">
                <span className="bg-white px-3 text-gray-400 text-sm">
                  or continue with
                </span>
              </div>
            </div>

            {/* Social Login */}
            <div className="flex gap-3">
              <Button variant="outline" className="w-full">
                <Mail className="w-4 h-4 mr-2" /> Google
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
