"use client";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { PasswordValidation } from "@/components/auth/PasswordValidation";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function Signup() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isPasswordValid, setIsPasswordValid] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [errors, setErrors] = useState({
        name: "",
        email: ""
    });

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val.length <= 20) {
            setFormData({ ...formData, name: val });
            if (errors.name) setErrors({ ...errors, name: "" });
        } else {
            // Optional: Show error if they try to type more, or just limit it
            setErrors({ ...errors, name: "Name cannot exceed 20 characters" });
        }
    };

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation before submit
        let hasError = false;
        const newErrors = { name: "", email: "" };

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
            hasError = true;
        }

        if (!validateEmail(formData.email)) {
            newErrors.email = "Please enter a valid email address";
            hasError = true;
        }

        if (!isPasswordValid) {
            // Should be blocked by UI but just in case
            hasError = true;
        }

        setErrors(newErrors);

        if (hasError) return;

        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            console.log("Signup with:", formData);
            // Navigate or show success
        }, 1500);
    };

    return (
        <AuthLayout
            title="Create an account"
            subtitle="Start your improved hiring with TATS"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Field */}
                <div className="space-y-1.5">
                    <label className="text-label-medium text-md-on-surface font-medium ml-1">
                        Full Name
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={formData.name}
                            onChange={handleNameChange}
                            maxLength={20}
                            className={`
                                w-full h-14 px-4 bg-md-surface-container-low rounded-t-lg border-b-2 
                                focus:outline-none focus:border-md-primary transition-colors text-md-on-surface
                                ${errors.name ? 'border-red-500 bg-red-50/50' : 'border-md-outline/40'}
                            `}
                            placeholder="John Doe"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-md-on-surface-variant/50">
                            {formData.name.length}/20
                        </div>
                    </div>
                    {errors.name && (
                        <p className="text-xs text-red-500 ml-1">{errors.name}</p>
                    )}
                </div>

                {/* Email Field */}
                <div className="space-y-1.5">
                    <label className="text-label-medium text-md-on-surface font-medium ml-1">
                        Email Address
                    </label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value });
                            // Clear error on change to avoid annoyance, validation happens on blur or submit
                            if (errors.email) setErrors({ ...errors, email: "" });
                        }}
                        onBlur={() => {
                            if (formData.email && !validateEmail(formData.email)) {
                                setErrors({ ...errors, email: "Please enter a valid email address (e.g., user@domain.com)" });
                            }
                        }}
                        className={`
                            w-full h-14 px-4 bg-md-surface-container-low rounded-t-lg border-b-2 
                            focus:outline-none focus:border-md-primary transition-colors text-md-on-surface
                            ${errors.email ? 'border-red-500 bg-red-50/50' : 'border-md-outline/40'}
                        `}
                        placeholder="john@example.com"
                    />
                    {errors.email && (
                        <p className="text-xs text-red-500 ml-1 animate-in slide-in-from-top-1">{errors.email}</p>
                    )}
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

                    <PasswordValidation
                        password={formData.password}
                        onValidityChange={setIsPasswordValid}
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isLoading || !isPasswordValid || !formData.name || !formData.email}
                        className="w-full h-12 rounded-full bg-md-primary text-md-on-primary font-bold text-label-large hover:bg-md-primary/90 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
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
