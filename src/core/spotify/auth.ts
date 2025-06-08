// auth.ts
const CLIENT_ID = 'ae7faf0635f74ea7bf565535c2bbf718';
const REDIRECT_URI = window.location.origin;
const SCOPES = [
  'user-library-read',
  'user-library-modify',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-read-private',
  'user-read-email',
  'streaming',
  'user-read-playback-state',
  'user-modify-playback-state',
  'playlist-modify-public',
  'playlist-modify-private',
  'ugc-image-upload',
  'user-read-recently-played',
  'user-top-read',
];

export function logoutSpotify() {
  localStorage.removeItem('spotify_access_token');
  localStorage.removeItem('spotify_code_verifier');
  window.location.href = REDIRECT_URI;
}

function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => ('0' + (b % 36).toString(36)).slice(-1))
    .join('');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function redirectToSpotifyLogin() {
  const verifier = generateRandomString(64);
  const challenge = await generateCodeChallenge(verifier);
  localStorage.setItem('spotify_code_verifier', verifier);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES.join(' '),
    code_challenge_method: 'S256',
    code_challenge: challenge,
    state: encodeURIComponent(`redirect=${encodeURIComponent(window.location.href)}`),
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function fetchAccessToken(): Promise<string | null> {
  // 确保只有一个获取 Token 的任务在进行
  await window.getTokenJob;

  const cachedToken = localStorage.getItem('spotify_access_token');
  if (cachedToken) return cachedToken;

  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const verifier = localStorage.getItem('spotify_code_verifier');

  if (!code || !verifier) return null;

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    code_verifier: verifier,
  });

  const job = fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  window.getTokenJob = job.catch(() => null);
  const res = await job;
  const data = await res.json();

  if (data.access_token) {
    localStorage.setItem('spotify_access_token', data.access_token);
    window.history.replaceState({}, document.title, REDIRECT_URI);
    return data.access_token;
  }

  return null;
}
