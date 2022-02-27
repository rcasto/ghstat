import { getOwnedReposForAuthenticatedUser } from ".";

const [
    githubAccessToken,
] = process.argv.slice(2);

if (!githubAccessToken) {
    console.log(`Usage: node cli.ts <github-access-token>`);
    process.exit(1);
}

(async function () {
    const result = await getOwnedReposForAuthenticatedUser(githubAccessToken);
    console.log(result);
}());