"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function AuthLayout({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
    return (
        <div className="min-h-screen w-full relative overflow-hidden bg-md-surface flex items-center justify-center p-4">
            {/* Background Gradient Mesh (Simplified from Hero) */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-md-secondary-container/40 rounded-full blur-3xl mix-blend-multiply opacity-70" />
                <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] bg-md-tertiary/20 rounded-full blur-3xl mix-blend-multiply opacity-60" />
                <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] bg-md-primary/10 rounded-full blur-3xl mix-blend-multiply opacity-50" />
            </div>

            <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
                <div className="mb-6">
                    <Link href="/" className="inline-flex items-center gap-2 text-md-on-surface-variant hover:text-md-primary transition-colors text-sm font-medium">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>

                <div className="bg-md-surface-container rounded-[28px] p-8 shadow-sm border border-white/20 backdrop-blur-sm relative overflow-hidden">
                    {/* Decorative header glow */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-md-primary via-md-secondary to-md-tertiary opacity-80" />

                    <div className="mb-8 text-center">
                        <h1 className="text-headline-large font-bold text-md-on-surface mb-2 tracking-tight">
                            {title}
                        </h1>
                        <p className="text-body-large text-md-on-surface-variant">
                            {subtitle}
                        </p>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
