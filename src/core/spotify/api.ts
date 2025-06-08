// api.ts
import axios from 'axios';
import { fetchAccessToken, redirectToSpotifyLogin } from './auth';

const spotifyAxios = axios.create({
  baseURL: 'https://api.spotify.com/v1',
});

spotifyAxios.interceptors.request.use(async (config) => {
  const token = await fetchAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

spotifyAxios.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('spotify_access_token');
      await redirectToSpotifyLogin();
    }
    return Promise.reject(err);
  }
);

export async function getSpotifyPlaylists() {
  const res = await spotifyAxios.get('/me/playlists');
  return res.data.items;
}

export async function getPlaylistDetails(playlistId: string) {
  const res = await spotifyAxios.get(`/playlists/${playlistId}`);
  return res.data;
}

export async function playPlaylist(spotify_uri: string) {
  const device_id = localStorage.getItem('spotify_device_id');
  if (!device_id) throw new Error('Device ID 未找到');

  await spotifyAxios.put(`/me/player/play?device_id=${device_id}`, {
    context_uri: spotify_uri,
  });
}

export async function searchPlaylists(query: string) {
  const res = await spotifyAxios.get('/search', {
    params: {
      q: query,
      type: 'playlist',
    },
  });
  return res.data.playlists?.items || [];
}

export async function getFeaturedPlaylists() {
  const res = await spotifyAxios.get('/browse/featured-playlists', {
    params: { market: 'from_token' },
  });
  return res.data.playlists?.items || [];
}
