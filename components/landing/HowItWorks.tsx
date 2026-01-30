import { ArrowRight } from "lucide-react";

const steps = [
    {
        number: "1",
        title: "Upload Data",
        description: "Upload the Job Description (JD) for the role and a CSV/Excel file of candidates.",
    },
    {
        number: "2",
        title: "Start Triage",
        description: "The system processes the data, analyzing resumes against the JD and checking repo hygiene.",
    },
    {
        number: "3",
        title: "View Analytics",
        description: "View comprehensive analytics to see who to shortlist and who performed well.",
    },
];

export function HowItWorks() {
    return (
        <section id="how-it-works" className="py-32 bg-md-surface border-t border-md-outline/10">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-24">
                    <h2 className="text-display-large font-bold text-md-on-surface mb-6">
                        How TATS works
                    </h2>
                    <p className="text-headline-medium text-md-on-surface-variant opacity-80">
                        Get up and running in minutes, not days.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {steps.map((step, i) => (
                        <div key={i} className="flex flex-col items-center text-center group">
                            <div className="w-20 h-20 rounded-full bg-md-tertiary/20 text-md-tertiary flex items-center justify-center text-4xl font-bold mb-10 shadow-lg shadow-md-tertiary/10 group-hover:scale-110 transition-transform duration-300">
                                {step.number}
                            </div>

                            <div className="w-full h-full p-10 bg-md-surface-container rounded-3xl hover:shadow-xl transition-shadow duration-300">
                                <h3 className="text-headline-medium font-bold text-md-on-surface mb-4">
                                    {step.title}
                                </h3>
                                <p className="text-body-large text-md-on-surface-variant leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
