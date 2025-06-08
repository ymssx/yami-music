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

/**
 * 获取歌手所有专辑
 * @param artistId 歌手ID
 * @param includeGroups 包含的专辑类型（album, single, appears_on, compilation），可选，默认album和single
 * @param limit 返回数量限制，可选，默认20
 * @param offset 分页偏移，可选，默认0
 */
export async function getArtistAlbums(
  artistId: string,
  includeGroups: string[] = ['album', 'single'],
  limit = 20,
  offset = 0
) {
  const res = await spotifyAxios.get(`/artists/${artistId}/albums`, {
    params: {
      include_groups: includeGroups.join(','),
      limit,
      offset,
    },
  });
  return res.data.items;
}

export async function getAlbumDetails(albumId: string) {
  const res = await spotifyAxios.get(`/albums/${albumId}`);
  return res.data;
}

