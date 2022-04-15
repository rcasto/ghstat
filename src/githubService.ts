import { createOAuthDeviceAuth } from "@octokit/auth-oauth-device";
import { Octokit } from "@octokit/core";
import { restEndpointMethods } from "@octokit/plugin-rest-endpoint-methods";
import { Api } from "@octokit/plugin-rest-endpoint-methods/dist-types/types";

interface IAuthenticatedUser {
    username: string;
    numPublicRepos: number;
}

interface IOwnedRepo {
    name: string;
}

interface IRepoStat {
    uniques: number;
}

interface IRepoStats {
    [key: string]: IRepoStat;
}

interface IReturnedStats {
    uniqueViews: number;
    uniqueClones: number;
}

interface IOwnedRepoStats {
    userInfo: IAuthenticatedUser;
    stats: Record<string, IReturnedStats>;
}

const RestOctokit = Octokit.plugin(restEndpointMethods);

export async function getOwnedRepoStats(personalAccessToken?: string): Promise<IOwnedRepoStats> {
    const octokit = createClient(personalAccessToken);

    const userInfo = await getAuthenticatedUser(octokit);
    const userOwnedRepos = await getOwnedReposForUser(octokit, userInfo.username);

    const userOwnedRepoViews = await getOwnedRepoViews(octokit, userInfo.username, userOwnedRepos);
    const userOwnedRepoClones = await getOwnedRepoClones(octokit, userInfo.username, userOwnedRepos);

    const ownedRepoStats: Record<string, IReturnedStats> = {};

    Object.keys(userOwnedRepoViews)
        .forEach(userOwnedRepoName => {
            ownedRepoStats[userOwnedRepoName] = {
                uniqueViews: userOwnedRepoViews[userOwnedRepoName].uniques,
                uniqueClones: userOwnedRepoClones[userOwnedRepoName].uniques,
            };
        });
    
    return {
        userInfo,
        stats: ownedRepoStats,
    };
}

function createClient(personalAccessToken?: string): (Octokit & Api) {
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

    return new RestOctokit({
        auth,
        authStrategy,
    });
}

async function getAuthenticatedUser(octokit: (Octokit & Api)): Promise<IAuthenticatedUser> {
    const {
        data: {
            login,
            public_repos,
        }
    } = await octokit.rest.users.getAuthenticated();

    return {
        username: login,
        numPublicRepos: public_repos,
    };
}

async function getOwnedReposForUser(octokit: (Octokit & Api), username: string, numReposPerPage = 100): Promise<IOwnedRepo[]> {
    const {
        data: ownedRepos,
    } = await octokit.rest.repos.listForUser({
        username,
        type: 'owner',
        page: 1,
        per_page: numReposPerPage,
    });

    return ownedRepos;
}

// https://docs.github.com/en/rest/reference/metrics#get-page-views
async function getOwnedRepoViews(octokit: (Octokit & Api), username: string, ownedRepos: IOwnedRepo[]): Promise<IRepoStats> {
    const ownedRepoViewStats: IRepoStats = {};
    const ownedRepoViewPromises = ownedRepos.map(async ownedRepo => {
        const { data } = await octokit.rest.repos.getViews({
            owner: username,
            repo: ownedRepo.name,
            per: 'week',
        });
        const viewStat: IRepoStat = {
            uniques: data.uniques,
        };

        ownedRepoViewStats[ownedRepo.name] = viewStat;

        return viewStat;
    });
    
    await Promise.all(ownedRepoViewPromises);

    return ownedRepoViewStats;
}

// https://docs.github.com/en/rest/reference/metrics#get-repository-clones
async function getOwnedRepoClones(octokit: (Octokit & Api), username: string, ownedRepos: IOwnedRepo[]): Promise<IRepoStats> {
    const ownedRepoCloneStats: IRepoStats = {};
    const ownedRepoClonePromises = ownedRepos.map(async ownedRepo => {
        const { data } = await octokit.rest.repos.getClones({
            owner: username,
            repo: ownedRepo.name,
            per: 'week',
        });
        const cloneStat: IRepoStat = {
            uniques: data.uniques,
        };

        ownedRepoCloneStats[ownedRepo.name] = cloneStat;

        return cloneStat;
    });

    await Promise.all(ownedRepoClonePromises);

    return ownedRepoCloneStats;
}