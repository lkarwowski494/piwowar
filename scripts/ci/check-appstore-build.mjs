import crypto from 'node:crypto';
import https from 'node:https';

const keyId = process.env.ASC_KEY_ID;
const issuerId = process.env.ASC_ISSUER_ID;
let p8Content = process.env.ASC_KEY_P8_BASE64 || process.env.ASC_KEY_P8 || '';
const bundleId = process.env.BUNDLE_ID || 'com.apps4craft.piwowar';
const buildNumber = process.env.BUILD_NUMBER || '1001';

if (!keyId || !issuerId || !p8Content) {
  console.error('[check-appstore] Missing ASC credentials (ASC_KEY_ID, ASC_ISSUER_ID, ASC_KEY_P8).');
  process.exit(1);
}

if (!p8Content.includes('BEGIN PRIVATE KEY')) {
  try {
    p8Content = Buffer.from(p8Content, 'base64').toString('utf8');
  } catch (err) {
    // keep as is
  }
}

function base64Url(buf) {
  return (typeof buf === 'string' ? Buffer.from(buf) : buf)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function generateToken() {
  const header = base64Url(JSON.stringify({ alg: 'ES256', kid: keyId, typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const payload = base64Url(
    JSON.stringify({
      iss: issuerId,
      iat: now,
      exp: now + 1200,
      aud: 'appstoreconnect-v1',
    })
  );

  const sign = crypto.createSign('SHA256');
  sign.update(`${header}.${payload}`);
  const signature = sign.sign({ key: p8Content, dsaEncoding: 'ieee-p1363' });
  return `${header}.${payload}.${base64Url(signature)}`;
}

function apiRequest(path, token) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.appstoreconnect.apple.com',
        path,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'User-Agent': 'Piwowar-TestFlight-Checker/1.0',
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            resolve({ statusCode: res.statusCode, data });
          } catch (e) {
            resolve({ statusCode: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  const token = generateToken();
  console.log(`[check-appstore] Querying App Store Connect for bundleId=${bundleId}, build=${buildNumber}...`);

  // 1. Find App by bundleId
  const appRes = await apiRequest(`/v1/apps?filter[bundleId]=${bundleId}`, token);
  if (appRes.statusCode !== 200 || !appRes.data?.data?.length) {
    console.log(`[check-appstore] App not found or error: ${JSON.stringify(appRes)}`);
    // Fallback: list recent builds
  }

  const appId = appRes.data?.data?.[0]?.id;
  const buildQuery = appId
    ? `/v1/builds?filter[app]=${appId}&sort=-uploadedDate&limit=5`
    : `/v1/builds?sort=-uploadedDate&limit=5`;

  const buildsRes = await apiRequest(buildQuery, token);
  if (buildsRes.statusCode !== 200) {
    console.error(`[check-appstore] Failed to fetch builds: HTTP ${buildsRes.statusCode}`, buildsRes.data);
    process.exit(1);
  }

  const builds = buildsRes.data?.data || [];
  console.log(`[check-appstore] Found ${builds.length} recent builds in App Store Connect:`);
  for (const b of builds) {
    const version = b.attributes?.version;
    const processingState = b.attributes?.processingState;
    const uploadedDate = b.attributes?.uploadedDate;
    const expired = b.attributes?.expired;
    console.log(`- Build ${version} (uploaded: ${uploadedDate}): state=${processingState}, expired=${expired}`);
  }

  const targetBuild = builds.find((b) => b.attributes?.version === String(buildNumber));
  if (targetBuild) {
    const state = targetBuild.attributes?.processingState;
    console.log(`\n========================================`);
    console.log(`TARGET BUILD ${buildNumber} STATUS: ${state}`);
    console.log(`========================================`);
    if (state === 'VALID') {
      console.log('SUCCESS: Build is processed and ready for testing!');
    } else if (state === 'PROCESSING') {
      console.log('IN_PROGRESS: Apple is still processing the build.');
    } else if (state === 'FAILED' || state === 'INVALID') {
      console.error(`FAILURE: Apple marked build as ${state}.`);
      process.exit(1);
    }
  } else {
    console.log(`\n[check-appstore] Build ${buildNumber} not yet visible in recent builds list (ingestion in progress).`);
  }
}

main().catch((err) => {
  console.error('[check-appstore] Unexpected error:', err);
  process.exit(1);
});
