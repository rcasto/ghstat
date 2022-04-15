# ghstat
A little cli tool to retrieve [metrics](https://docs.github.com/en/rest/reference/metrics) about your owned github repos.

Basic stats include:
- Unique view counts per repo
- Raw view counts per repo
- Unique clone counts per repo
- Raw clone counts per repo

The stats will be retrieved for the past 14 day window.

## Usage
Ensure you have [Node.js](https://nodejs.org) installed.

```
npx ghstat@latest
```

You can choose to pass in a [github personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) if you want. Be sure to allow or check the `public_repo` scope.
The personal access token can then be passed in as follows:
```
npx ghstat@latest <personal-access-token>
```

If you do not pass in a personal access token, then the [device flow](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#device-flow) will be utilized for login.

## Additional Notes
Will likely try to consolidate the stats to one printed out table later, all grouped to their respective repo, but for now every stat is printed out as a separate table sorted by count in descending order for owned repos.

It is possible that you may get [rate limited](https://docs.github.com/en/enterprise-cloud@latest/rest/overview/resources-in-the-rest-api#rate-limiting), currently 5,000 requests per hour per authenticated user are allowed.