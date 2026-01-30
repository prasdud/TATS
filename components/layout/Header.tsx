"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export function Header() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? "bg-md-surface/80 backdrop-blur-md border-b border-md-outline/10 shadow-sm"
                : "bg-transparent"
                }`}
        >
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="text-xl font-bold text-md-on-surface">
                    TATS
                </Link>
                <div className="flex items-center gap-4">
                    <Link
                        href="/login"
                        className="px-6 py-2 rounded-full border border-md-outline text-md-primary font-medium hover:bg-md-primary/10 transition-colors duration-200"
                    >
                        Login
                    </Link>
                    <Link
                        href="/signup"
                        className="px-6 py-2 rounded-full bg-md-primary text-md-on-primary font-medium hover:bg-md-primary/90 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        Sign up
                    </Link>
                </div>
            </div>
        </header>
    );
}
