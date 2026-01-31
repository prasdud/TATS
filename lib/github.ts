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

const fetchWithRetry = async (url: string, options: RequestInit, retries = 3, backoff = 1000): Promise<Response> => {
    try {
        const res = await fetch(url, options);
        if (res.status === 429 && retries > 0) {
            console.warn(`Rate limit hit for ${url}. Retrying in ${backoff}ms...`);
            await new Promise(r => setTimeout(r, backoff));
            return fetchWithRetry(url, options, retries - 1, backoff * 2);
        }
        return res;
    } catch (e) {
        if (retries > 0) {
            await new Promise(r => setTimeout(r, backoff));
            return fetchWithRetry(url, options, retries - 1, backoff * 2);
        }
        throw e;
    }
};

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

        const fetchWithRetry = async (url: string, options: RequestInit, retries = 3, backoff = 1000): Promise<Response> => {
            try {
                const res = await fetch(url, options);
                if (res.status === 429 && retries > 0) {
                    console.warn(`Rate limit hit for ${url}. Retrying in ${backoff}ms...`);
                    await new Promise(r => setTimeout(r, backoff));
                    return fetchWithRetry(url, options, retries - 1, backoff * 2);
                }
                return res;
            } catch (e) {
                if (retries > 0) {
                    await new Promise(r => setTimeout(r, backoff));
                    return fetchWithRetry(url, options, retries - 1, backoff * 2);
                }
                throw e;
            }
        };

        // ... inside fetchRepoMetadata
        const [infoRes, readmeRes, commitsRes, userRes, eventsRes] = await Promise.all([
            fetchWithRetry(baseUrl, { headers }),
            fetchWithRetry(`${baseUrl}/readme`, { headers }),
            fetchWithRetry(`${baseUrl}/commits?per_page=20`, { headers }),
            fetchWithRetry(userUrl, { headers }),
            fetchWithRetry(eventsUrl, { headers })
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
