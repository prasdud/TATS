'use client';

import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

interface JobSelectorProps {
    jobs: { id: number; title: string }[];
    currentJobId: number;
}

export function JobSelector({ jobs, currentJobId }: JobSelectorProps) {
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const jobId = e.target.value;
        router.push(`/dashboard/triage?jobId=${jobId}`);
    };

    return (
        <div className="relative group">
            <select
                value={currentJobId}
                onChange={handleChange}
                className="appearance-none bg-md-surface-container-high pl-4 pr-10 py-2 rounded-lg font-bold text-md-on-surface border border-md-outline/10 focus:border-md-primary outline-none cursor-pointer hover:bg-md-surface-container-highest transition-colors min-w-[200px]"
            >
                {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                        {job.title}
                    </option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-md-on-surface-variant pointer-events-none group-hover:text-md-primary transition-colors" />
        </div>
    );
}
