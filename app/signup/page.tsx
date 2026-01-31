"use client";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { PasswordValidation } from "@/components/auth/PasswordValidation";
import Link from "next/link";
import { useState, useActionState } from "react";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { signup } from "@/app/actions/auth";

export default function Signup() {
    const [state, formAction, isPending] = useActionState(signup, undefined);
    const [showPassword, setShowPassword] = useState(false);
    const [isPasswordValid, setIsPasswordValid] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [emailError, setEmailError] = useState("");

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length <= 20) {
            setFormData({ ...formData, name: e.target.value });
        }
    };

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Client-side prevent submit if invalid
    const isFormValid = formData.name && !emailError && isPasswordValid && validateEmail(formData.email);

    return (
        <AuthLayout
            title="Create an account"
            subtitle="Start your improved hiring with TATS"
        >
            <form action={formAction} className="space-y-5">
                {/* Name Field */}
                <div className="space-y-1.5">
                    <label className="text-label-medium text-md-on-surface font-medium ml-1">
                        Full Name
                    </label>
                    <div className="relative">
                        <input
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleNameChange}
                            maxLength={20}
                            className="w-full h-14 px-4 bg-md-surface-container-low rounded-t-lg border-b-2 border-md-outline/40 focus:outline-none focus:border-md-primary transition-colors text-md-on-surface"
                            placeholder="John Doe"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-md-on-surface-variant/50">
                            {formData.name.length}/20
                        </div>
                    </div>
                </div>

                {/* Email Field */}
                <div className="space-y-1.5">
                    <label className="text-label-medium text-md-on-surface font-medium ml-1">
                        Email Address
                    </label>
                    <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value });
                            if (emailError) setEmailError("");
                        }}
                        onBlur={() => {
                            if (formData.email && !validateEmail(formData.email)) {
                                setEmailError("Please enter a valid email address");
                            }
                        }}
                        className={`
                            w-full h-14 px-4 bg-md-surface-container-low rounded-t-lg border-b-2 
                            focus:outline-none focus:border-md-primary transition-colors text-md-on-surface
                            ${emailError ? 'border-red-500 bg-red-50/50' : 'border-md-outline/40'}
                        `}
                        placeholder="john@example.com"
                    />
                    {emailError && (
                        <p className="text-xs text-red-500 ml-1 animate-in slide-in-from-top-1">{emailError}</p>
                    )}
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

                    <PasswordValidation
                        password={formData.password}
                        onValidityChange={setIsPasswordValid}
                    />
                </div>

                {state && (
                    <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <p>{state}</p>
                    </div>
                )}

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isPending || !isFormValid}
                        className="w-full h-12 rounded-full bg-md-primary text-md-on-primary font-bold text-label-large hover:bg-md-primary/90 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isPending && <Loader2 className="w-5 h-5 animate-spin" />}
                        Create Account
                    </button>
                </div>

                <div className="text-center">
                    <p className="text-body-medium text-md-on-surface-variant">
                        Already have an account?{" "}
                        <Link href="/login" className="text-md-primary font-bold hover:underline">
                            Log in
                        </Link>
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
}
