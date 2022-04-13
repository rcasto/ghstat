import { buildChart } from './barchart.js';
import { createOAuthDeviceAuth } from '@octokit/auth-oauth-device';
import { Octokit } from '@octokit/core';
import { restEndpointMethods } from '@octokit/plugin-rest-endpoint-methods';

const RestOctokit = Octokit.plugin(restEndpointMethods);

(async function () {
    const [
        personalAccessToken,
    ] = process.argv.slice(2);

    const auth: any = personalAccessToken ?
        personalAccessToken : {
            clientType: 'oauth-app',
            clientId: 'd92b4c2578f683ff95fc',
            scopes: [
                'public_repo',
            ],
            onVerification: (verification: any) => {
                console.log("Open %s", verification.verification_uri);
                console.log("Enter code: %s", verification.user_code);
            },
        };
    const authStrategy = personalAccessToken ?
        undefined : createOAuthDeviceAuth;

    const octokit = new RestOctokit({
        auth,
        authStrategy,
    });

    const {
        data: {
            login,
            public_repos,
        }
    } = await octokit.rest.users.getAuthenticated();

    console.log(login, public_repos);

    const {
        data: ownedRepos,
    } = await octokit.rest.repos.listForUser({
        username: login,
        type: 'owner',
        page: 1,
        per_page: 100,
    });

    // octokit.rest.repos.getClones
    // octokit.rest.repos.getTopReferrers

    const ownedRepoViewPromises = ownedRepos.map(async ownedRepo => {
        const { data } = await octokit.rest.repos.getViews({
            owner: login,
            repo: ownedRepo.name,
            per: 'week',
        });
        return {
            name: ownedRepo.name,
            uniques: data.uniques,
        };
    });
    const ownedRepoViews = await Promise.all(ownedRepoViewPromises);
    const ownedRepoNames: string[] = [];
    const ownedRepoUniqueCounts: number[] = [];

    ownedRepoViews
        .sort((repo1, repo2) => repo2.uniques - repo1.uniques)
        .forEach(ownedRepoView => {
            const { name, uniques } = ownedRepoView;
            ownedRepoNames.push(name);
            ownedRepoUniqueCounts.push(uniques);
        });

    console.log(`# of owned public repos: ${public_repos}`);

    const repoUniqueCountBarChart = buildChart(ownedRepoNames, ownedRepoUniqueCounts, 50, '# of unique views per repo');
    
    console.log(repoUniqueCountBarChart);

    process.exit(0);
}());