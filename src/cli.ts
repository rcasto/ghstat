#!/usr/bin/env node

import { buildChart } from './barchart.js';
import { getOwnedRepoStats } from './githubService.js';

(async function () {
    const [
        personalAccessToken,
    ] = process.argv.slice(2);

    const {
        userInfo,
        stats,
    } = await getOwnedRepoStats(personalAccessToken);
    const ownedRepoNames = Object.keys(stats);

    const ownedRepoRawViewCounts = ownedRepoNames
        .map(ownedRepoName => stats[ownedRepoName].rawViews)
        .sort((count1, count2) => count2 - count1);
    const ownedRepoUniqueViewCounts = ownedRepoNames
        .map(ownedRepoName => stats[ownedRepoName].uniqueViews)
        .sort((count1, count2) => count2 - count1);

    const ownedRepoRawCloneCounts = ownedRepoNames
        .map(ownedRepoName => stats[ownedRepoName].rawClones)
        .sort((count1, count2) => count2 - count1);
    const ownedRepoUniqueCloneCounts = ownedRepoNames
        .map(ownedRepoName => stats[ownedRepoName].uniqueClones)
        .sort((count1, count2) => count2 - count1);

    const repoRawViewCountBarChart = buildChart(ownedRepoNames, ownedRepoRawViewCounts, 50, '# of raw views per repo');
    const repoUniqueViewCountBarChart = buildChart(ownedRepoNames, ownedRepoUniqueViewCounts, 50, '# of unique views per repo');

    const repoRawCloneCountBarChart = buildChart(ownedRepoNames, ownedRepoRawCloneCounts, 50, '# of raw clones per repo');
    const repoUniqueCloneCountBarChart = buildChart(ownedRepoNames, ownedRepoUniqueCloneCounts, 50, '# of unique clones per repo');

    console.log(`\n# of owned public repos for ${userInfo.username}: ${userInfo.numPublicRepos}\n`);
    console.log(repoRawViewCountBarChart);
    console.log(repoUniqueViewCountBarChart);
    console.log(repoRawCloneCountBarChart);
    console.log(repoUniqueCloneCountBarChart);

    process.exit(0);
}());