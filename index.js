import fetch from 'node-fetch';

const githubApiBaseUrl = 'https://api.github.com';

function githubApiFetch(url, githubAccessToken) {
    const headers = {
        'Accept': 'application/vnd.github.v3+json',
        // https://docs.github.com/en/rest/overview/resources-in-the-rest-api#user-agent-required
        'User-Agent': 'rcasto',
    };

    if (githubAccessToken) {
        headers['Authorization'] = `Bearer ${githubAccessToken}`;
    }

    return fetch(url, {
        method: 'GET',
        headers,
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        
        const rateLimitRemaining = parseInt(response.headers.get('x-ratelimit-remaining'), 10) || 0;
        const rateLimitResetDateMs = parseInt(response.headers.get('x-ratelimit-reset'), 10);
        const rateLimitResetDate = isNaN(rateLimitResetDateMs) ? new Date() : new Date(rateLimitResetDateMs);

        console.log(rateLimitRemaining, rateLimitResetDateMs, rateLimitResetDate);

        if (rateLimitRemaining <= 0) {
            console.error(`Rate limit threshold reached. Please try again on ${rateLimitResetDate.toLocaleString()}.`);
        }

        throw new Error(JSON.stringify({
            status: response.status,
            statusText: response.statusText,
        }));
    });
}

/**
 * https://docs.github.com/en/rest/reference/repos#list-repositories-for-the-authenticated-user
 * 
 * @param {*} githubAccessToken 
 * @param {*} page 
 * @param {*} perPage 
 * @returns 
 */
export async function getOwnedReposForAuthenticatedUser(githubAccessToken, page = 1, perPage = 100) {
    const reposForAuthenticatedUserApiUrl = `${githubApiBaseUrl}/user/repos?affiliation=owner&per_page=${perPage}&page=${page}`;
    return githubApiFetch(reposForAuthenticatedUserApiUrl, githubAccessToken);
}

/**
 * https://docs.github.com/en/rest/reference/repos#list-repositories-for-a-user
 * 
 * @param {string} username 
 * @param {number} page 
 * @param {number} perPage 
 * @returns 
 */
export async function getOwnedReposForUser(username, githubAccessToken, page = 1, perPage = 100) {
    const reposForUserApiUrl = `${githubApiBaseUrl}/users/${username}/repos?affiliation=owner&per_page=${perPage}&page=${page}`;
    return githubApiFetch(reposForUserApiUrl, githubAccessToken);
}

/**
 * https://docs.github.com/en/rest/reference/metrics#get-page-views
 * 
 * @param {string} owner 
 * @param {string} repo 
 * @param {string} githubAccessToken 
 * @returns 
 */
export async function getPageViewsForRepo(owner, repo, githubAccessToken) {
    const repoPageViewApiUrl = `${githubApiBaseUrl}/repos/${owner}/${repo}/traffic/views`;
    return githubApiFetch(repoPageViewApiUrl, githubAccessToken)
    .then(repoStats => ({
        name: repo,
        count: repoStats.count,
        uniques: repoStats.uniques,
    }));
}