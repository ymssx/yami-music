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

export async function playPlaylist(content: { context_uri: string } | { uris: string[]  }) {
  const device_id = localStorage.getItem('spotify_device_id');
  if (!device_id) throw new Error('Device ID 未找到');

  await spotifyAxios.put(`/me/player/play?device_id=${device_id}`, content);
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

let cachedUserInfo: { id: string } | null = null;

/**
 * 获取当前用户信息，并缓存（只获取一次）
 */
export async function getCurrentUser() {
  if (cachedUserInfo) return cachedUserInfo;

  const res = await spotifyAxios.get('/me');
  cachedUserInfo = res.data;
  return cachedUserInfo;
}

/**
 * 判断当前用户是否已关注某个 Playlist
 * @param playlistId 歌单 ID
 */
export async function hasUserFollowedPlaylist(playlistId: string) {
  const user = await getCurrentUser();
  const res = await spotifyAxios.get(
    `/playlists/${playlistId}/followers/contains`,
    {
      params: { ids: user?.id },
    }
  );
  return res.data?.[0] === true;
}

/**
 * 关注某个 Playlist
 * @param playlistId 歌单 ID
 */
export async function followPlaylist(playlistId: string) {
  await spotifyAxios.put(`/playlists/${playlistId}/followers`);
}

/**
 * 取消关注某个 Playlist
 * @param playlistId 歌单 ID
 */
export async function unfollowPlaylist(playlistId: string) {
  await spotifyAxios.delete(`/playlists/${playlistId}/followers`);
}

export async function getMySavedTracks(limit = 20, offset = 0) {
  const res = await spotifyAxios.get('/me/tracks', {
    params: {
      limit,
      offset,
    },
  });
  return res.data;
}

interface Playlist {
  id: string;
  name: string;
  type: 'playlist' | 'saved-tracks';
  description?: string;
  images: { url: string }[];
  [key: string]: any;
}

export async function getAllUserPlaylists(): Promise<Playlist[]> {
  // 1. 获取 Spotify 正常的用户歌单
  const playlistsRes = await spotifyAxios.get('/me/playlists');
  const playlists: Playlist[] = playlistsRes.data.items.map((p: any) => ({
    ...p,
    type: 'playlist',
  }));

  // 2. 构造一个假的歌单来代表「我喜欢的歌曲」
  const savedTracksRes = await spotifyAxios.get('/me/tracks?limit=1'); // 只取一个用于展示封面
  const firstTrack = savedTracksRes.data.items?.[0]?.track;
  const cover = firstTrack?.album?.images?.[0]?.url || '';

  const savedTracksPlaylist: Playlist = {
    id: '__saved_tracks__',
    name: '我喜欢的歌曲',
    type: 'saved-tracks',
    description: '来自用户收藏的单曲',
    images: cover ? [{ url: cover }] : [],
  };

  // 3. 合并返回
  return [savedTracksPlaylist, ...playlists];
}

