#!/usr/bin/env node

import { buildChart } from './barchart.js';
import { getOwnedRepoStats, IReturnedStats } from './githubService.js';

function mapAndSortStat(stats: Record<string, IReturnedStats>, statName: 'rawViews' | 'rawClones' | 'uniqueViews' | 'uniqueClones') {
    const ownedRepoNames = Object.keys(stats);
    const labels: string[] = [];
    const values: number[] = [];

    ownedRepoNames
        .map((ownedRepoName: string) => ({
            name: ownedRepoName,
            count: stats[ownedRepoName][statName],
        }))
        .sort((stat1, stat2) => stat2.count - stat1.count)
        .forEach(repoStat => {
            labels.push(repoStat.name);
            values.push(repoStat.count);
        });

    return {
        labels,
        values,
    };
}

(async function () {
    const [
        personalAccessToken,
    ] = process.argv.slice(2);

    const {
        userInfo,
        stats,
    } = await getOwnedRepoStats(personalAccessToken);

    const {
        labels: rawViewLabels,
        values: rawViewCounts,
    } = mapAndSortStat(stats, 'rawViews');
    const {
        labels: uniqueViewLabels,
        values: uniqueViewCounts,
    } = mapAndSortStat(stats, 'uniqueViews');

    const {
        labels: rawCloneLabels,
        values: rawCloneCounts,
    } = mapAndSortStat(stats, 'rawClones');
    const {
        labels: uniqueCloneLabels,
        values: uniqueCloneCounts,
    } = mapAndSortStat(stats, 'uniqueClones');

    const repoRawViewCountBarChart = buildChart(rawViewLabels, rawViewCounts, 50, '# of raw views per repo in the last 14 days');
    const repoUniqueViewCountBarChart = buildChart(uniqueViewLabels, uniqueViewCounts, 50, '# of unique views per repo in the last 14 days');

    const repoRawCloneCountBarChart = buildChart(rawCloneLabels, rawCloneCounts, 50, '# of raw clones per repo in the last 14 days');
    const repoUniqueCloneCountBarChart = buildChart(uniqueCloneLabels, uniqueCloneCounts, 50, '# of unique clones per repo in the last 14 days');

    console.log(`\n# of owned public repos for ${userInfo.username}: ${userInfo.numPublicRepos}\n`);
    console.log(repoRawViewCountBarChart);
    console.log(repoUniqueViewCountBarChart);
    console.log(repoRawCloneCountBarChart);
    console.log(repoUniqueCloneCountBarChart);

    process.exit(0);
}());