// player.ts
import { fetchAccessToken, redirectToSpotifyLogin } from './auth';
import { useEffect, useState } from 'react';

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
        getOAuthToken: (cb) => cb(token),
        volume: 0.5,
      });

      player.addListener('ready', ({ device_id }) => {
        console.log('Player Ready:', device_id);
        localStorage.setItem('spotify_device_id', device_id);
        resolve();
      });

      player.addListener('initialization_error', ({ message }) =>
        console.error('Init error:', message)
      );
      player.addListener('authentication_error', ({ message }) =>
        console.error('Auth error:', message)
      );
      player.addListener('account_error', ({ message }) =>
        console.error('Account error:', message)
      );

      player.connect();
      (window as any).spotifyPlayer = player;
    };

    if (!document.getElementById('spotify-sdk')) {
      const script = document.createElement('script');
      script.id = 'spotify-sdk';
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      document.body.appendChild(script);
    }
  });
}

window.initPlayerJob = initSpotifyPlayer();

interface TrackInfo {
  title: string;
  artists: string;
  album: string;
  cover: string;
  isPlaying: boolean;
  position: number;
  duration: number;
  id: string;
}

export function useSpotifyPlaybackState() {
  const [trackInfo, setTrackInfo] = useState<TrackInfo | null>(null);

  useEffect(() => {
    const handleStateChange = (state: any) => {
      if (!state || !state.track_window?.current_track) {
        setTrackInfo(null);
        return;
      }

      const track = state.track_window.current_track;
      console.log(track);
      setTrackInfo({
        id: track.id,
        title: track.name,
        artists: track.artists.map((a: any) => a.name).join(', '),
        album: track.album.name,
        cover: track.album.images?.[0]?.url || '',
        isPlaying: !state.paused,
        position: state.position,
        duration: state.duration,
      });
    };

    window.initPlayerJob?.then(() => {
      const player = (window as any).spotifyPlayer as Spotify.Player;
      if (!player) return;
      player.addListener('player_state_changed', handleStateChange);
      player.getCurrentState().then(handleStateChange);
    });

    return () => {
      window.initPlayerJob?.then(() => {
        const player = (window as any).spotifyPlayer as Spotify.Player;
        if (!player) return;
        player.removeListener('player_state_changed', handleStateChange);
      });
    };
  }, []);

  return trackInfo;
}
