import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-[70vh] flex items-center justify-center p-6">
            <div className="text-center max-w-lg mx-auto">
                <div className="relative mb-12">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-md-error/20 rounded-full blur-3xl pointer-events-none" />
                    <h1 className="text-[12rem] font-bold text-md-on-surface/5 select-none text-md-primary/10">
                        404
                    </h1>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-display-large font-bold text-md-on-surface">
                        Oops!
                    </div>
                </div>

                <h2 className="text-headline-medium font-bold text-md-on-surface mb-4">
                    Page not found
                </h2>

                <p className="text-body-large text-md-on-surface-variant mb-10">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>

                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-md-primary text-md-on-primary font-medium hover:bg-md-primary/90 active:scale-95 transition-all shadow-lg"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
