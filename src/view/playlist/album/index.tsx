import Image from '@/components/image';
import { useEffect, useState } from 'react';
import { getAlbumDetails, getPlaylistDetails, hasUserFollowedPlaylist, playPlaylist, followPlaylist, unfollowPlaylist, getMySavedTracks } from '@/core/spotify/api';
import { useSpotifyPlaybackState } from '@/core/spotify/player';
import DOMPurify from 'dompurify';
import './style.less';
import { Link } from 'react-router-dom';
import { Flame, Heart, HeartOff, Tag, UserRound } from 'lucide-react';
import Button from '@/components/button';

function formatDuration(ms: number) {
  const seconds = Math.floor(ms / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function PlaylistViewer(props: { id: string; type: string; className?: string }) {
  const { className, id, type } = props;
  const [data, setData] = useState<{
    id?: string;
    name?: string;
    description?: string;
    images?: { url: string }[];
    uri?: string;
    artists?: { name: string; id: string }[];
    owner?: { display_name: string };
    followers?: { total: number };
    popularity?: number;
    label?: string;
    tracks?: {
      items: {
        track: {
          uri: string;
          id: string;
          name: string;
          artists: { name: string }[];
          duration_ms: number;
          album: { images: { url: string }[] };
        };
      }[];
    };
  }>({});
  const [hasFollowed, setHasFollowed] = useState(false);

  const playbackState = useSpotifyPlaybackState();

  useEffect(() => {
    if (type === 'playlist') {
      getPlaylistDetails(id)
        .then((res) => {
          setData(res || {});
        });
    } else if (type === 'saved-tracks') {
      getMySavedTracks().then((res) => {
        setData({
          ...props,
          tracks: res,
        });
      })
    } else {
      getAlbumDetails(id)
       .then((res) => {
          setData(res || {});
        });
    }

    if (type !== 'saved-tracks') {
      hasUserFollowedPlaylist(id).then((res) => {
        setHasFollowed(res);
      });
    }
  }, [id]);

  return (
    <div className={`${className} playlist`}>
      <div className='shrink-0 playlist-info'>
        {data?.name && <div className='mb-4 fadeappear slower '>
          <h1 className=''>{data.name}</h1>
          {data.description && <p className='mt-3 whitespace-pre-line' dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.description || '') }}></p>}

          <div className='mt-3 flex gap-3 flex-wrap'>
            {data?.label && <p className='flex items-center gap-[3px]'>
              <Tag size={16} />{ data?.label }
            </p>}
            {!!data?.artists?.length && <p className='flex items-center gap-[3px]'>
              <UserRound size={16} />{ data?.artists?.map(item => (<Link target='_blank' to={`/ablums?id=${item.id}`}>{item.name}</Link>)) }
            </p>}
            {!!data?.owner && <p>
              { data?.owner?.display_name }
            </p>}
            {!!(data?.followers?.total ?? data?.popularity) && <p className='flex items-center gap-[3px]'><Flame size={16} />{data?.followers?.total ?? data?.popularity}</p>}
          </div>

          <section className="mt-6 flex gap-3">
            {type !== 'saved-tracks' && <Button onClick={async () => {
              hasFollowed? await unfollowPlaylist(id) : await followPlaylist(id);
              setHasFollowed(!hasFollowed);
            }}>{hasFollowed ? <HeartOff size={16} /> : <Heart size={16} />}</Button>}
            <Button className="highlight flex items-center gap-2" onClick={async () => {
              await window.initPlayerJob;
              return playPlaylist({
                ...data?.uri ? { context_uri: data?.uri } : {
                  uris: data?.tracks?.items?.map(item => item?.track?.uri) || [],
                },
              });
            }}>PLAY</Button>
          </section>

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

      <div className='flex-1 pt-4 no-scrollbar playlist-content'>
        {data.tracks?.items?.map((item, index) => {
          const track = item?.track ?? item;
          return (
            <div
              key={track?.id}
              className='song-item fadeup'
            >
              <div
                className={`song-item-inner flex gap-3 overflow-hidden ${playbackState?.id === track?.id ? 'active' : ''}`}
                onClick={async () => {
                  await window.initPlayerJob;
                  return playPlaylist({
                    ...data?.uri ? { context_uri: data?.uri } : {
                      uris: data?.tracks?.items?.map(item => item?.track?.uri) || [],
                    },
                    offset: {
                      position: index,
                    },
                  });
                }}
              >
                <Image
                  width={48}
                  height={48}
                  src={track?.album?.images?.[0]?.url || data?.images?.[0]?.url || ''}
                  className='shrink-0'
                />
                <div className='flex-1 truncate flex flex-col'>
                  <div className="truncate align-text-top song-name">{track?.name}</div>
                  <div className='song-subname subtext truncate mt-2'>{track?.artists?.map(item => item.name).join(', ')}</div>
                </div>
                <div className='subtext shrink-0 text-sm'>{formatDuration(track?.duration_ms)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}
