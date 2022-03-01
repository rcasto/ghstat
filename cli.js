import { getOwnedReposForAuthenticatedUser, getPageViewsForRepo } from './index.js';

const [
    githubAccessToken,
] = process.argv.slice(2);

if (!githubAccessToken) {
    console.log(`Usage: node cli.ts <github-access-token>`);
    process.exit(1);
}

(async function () {
    const ownedRepos = (await getOwnedReposForAuthenticatedUser(githubAccessToken) || [])
        .map(ownedRepo => ({
            name: ownedRepo.name,
            owner: ownedRepo.owner.login,
        }));

    console.log(`# of owned repos: ${ownedRepos.length}`);

    const repoPageViewStats = (await Promise.all(ownedRepos
        .map(ownedRepo => getPageViewsForRepo(ownedRepo.owner, ownedRepo.name, githubAccessToken))))
        .sort((repo1, repo2) => repo2.uniques - repo1.uniques)

    console.log(repoPageViewStats);
}());