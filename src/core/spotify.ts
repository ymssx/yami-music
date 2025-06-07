import { useEffect, useRef, useState } from 'react';

const CLIENT_ID = 'ae7faf0635f74ea7bf565535c2bbf718';
const REDIRECT_URI = 'http://127.0.0.1:5173';

// 🔧 添加了 streaming 和播放控制权限
const SCOPES = [
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-read-private',
  'user-read-email',
  'streaming',
  'user-read-playback-state',
  'user-modify-playback-state',
];

// 初始化播放器时保存
let _accessToken: string | null = null;

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
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function fetchAccessToken(): Promise<string | null> {
  const cachedToken = localStorage.getItem('spotify_access_token');
  if (cachedToken) {
    _accessToken = cachedToken;
    return cachedToken;
  }

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
    _accessToken = data.access_token;

    window.history.replaceState({}, document.title, REDIRECT_URI);
    return data.access_token;
  }

  return null;
}

export async function getSpotifyPlaylists(): Promise<any[]> {
  const token = await fetchAccessToken();
  if (!token) {
    await redirectToSpotifyLogin();
    return [];
  }

  const res = await fetch('https://api.spotify.com/v1/me/playlists', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    console.error('Spotify API error:', await res.text());
    return [];
  }

  const data = await res.json();
  return data.items || [];
}

export function logoutSpotify() {
  localStorage.removeItem('spotify_access_token');
  localStorage.removeItem('spotify_code_verifier');
  window.location.href = REDIRECT_URI;
}

export async function getPlaylistDetails(playlistId: string) {
  const token = await fetchAccessToken();
  if (!token) {
    await redirectToSpotifyLogin();
    return null;
  }

  const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    console.error('Spotify API Error:', res.statusText);
    return null;
  }

  return await res.json();
}


// ✅ 初始化播放器（Web Playback SDK）
export async function initSpotifyPlayer() {
  const token = await fetchAccessToken();
  if (!token) {
    await redirectToSpotifyLogin();
    return;
  }

  return new Promise<void>((resolve) => {
    (window as any).onSpotifyWebPlaybackSDKReady = () => {
      const player = new Spotify.Player({
        name: 'My Web Player',
        getOAuthToken: (cb: any) => {
          cb(token);
        },
        volume: 0.5,
      });

      player.addListener('ready', ({ device_id }: any) => {
        console.log('Ready with Device ID', device_id);
        localStorage.setItem('spotify_device_id', device_id);
        resolve();
      });

      player.addListener('initialization_error', ({ message }: any) => {
        console.error('init error:', message);
      });
      player.addListener('authentication_error', ({ message }: any) => {
        console.error('auth error:', message);
      });
      player.addListener('account_error', ({ message }: any) => {
        console.error('account error:', message);
      });

      player.connect();
    };

    // 动态加载 SDK
    if (!document.getElementById('spotify-sdk')) {
      const script = document.createElement('script');
      script.id = 'spotify-sdk';
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      document.body.appendChild(script);
    }
  });
}

export const useSpotifyPlayer = () => {
  const resoveRef = useRef<() => void>(null)
  const job = useRef(new Promise<void>((resove) => {
    resoveRef.current = resove;
  }));
  useEffect(() => {
    initSpotifyPlayer().then(() => {
      resoveRef.current?.();
    })
  });
  return job;
}

// ✅ 播放歌单或专辑
export async function playPlaylist(spotify_uri: string) {
  const token = await fetchAccessToken();
  const device_id = localStorage.getItem('spotify_device_id');

  if (!token || !device_id) {
    console.warn('token 或 device_id 缺失，无法播放');
    return;
  }

  await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device_id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ context_uri: spotify_uri }),
  });
}

interface TrackInfo {
  title: string;
  artists: string;
  album: string;
  cover: string;
  isPlaying: boolean;
  position: number;
  duration: number;
}

export function useSpotifyPlaybackState(promise: Promise<any>) {
  const [trackInfo, setTrackInfo] = useState<TrackInfo | null>(null);

  useEffect(() => {
    const handleStateChange = (state: any) => {
      console.log(11111, state);
      if (!state || !state.track_window?.current_track) {
        setTrackInfo(null);
        return;
      }

      const track = state.track_window.current_track;
      setTrackInfo({
        title: track.name,
        artists: track.artists.map((a: any) => a.name).join(', '),
        album: track.album.name,
        cover: track.album.images?.[0]?.url || '',
        isPlaying: !state.paused,
        position: state.position,
        duration: state.duration,
      });
    };

    console.log(22222, promise);
  
    promise?.then(() => {
      console.log(3333);
      const player = (window as any).spotifyPlayer as Spotify.Player;
      if (!player) return;
  
      player.addListener('player_state_changed', handleStateChange);
  
      // 主动获取一次状态
      player.getCurrentState().then(handleStateChange);
    });

    return () => {
      promise?.then(() => {
        const player = (window as any).spotifyPlayer as Spotify.Player;
        if (!player) return;
        player.removeListener('player_state_changed', handleStateChange);
      });
    };
  }, []);

  return trackInfo;
}

