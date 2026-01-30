import Link from "next/link";
import { Github, Linkedin } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-md-surface-container py-12 text-md-on-surface-variant">
            <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-col items-center md:items-start gap-2">
                    <p className="font-medium text-md-on-surface">Muhammed Abdul Muid</p>
                    <p className="text-sm opacity-80">Fullstack Assignment</p>
                </div>

                <div className="flex items-center gap-6">
                    <Link
                        href="https://github.com/prasdud"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full hover:bg-md-on-surface/10 transition-colors"
                        aria-label="GitHub Profile"
                    >
                        <Github className="w-5 h-5" />
                    </Link>
                    <Link
                        href="https://linkedin.com/in/mabdulmuid"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full hover:bg-md-on-surface/10 transition-colors"
                        aria-label="LinkedIn Profile"
                    >
                        <Linkedin className="w-5 h-5" />
                    </Link>
                </div>

                <div className="text-sm opacity-60">
                    © {new Date().getFullYear()} TATS
                </div>
            </div>
        </footer>
    );
}
