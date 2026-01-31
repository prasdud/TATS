import { getAllCandidates } from '@/app/actions/candidates';
import { format } from 'date-fns';
import { ExternalLink, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';

export default async function CandidatesPage() {
    const candidates = await getAllCandidates();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-headline-large font-bold text-md-on-surface">Candidates</h1>
                    <p className="text-body-large text-md-on-surface-variant">
                        All candidates across all your job postings.
                    </p>
                </div>
                <div className="bg-md-primary/10 text-md-primary px-4 py-2 rounded-full font-bold">
                    {candidates.length} Total
                </div>
            </div>

            <div className="bg-md-surface-container-low border border-md-outline/10 rounded-[24px] overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-md-surface-container border-b border-md-outline/10 text-md-on-surface-variant text-sm font-medium">
                            <th className="p-6">Name</th>
                            <th className="p-6">Job Role</th>
                            <th className="p-6">Status</th>
                            <th className="p-6">Date Added</th>
                            <th className="p-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-md-outline/10">
                        {candidates.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-md-on-surface-variant opacity-60">
                                    No candidates found yet.
                                </td>
                            </tr>
                        ) : (
                            candidates.map((candidate) => (
                                <tr key={candidate.id} className="hover:bg-md-surface-container/50 transition-colors">
                                    <td className="p-6">
                                        <div className="font-bold text-md-on-surface">{candidate.name}</div>
                                        <div className="text-sm text-md-on-surface-variant opacity-80">{candidate.email}</div>
                                    </td>
                                    <td className="p-6">
                                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold">
                                            {candidate.jobTitle}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <StatusBadge status={candidate.screeningStatus} />
                                    </td>
                                    <td className="p-6 text-sm text-md-on-surface-variant">
                                        {candidate.createdAt ? format(new Date(candidate.createdAt), 'MMM d, yyyy') : '-'}
                                    </td>
                                    <td className="p-6 text-right">
                                        <a
                                            href={candidate.githubUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 text-sm font-bold text-md-primary hover:underline"
                                        >
                                            View GitHub <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string | null }) {
    if (!status) return <span className="inline-flex items-center gap-1.5 text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full text-xs font-bold"><Loader2 className="w-3 h-3 animate-spin" /> Processing</span>;

    switch (status) {
        case 'looks_fine':
            return <span className="inline-flex items-center gap-1.5 text-green-700 bg-green-100 px-2.5 py-1 rounded-full text-xs font-bold"><CheckCircle2 className="w-3 h-3" /> Looks Fine</span>;
        case 'needs_review':
            return <span className="inline-flex items-center gap-1.5 text-yellow-700 bg-yellow-100 px-2.5 py-1 rounded-full text-xs font-bold"><AlertCircle className="w-3 h-3" /> Needs Review</span>;
        case 'low_effort':
            return <span className="inline-flex items-center gap-1.5 text-red-700 bg-red-100 px-2.5 py-1 rounded-full text-xs font-bold"><XCircle className="w-3 h-3" /> Low Effort</span>;
        default:
            return <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded text-xs font-bold capitalize">{status.replace('_', ' ')}</span>;
    }
}
