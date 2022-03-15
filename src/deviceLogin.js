import fetch from 'node-fetch';

const CLIENT_ID = 'd92b4c2578f683ff95fc';
// https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps#available-scopes
const SCOPES_REQUIRED = [
    // 'repo',
    'public_repo',
];
const DEVICE_GRANT = 'urn:ietf:params:oauth:grant-type:device_code';

const deviceLoginAuthorizationUrl = 'https://github.com/login/device/code';
const deviceLoginTokenUrl = 'https://github.com/login/oauth/access_token';

export function loginViaDevice() {
    const url = `${deviceLoginAuthorizationUrl}?client_id=${CLIENT_ID}&scope=${SCOPES_REQUIRED.join(',')}`;
    return fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'project metrics',
            },
        })
        .then(response => response.json());
}

export function pollForDeviceAccessToken(deviceCode, pollIntervalInSeconds) {
    const url = `${deviceLoginTokenUrl}?client_id=${CLIENT_ID}&device_code=${deviceCode}&grant_type=${DEVICE_GRANT}`;
    return new Promise((resolve, reject) => {
        async function poll() {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'project metrics',
                },
            })
            .then(response => response.json());

            if (response && response.access_token) {
                resolve(response);
                return;
            } else if (response && response.error) {
                if (
                    response.error === 'access_denied' ||
                    response.error === 'expired_token'
                ) {
                    reject(response);
                    return;
                }
            } else {
                reject(response);
                return;
            }

            setTimeout(poll, pollIntervalInSeconds * 1000);
        }

        setTimeout(poll, pollIntervalInSeconds * 1000);
    });
}