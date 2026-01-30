"use client";

import { GrapheneModel } from "./GrapheneModel";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";



export function Hero() {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <section className="relative overflow-hidden pt-16 pb-32 md:pb-48">
            {/* Background Gradient Mesh */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute -top-10 right-0 w-[800px] h-[800px] bg-md-secondary-container/30 rounded-full blur-3xl mix-blend-multiply opacity-70" />
                <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-md-tertiary/20 rounded-full blur-3xl mix-blend-multiply opacity-60" />
            </div>

            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

                    {/* Left Content */}
                    <div className="flex flex-col items-start text-left -mt-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-md-secondary-container text-md-on-secondary-container text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-md-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-md-primary"></span>
                            </span>
                            Now Live for Beta Testing
                        </div>

                        <h1 className="text-display-large font-bold text-md-on-surface mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                            Intelligent Triage <br />
                            for Technical <br />
                            <span className="text-md-primary">Assessments</span>
                        </h1>

                        <p className="text-headline-medium text-md-on-surface-variant mb-12 max-w-lg animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                            Empower non-technical HR managers to accurately assess technical talent. Hire the right engineers without needing to be an expert in code.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 w-full sm:w-auto">
                            <Link
                                href="/signup"
                                className="w-full sm:w-auto px-10 py-5 rounded-full bg-md-primary text-md-on-primary font-bold text-lg hover:bg-md-primary/90 active:scale-95 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                            >
                                Start free triage
                            </Link>
                            <Link
                                href="#how-it-works"
                                className="w-full sm:w-auto px-10 py-5 rounded-full bg-md-surface-container text-md-primary font-bold text-lg hover:bg-md-surface-container-high transition-colors flex items-center justify-center gap-2 active:scale-95"
                            >
                                Watch demo
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>

                        <div className="mt-12 text-sm font-medium text-md-on-surface-variant opacity-80">
                            Join 50,000+ teams already using TATS
                        </div>
                    </div>

                    {/* Right Visual (Abstract Representation) */}
                    {/* Right Visual (Abstract Representation) */}
                    <div className="relative hidden lg:block h-[600px] w-full mt-12 animate-in fade-in zoom-in duration-1000 delay-300">
                        <GrapheneModel className="w-full h-full" />
                    </div>

                </div>
            </div>
        </section>
    );
}
