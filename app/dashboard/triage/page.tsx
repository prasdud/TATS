import { getTriageData, getTriageJobs } from '@/app/actions/triage';
import { Loader2, CheckCircle2, AlertCircle, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { JobSelector } from './_components/JobSelector';

interface PageProps {
    searchParams: Promise<{ jobId?: string }>;
}

export default async function TriagePage({ searchParams }: PageProps) {
    const params = await searchParams;
    const jobId = params.jobId ? parseInt(params.jobId) : undefined;

    // Fetch data in parallel
    const [triageData, jobs] = await Promise.all([
        getTriageData(jobId),
        getTriageJobs()
    ]);

    if (!triageData || jobs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="bg-md-surface-container rounded-[24px] p-8 max-w-md border border-md-outline/10">
                    <h2 className="text-display-small font-bold text-md-on-surface mb-2">No Active Triage</h2>
                    <p className="text-md-on-surface-variant mb-6">You haven't created any jobs or added candidates yet.</p>
                    <Link
                        href="/dashboard/jobs"
                        className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-md-primary text-md-on-primary font-bold hover:bg-md-primary/90 transition-all"
                    >
                        Create a Job
                    </Link>
                </div>
            </div>
        );
    }

    const { job, candidates } = triageData;
    const totalCandidates = candidates.length;

    // Group candidates by status
    const looksFine = candidates.filter(c => c.screeningStatus === 'looks_fine');
    const needsReview = candidates.filter(c => c.screeningStatus === 'needs_review');
    const lowEffort = candidates.filter(c => c.screeningStatus === 'low_effort');
    const pending = candidates.filter(c => !c.screeningStatus);

    return (
        <div className="space-y-8">
            {/* Header / Status Bar */}
            <div className="bg-md-surface-container rounded-[24px] p-6 border border-md-outline/10 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-md-primary/10 text-md-primary px-2 py-0.5 rounded text-sm font-bold tracking-wider">TRIAGE FOR</span>
                        <JobSelector jobs={jobs} currentJobId={job.id} />
                    </div>
                    <div className="flex items-baseline gap-4">
                        <p className="text-md-on-surface-variant line-clamp-1 opacity-80 max-w-2xl">{job.description}</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-display-small font-bold text-md-on-surface leading-none">{totalCandidates}</p>
                        <p className="text-sm font-medium text-md-on-surface-variant">Candidates</p>
                    </div>
                </div>
            </div>

            {/* Triage Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Looks Fine Column */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b-2 border-green-500 pb-2">
                        <h3 className="font-bold text-green-700 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5" /> Looks Fine
                        </h3>
                        <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded-full">{looksFine.length}</span>
                    </div>
                    {looksFine.map(c => <CandidateCard key={c.id} candidate={c} />)}
                    {looksFine.length === 0 && <EmptyState />}
                </div>

                {/* Needs Review Column */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b-2 border-yellow-500 pb-2">
                        <h3 className="font-bold text-yellow-700 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" /> Needs Review
                        </h3>
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full">{needsReview.length}</span>
                    </div>
                    {needsReview.map(c => <CandidateCard key={c.id} candidate={c} />)}
                    {needsReview.length === 0 && <EmptyState />}
                </div>

                {/* Low Effort Column */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b-2 border-red-500 pb-2">
                        <h3 className="font-bold text-red-700 flex items-center gap-2">
                            <XCircle className="w-5 h-5" /> Low Effort
                        </h3>
                        <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-0.5 rounded-full">{lowEffort.length}</span>
                    </div>
                    {lowEffort.map(c => <CandidateCard key={c.id} candidate={c} />)}
                    {lowEffort.length === 0 && <EmptyState />}
                </div>

                {/* Pending Column */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b-2 border-gray-300 pb-2">
                        <h3 className="font-bold text-gray-500 flex items-center gap-2">
                            <Clock className="w-5 h-5" /> Pending
                        </h3>
                        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">{pending.length}</span>
                    </div>
                    {pending.map(c => <CandidateCard key={c.id} candidate={c} isPending />)}
                    {pending.length === 0 && <EmptyState />}
                </div>
            </div>
        </div>
    );
}

function CandidateCard({ candidate, isPending }: { candidate: any, isPending?: boolean }) {
    return (
        <div className={`
            p-4 rounded-xl border bg-md-surface shadow-sm transition-all hover:shadow-md
            ${isPending ? 'border-dashed border-md-outline/30 opacity-70' : 'border-md-outline/10'}
        `}>
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-md-on-surface truncate pr-2">{candidate.name}</h4>
                <a href={candidate.githubUrl} target="_blank" rel="noreferrer" className="text-xs text-md-primary hover:underline">GitHub</a>
            </div>
            <p className="text-xs text-md-on-surface-variant truncate mb-2">{candidate.email}</p>
            {isPending && (
                <div className="flex items-center gap-1.5 text-xs text-md-on-surface-variant mt-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Waiting for analysis...
                </div>
            )}
        </div>
    );
}

function EmptyState() {
    return <div className="h-20 rounded-lg border-2 border-dashed border-gray-100 flex items-center justify-center text-xs text-gray-300 font-medium">No candidates</div>;
}
