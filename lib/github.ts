export interface RepoMetadata {
    owner: string;
    repo: string;
    description: string;
    stars: number;
    forks: number;
    openIssues: number;
    readme: string;
    recentCommits: {
        message: string;
        date: string;
        authorName: string;
        authorLogin: string;
    }[];
    ownerStats: {
        publicRepos: number;
        followers: number;
        accountCreated: string;
        recentActivity: number; // Events in last 90 days
    };
}

export async function fetchRepoMetadata(githubUrl: string): Promise<RepoMetadata | null> {
    try {
        const urlParts = githubUrl.split('github.com/');
        if (urlParts.length < 2) return null;

        const path = urlParts[1].split('/');
        const owner = path[0];
        const repo = path[1]?.replace('.git', '');

        if (!owner || !repo) return null;

        const headers: HeadersInit = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Triage-System-Bot'
        };

        if (process.env.GITHUB_TOKEN) {
            headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
        }

        const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;
        const userUrl = `https://api.github.com/users/${owner}`;
        const eventsUrl = `https://api.github.com/users/${owner}/events/public?per_page=100`; // Fetch max allowed per page

        // Parallel Fetch: Repo Info, Readme, Commits, User Profile, User Events
        const [infoRes, readmeRes, commitsRes, userRes, eventsRes] = await Promise.all([
            fetch(baseUrl, { headers }),
            fetch(`${baseUrl}/readme`, { headers }),
            fetch(`${baseUrl}/commits?per_page=20`, { headers }), // Increased to 20 for better history sample
            fetch(userUrl, { headers }),
            fetch(eventsUrl, { headers })
        ]);

        if (!infoRes.ok) throw new Error(`Failed to fetch repo info: ${infoRes.statusText}`);
        const info = await infoRes.json();

        let readmeContent = "";
        if (readmeRes.ok) {
            const readmeData = await readmeRes.json();
            if (readmeData.content) {
                readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf-8');
            }
        }

        let recentCommits: any[] = [];
        if (commitsRes.ok) {
            const commitsData = await commitsRes.json();
            recentCommits = commitsData.map((c: any) => ({
                message: c.commit.message,
                date: c.commit.author.date,
                authorName: c.commit.author.name,
                authorLogin: c.author?.login || "unknown" // capture login to check if it matches owner
            }));
        }

        let ownerStats = { publicRepos: 0, followers: 0, accountCreated: "", recentActivity: 0 };
        if (userRes.ok) {
            const userData = await userRes.json();
            ownerStats.publicRepos = userData.public_repos;
            ownerStats.followers = userData.followers;
            ownerStats.accountCreated = userData.created_at;
        }

        if (eventsRes.ok) {
            const eventsData = await eventsRes.json();
            // Simple count of recent public events
            if (Array.isArray(eventsData)) {
                ownerStats.recentActivity = eventsData.length;
            }
        }

        return {
            owner,
            repo,
            description: info.description || "",
            stars: info.stargazers_count,
            forks: info.forks_count,
            openIssues: info.open_issues_count,
            readme: readmeContent.slice(0, 8000), // Increased context for AI
            recentCommits,
            ownerStats
        };

    } catch (error) {
        console.error(`Error processing GitHub URL ${githubUrl}:`, error);
        return null;
    }
}
