const CLIENT_ID = 'ae7faf0635f74ea7bf565535c2bbf718'; // 替换为你的 Spotify Client ID
const REDIRECT_URI = 'http://127.0.0.1:5173'; // 确保与你 Spotify 后台配置一致
const SCOPES = ['playlist-read-private', 'playlist-read-collaborative'];

/**
 * 生成随机字符串（PKCE code_verifier）
 */
function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(b => ('0' + (b % 36).toString(36)).slice(-1))
    .join('');
}

/**
 * 生成 code_challenge（用于 PKCE）
 */
async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * 跳转到 Spotify 登录页面
 */
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
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

/**
 * 获取 access_token（如果本地已有就直接返回）
 */
export async function fetchAccessToken(): Promise<string | null> {
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

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const data = await res.json();

  if (data.access_token) {
    localStorage.setItem('spotify_access_token', data.access_token);

    // 清除 URL 参数，防止 code 重复使用导致循环
    window.history.replaceState({}, document.title, REDIRECT_URI);

    return data.access_token;
  }

  return null;
}

/**
 * 异步获取当前用户的 Spotify 歌单
 */
export async function getSpotifyPlaylists(): Promise<any[]> {
  let token = await fetchAccessToken();

  if (!token) {
    // 如果没有 token，就去登录
    await redirectToSpotifyLogin();
    return [];
  }

  const res = await fetch('https://api.spotify.com/v1/me/playlists', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    console.error('Spotify API error:', await res.text());
    return [];
  }

  const data = await res.json();
  return data.items || [];
}

/**
 * 可选：登出（清除缓存）
 */
export function logoutSpotify() {
  localStorage.removeItem('spotify_access_token');
  localStorage.removeItem('spotify_code_verifier');
  window.location.href = REDIRECT_URI;
}

/**
 * 获取指定歌单的详细信息
 * @param playlistId 歌单ID
 * @param accessToken 授权token
 */
export async function getPlaylistDetails(playlistId: string) {
  let token = await fetchAccessToken();

  if (!token) {
    // 如果没有 token，就去登录
    await redirectToSpotifyLogin();
    return [];
  }

  try {
    const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      throw new Error(`Spotify API Error: ${res.statusText}`);
    }
    const data = await res.json();
    return data; // 详细信息对象
  } catch (err) {
    console.error('Failed to fetch playlist details:', err);
    return null;
  }
}

