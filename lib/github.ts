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
        author: string;
    }[];
}

export async function fetchRepoMetadata(githubUrl: string): Promise<RepoMetadata | null> {
    try {
        // Extract owner and repo from URL
        // Expected format: https://github.com/owner/repo or similar
        const urlParts = githubUrl.split('github.com/');
        if (urlParts.length < 2) return null;

        const path = urlParts[1].split('/');
        const owner = path[0];
        const repo = path[1]?.replace('.git', '');

        if (!owner || !repo) return null;

        const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;
        const headers: HeadersInit = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Triage-System-Bot'
        };

        // Add token if available in env
        if (process.env.GITHUB_TOKEN) {
            headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
        }

        // 1. Fetch Basic Info
        const infoRes = await fetch(baseUrl, { headers });
        if (!infoRes.ok) throw new Error(`Failed to fetch repo info: ${infoRes.statusText}`);
        const info = await infoRes.json();

        // 2. Fetch README
        const readmeRes = await fetch(`${baseUrl}/readme`, { headers });
        let readmeContent = "";
        if (readmeRes.ok) {
            const readmeData = await readmeRes.json();
            // GitHub API returns content in Base64
            if (readmeData.content) {
                readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf-8');
            }
        }

        // 3. Fetch Recent Commits (Last 15)
        const commitsRes = await fetch(`${baseUrl}/commits?per_page=15`, { headers });
        let recentCommits: any[] = [];
        if (commitsRes.ok) {
            const commitsData = await commitsRes.json();
            recentCommits = commitsData.map((c: any) => ({
                message: c.commit.message,
                date: c.commit.author.date,
                author: c.commit.author.name
            }));
        }

        return {
            owner,
            repo,
            description: info.description || "",
            stars: info.stargazers_count,
            forks: info.forks_count,
            openIssues: info.open_issues_count,
            readme: readmeContent.slice(0, 5000), // Truncate to avoid context limit issues
            recentCommits
        };

    } catch (error) {
        console.error(`Error processing GitHub URL ${githubUrl}:`, error);
        return null;
    }
}
