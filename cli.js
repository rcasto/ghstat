import { loginViaDevice, pollForDeviceAccessToken } from './deviceLogin.js';
import { getOwnedReposForAuthenticatedUser, getPageViewsForRepo } from './index.js';

// const [
//     githubAccessToken,
// ] = process.argv.slice(2);

// if (!githubAccessToken) {
//     console.log(`Usage: node cli.ts <github-access-token>`);
//     process.exit(1);
// }

(async function () {
    const deviceLoginInfo = await loginViaDevice();

    console.log(`To continue, please login at ${deviceLoginInfo.verification_uri}`);
    console.log(`Please enter the code ${deviceLoginInfo.user_code}`);
    console.log(`This code will expire at ${new Date(Date.now() + deviceLoginInfo.expires_in * 1000)}`);

    const {
        access_token,
    } = await pollForDeviceAccessToken(deviceLoginInfo.device_code, deviceLoginInfo.interval);

    const ownedRepos = (await getOwnedReposForAuthenticatedUser(access_token) || [])
        .map(ownedRepo => ({
            name: ownedRepo.name,
            owner: ownedRepo.owner.login,
        }));

    console.log(`# of owned repos: ${ownedRepos.length}`);

    const repoPageViewStats = (await Promise.all(ownedRepos
        .map(ownedRepo => getPageViewsForRepo(ownedRepo.owner, ownedRepo.name, access_token))))
        .sort((repo1, repo2) => repo2.uniques - repo1.uniques)

    console.log(repoPageViewStats);
}());