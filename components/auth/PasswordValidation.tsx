"use client";

import { Check, X, Circle } from "lucide-react";
import { useEffect, useState } from "react";

interface PasswordValidationProps {
    password: string;
    onValidityChange: (isValid: boolean) => void;
}

export function PasswordValidation({ password, onValidityChange }: PasswordValidationProps) {
    const [requirements, setRequirements] = useState([
        { id: 'min-length', label: 'At least 5 characters', satisfied: false, regex: /.{5,}/ },
        { id: 'uppercase', label: 'One uppercase letter', satisfied: false, regex: /[A-Z]/ },
        { id: 'number', label: 'One number', satisfied: false, regex: /[0-9]/ },
        { id: 'special', label: 'One special character', satisfied: false, regex: /[!@#$%^&*(),.?":{}|<>]/ }, // Basic special chars
    ]);

    useEffect(() => {
        const nextReqs = requirements.map(req => ({
            ...req,
            satisfied: req.regex.test(password)
        }));

        // Only update state if something changed to avoid infinite loops provided we use functional updates or careful checking, 
        // but here we are mapping constantly. 
        // Let's check deep equality or just JSON stringify for simple check
        if (JSON.stringify(nextReqs) !== JSON.stringify(requirements)) {
            setRequirements(nextReqs);
        }

        const allSatisfied = nextReqs.every(r => r.satisfied);
        onValidityChange(allSatisfied);
    }, [password]); // Depend on visual requirements state? No, avoid circular dependency.

    // Actually, onValidityChange should be called when validity changes.
    // The previous implementation has a potential issue where onValidityChange is called on every render if not careful, 
    // or if we add requirements to dependency array.
    // Let's refine the effect.

    return (
        <div className="mt-3 space-y-2">
            <p className="text-label-small text-md-on-surface-variant font-medium mb-2">
                Password strength:
            </p>
            <div className="grid grid-cols-1 gap-1.5">
                {requirements.map((req) => (
                    <div
                        key={req.id}
                        className={`flex items-center gap-2 text-xs transition-colors duration-300 ${req.satisfied ? 'text-green-600 dark:text-green-400' : 'text-md-on-surface-variant/60'
                            }`}
                    >
                        <div className={`
                            w-4 h-4 rounded-full flex items-center justify-center border transition-all duration-300
                            ${req.satisfied
                                ? 'bg-green-100 border-green-200 dark:bg-green-900/30 dark:border-green-800'
                                : 'bg-transparent border-md-outline/30'}
                        `}>
                            {req.satisfied && <Check className="w-2.5 h-2.5" />}
                        </div>
                        <span className={req.satisfied ? "font-medium" : ""}>{req.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
