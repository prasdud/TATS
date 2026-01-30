import { GitBranch, Shield, Zap, Search, Fingerprint, Clock } from "lucide-react";

const features = [
    {
        icon: GitBranch,
        title: "Repo Hygiene",
        description: "Automatically analyze commit history, README quality, and structure depth.",
    },
    {
        icon: Search,
        title: "Smart Matching",
        description: "Compare resume keyword overlap with job descriptions instantly.",
    },
    {
        icon: Zap,
        title: "AI Explanations",
        description: "Get plain-English summaries of technical signals for non-tech recruiters.",
    },
    {
        icon: Shield,
        title: "Data Privacy",
        description: "Candidate data is processed securely and never shared publicly.",
    },
    {
        icon: Fingerprint,
        title: "Anti-Cheating",
        description: "Flag suspicious commit patterns that might indicate copy-pasting.",
    },
    {
        icon: Clock,
        title: "Fast Triage",
        description: "Screen candidates in seconds instead of minutes.",
    },
];

export function Features() {
    return (
        <section id="features" className="py-32 bg-md-surface relative">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-display-large font-bold text-md-on-surface mb-6">
                        Capabilities
                    </h2>
                    <p className="text-headline-medium text-md-on-surface-variant opacity-80">
                        Everything you need to build faster and better.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, i) => (
                        <div
                            key={i}
                            className="p-10 rounded-3xl bg-md-surface-container-low hover:bg-md-primary/5 transition-all duration-300 group cursor-default"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-md-primary/10 text-md-primary flex items-center justify-center mb-8 border border-md-primary/10">
                                <feature.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-headline-medium font-bold text-md-on-surface mb-4">
                                {feature.title}
                            </h3>
                            <p className="text-body-large text-md-on-surface-variant leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
