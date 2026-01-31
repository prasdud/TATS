"use client";

import { AuthLayout } from "@/components/auth/AuthLayout";
import Link from "next/link";
import { useState, useActionState } from "react";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { authenticate } from "@/app/actions/auth";

export default function Login() {
    const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);
    const [showPassword, setShowPassword] = useState(false);

    // Controlled inputs for disable logic
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Log in to access your triage dashboard"
        >
            <form action={formAction} className="space-y-6">

                {/* Email Field */}
                <div className="space-y-1.5">
                    <label className="text-label-medium text-md-on-surface font-medium ml-1">
                        Email Address
                    </label>
                    <input
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-14 px-4 bg-md-surface-container-low rounded-t-lg border-b-2 border-md-outline/40 focus:outline-none focus:border-md-primary transition-colors text-md-on-surface"
                        placeholder="john@example.com"
                    />
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                    <label className="text-label-medium text-md-on-surface font-medium ml-1">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-14 px-4 bg-md-surface-container-low rounded-t-lg border-b-2 border-md-outline/40 focus:outline-none focus:border-md-primary transition-colors text-md-on-surface pr-12"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-md-on-surface-variant hover:text-md-primary transition-colors p-2"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {errorMessage && (
                    <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <p>{errorMessage}</p>
                    </div>
                )}

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isPending || !email || !password}
                        className="w-full h-12 rounded-full bg-md-primary text-md-on-primary font-bold text-label-large hover:bg-md-primary/90 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isPending && <Loader2 className="w-5 h-5 animate-spin" />}
                        Log In
                    </button>
                </div>

                <div className="text-center">
                    <p className="text-body-medium text-md-on-surface-variant">
                        Don't have an account?{" "}
                        <Link href="/signup" className="text-md-primary font-bold hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
}
