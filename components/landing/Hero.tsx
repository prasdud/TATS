import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";

export function Hero() {
    return (
        <section className="relative overflow-hidden pt-24 pb-32 md:pb-48">
            {/* Background Gradient Mesh */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute -top-10 right-0 w-[800px] h-[800px] bg-md-secondary-container/30 rounded-full blur-3xl mix-blend-multiply opacity-70" />
                <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-md-tertiary/20 rounded-full blur-3xl mix-blend-multiply opacity-60" />
            </div>

            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Left Content */}
                    <div className="flex flex-col items-start text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-md-secondary-container text-md-on-secondary-container text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-md-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-md-primary"></span>
                            </span>
                            Now Live for Beta Testing
                        </div>

                        <h1 className="text-display-large font-bold text-md-on-surface mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                            Transform the <br />
                            way your team <br />
                            <span className="text-md-primary">works</span>
                        </h1>

                        <p className="text-headline-medium text-md-on-surface-variant mb-12 max-w-lg animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                            Technical Assessment Triage System brings your hiring team together with powerful tools designed to streamline workflows.
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
                            Join 50,000+ teams already using Triage System
                        </div>
                    </div>

                    {/* Right Visual (Abstract Representation) */}
                    <div className="relative hidden lg:block h-[600px] w-full animate-in fade-in zoom-in duration-1000 delay-300">
                        {/* Sharper, less blurry shapes */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-md-primary rounded-[40px] rotate-12 opacity-80 mix-blend-multiply" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/3 -translate-y-1/3 w-[450px] h-[450px] bg-md-tertiary rounded-[60px] -rotate-6 opacity-80 mix-blend-multiply" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-2/3 -translate-y-2/3 w-[400px] h-[400px] bg-md-secondary-container rounded-full opacity-90 mix-blend-multiply" />

                        {/* Removed the glassmorphism card overlay as requested */}
                    </div>

                </div>
            </div>
        </section>
    );
}
