import Image from '@/components/image';
import { useEffect, useRef, useState } from 'react';
import { getAlbumDetails, getPlaylistDetails, playPlaylist,  } from '@/core/spotify/api';
import { useSpotifyPlaybackState, useSpotifyPlayer } from '@/core/spotify/player';
import DOMPurify from 'dompurify';
import './style.less';

function formatDuration(ms: number) {
  const seconds = Math.floor(ms / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function PlaylistViewer({ className, id, type }: { id: string; type: string; className?: string }) {
  const [data, setData] = useState<{
    id?: string;
    name?: string;
    description?: string;
    images?: { url: string }[];
    uri?: string;
    tracks?: {
      items: {
        track: {
          id: string;
          name: string;
          artists: { name: string }[];
          duration_ms: number;
          album: { images: { url: string }[] };
        };
      }[];
    };
  }>({});

  const initPromise = useSpotifyPlayer();
  const playbackState = useSpotifyPlaybackState(initPromise.current);

  useEffect(() => {
    if (type === 'playlist') {
      getPlaylistDetails(id)
        .then((res) => {
          setData(res || {});
        });
    } else {
      getAlbumDetails(id)
       .then((res) => {
          setData(res || {});
        });
    }
  }, [id]);

  return (
    <div className={`${className} flex flex-col min-h-[500px] overflow-hidden playlist`}>
      <div className='flex-0'>
        {data?.name && <div className='mb-4 fadeappear slower '>
          <h1>{data.name}</h1>
          <p className='mt-2 text-sm whitespace-pre-line' dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.description || '') }}></p>

          <section className="my-2 mt-4">
            <button className="" onClick={() => {
              playPlaylist(data?.uri || `spotify:playlist:${id}`);
            }}>Play</button>
          </section>

          <div>{playbackState?.title}{playbackState?.duration}</div>

          {/* <iframe
            src={`https://open.spotify.com/embed/playlist/${id}`}
            width="300"
            height="380"
            frameBorder="0"
            allow="encrypted-media"
            allowtransparency="true"
          ></iframe> */}
        </div>}
      </div>

      <div className='flex-1 pt-4 overflow-auto max-h-[500px] no-scrollbar playlist-content'>
        {data.tracks?.items?.map((item) => {
          const track = item?.track ?? item;
          return (
            <div
              key={track?.id}
              className='song-item fadeup flex gap-3 overflow-hidden'
            >
              <Image
                width={48}
                height={48}
                src={track?.album?.images?.[0]?.url || data?.images?.[0]?.url || ''}
                className='shrink-0'
              />
              <div className='flex-1 truncate'>
                <div className='truncate'>{track?.name}</div>
                <div style={{ fontSize: 12 }} className='subtext truncate'>{track?.artists?.map(item => item.name).join(', ')}</div>
              </div>
              <div style={{ fontSize: 12 }} className='subtext shrink-0'>{formatDuration(track?.duration_ms)}</div>
            </div>
          );
        })}
      </div>
    </div>
  )
}
