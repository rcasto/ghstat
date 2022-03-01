import fetch from 'node-fetch';

const githubApiBaseUrl = 'https://api.github.com';
const listUserReposApiUrl = `${githubApiBaseUrl}/user/repos?affiliation=owner&per_page=100&page=1`;

export async function getOwnedReposForAuthenticatedUser(githubAccessToken) {
    return fetch(listUserReposApiUrl, {
        method: 'GET',
        headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `Bearer ${githubAccessToken}`,
        },
    })
    .then(response => response.json());
}

export async function getPageViewsForRepo(owner, repo, githubAccessToken) {
    const repoPageViewApiUrl = `${githubApiBaseUrl}/repos/${owner}/${repo}/traffic/views`;
    return fetch(repoPageViewApiUrl, {
        method: 'GET',
        headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `Bearer ${githubAccessToken}`,
        },
    })
    .then(response => response.json())
    .then(repoStats => ({
        name: repo,
        count: repoStats.count,
        uniques: repoStats.uniques,
    }));
}