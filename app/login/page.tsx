"use client";

import { AuthLayout } from "@/components/auth/AuthLayout";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function Login() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email || !formData.password) return;

        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            console.log("Login with:", formData);
        }, 1500);
    };

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Log in to access your triage dashboard"
        >
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Email Field */}
                <div className="space-y-1.5">
                    <label className="text-label-medium text-md-on-surface font-medium ml-1">
                        Email Address
                    </label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isLoading || !formData.email || !formData.password}
                        className="w-full h-12 rounded-full bg-md-primary text-md-on-primary font-bold text-label-large hover:bg-md-primary/90 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
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
