import { loginViaDevice, pollForDeviceAccessToken } from './deviceLogin.js';
import { getOwnedReposForAuthenticatedUser, getPageViewsForRepo } from './index.js';

(async function () {
    const {
        verification_uri,
        user_code,
        expires_in, // in seconds
        device_code,
        interval,
    } = await loginViaDevice();
    const expiresInMilliseconds = expires_in * 1000;

    console.log(`Using a browser on this device or another, visit:\n${verification_uri}\n`);
    console.log(`And enter the code:\n${user_code}\n`);
    setTimeout(() => {
        console.log(`This code has expired as of ${new Date(Date.now() + expiresInMilliseconds).toLocaleString()}`);
        process.exit(1);
    }, expiresInMilliseconds);

    const {
        access_token,
    } = await pollForDeviceAccessToken(device_code, interval);

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