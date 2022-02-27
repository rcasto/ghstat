import fetch from 'node-fetch';

const githubApiBaseUrl = 'https://api.github.com';
const listUserReposApiUrl = `${githubApiBaseUrl}/user/repos?affiliation=owner&per_page=100&page=1`;

export async function getOwnedReposForAuthenticatedUser(githubAccessToken: string) {
    return fetch(listUserReposApiUrl, {
        method: 'GET',
        headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `Bearer ${githubAccessToken}`,
        },
    })
    .then(response => response.json());
}

export async function getPageViewsForRepo(owner: string, repo: string) {
    return null;
}