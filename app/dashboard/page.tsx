import { auth } from "@/auth";
import { db } from "@/lib/db";
import { jobs, candidates } from "@/lib/db/schema";
import { eq, and, isNull, isNotNull, count } from "drizzle-orm";


export default async function DashboardPage() {
    const session = await auth();
    const userName = session?.user?.name || "User";
    const userId = session?.user?.id ? parseInt(session.user.id) : 0;

    // Fetch Stats
    let pendingReviews = 0;
    let activeJobs = 0;
    let candidatesTriaged = 0;

    if (userId) {
        // 1. Active Jobs
        const jobsResult = await db.select({ value: count() })
            .from(jobs)
            .where(eq(jobs.createdBy, userId));
        activeJobs = jobsResult[0].value;

        // 2. Pending Reviews
        const pendingResult = await db.select({ value: count() })
            .from(candidates)
            .innerJoin(jobs, eq(candidates.jobId, jobs.id))
            .where(
                and(
                    eq(jobs.createdBy, userId),
                    isNull(candidates.screeningStatus)
                )
            );
        pendingReviews = pendingResult[0].value;

        // 3. Candidates Triaged
        const triagedResult = await db.select({ value: count() })
            .from(candidates)
            .innerJoin(jobs, eq(candidates.jobId, jobs.id))
            .where(
                and(
                    eq(jobs.createdBy, userId),
                    isNotNull(candidates.screeningStatus)
                )
            );
        candidatesTriaged = triagedResult[0].value;
    }

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-headline-large font-bold text-md-on-surface mb-2">
                    Good afternoon, {userName.split(' ')[0]}
                </h1>
                <p className="text-body-large text-md-on-surface-variant">
                    Here's what requires your attention today.
                </p>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-[24px] bg-md-surface-container hover:bg-md-surface-container-high transition-colors">
                    <div className="text-md-primary font-bold text-display-medium mb-1">{pendingReviews}</div>
                    <div className="text-md-on-surface-variant text-label-large">Pending Reviews</div>
                </div>
                <div className="p-6 rounded-[24px] bg-md-surface-container hover:bg-md-surface-container-high transition-colors">
                    <div className="text-md-secondary font-bold text-display-medium mb-1">{activeJobs}</div>
                    <div className="text-md-on-surface-variant text-label-large">Active Jobs</div>
                </div>
                <div className="p-6 rounded-[24px] bg-md-surface-container hover:bg-md-surface-container-high transition-colors">
                    <div className="text-md-tertiary font-bold text-display-medium mb-1">{candidatesTriaged}</div>
                    <div className="text-md-on-surface-variant text-label-large">Candidates Triaged</div>
                </div>
            </div>

            {/* Context Awareness: Assignment Criteria */}
            <div className="bg-md-surface-container-low rounded-[28px] p-8 border border-md-outline/10">
                <h2 className="text-title-large font-medium text-md-on-surface mb-6">
                    Triage Assignment Criteria
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Looks Fine */}
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-sm font-bold">
                            Looks Fine
                        </div>
                        <p className="text-body-medium text-md-on-surface-variant">
                            Meets all hygiene signals. Commits show iteration, README is clear, structure is logical.
                        </p>
                    </div>

                    {/* Needs Review */}
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 text-sm font-bold">
                            Needs Review
                        </div>
                        <p className="text-body-medium text-md-on-surface-variant">
                            Mixed signals. Might have single large commit ("zip upload") but good README, or vice versa. Recommend manual check.
                        </p>
                    </div>

                    {/* Low Effort */}
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-sm font-bold">
                            Low Effort
                        </div>
                        <p className="text-body-medium text-md-on-surface-variant">
                            Very few commits, no README, or empty repository. Does not meet minimum effort threshold.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
