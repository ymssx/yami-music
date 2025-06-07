import Image from '@/components/image';
import { useEffect, useState } from 'react';
import { getPlaylistDetails } from '@/core/spotify';
import DOMPurify from 'dompurify';

const playlist = {
  id: 'pl_001',
  name: 'ラヴレター',
  description: '《情书》（英语：Love Letter，日语：ラヴレター）是一部1995年上映的日本青春爱情电影，由岩井俊二执导，中山美穗等人主演。',
  coverUrl: 'https://picsum.photos/500?random=123332',
  songs: [
    {
      id: 'song_001',
      name: 'Sunshine Melody',
      coverUrl: 'https://picsum.photos/500?random=1',
      duration: 245,
      artists: ['Luna Waves']
    },
    {
      id: 'song_002',
      name: 'Coffee Break',
      coverUrl: 'https://picsum.photos/500?random=122',
      duration: 198,
      artists: ['The Chillouts', 'Miko']
    },
    {
      id: 'song_003',
      name: 'Lazy Afternoon',
      coverUrl: 'https://picsum.photos/500?random=123213',
      duration: 312,
      artists: ['Ocean Breeze']
    },
    {
      id: 'song_004',
      name: 'Warm Light',
      coverUrl: 'https://picsum.photos/500?random=12333',
      duration: 275,
      artists: ['Kaze']
    }
  ]
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function PlaylistViewer({ className, id }: { id: string; className?: string }) {
  const [data, setData] = useState<{
    id?: string;
    name?: string;
    description?: string;
    images?: { url: string }[];
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
  useEffect(() => {
    getPlaylistDetails(id)
      .then((res) => {
        setData(res);
      });
  }, [id]);
  return (
    <div className={`${className} flex flex-col min-[500px]`}>
      <div className='flex-0'>
        <div className='mb-4 fadeappear slower '>
          <h1>{data.name}</h1>
          <p className='mt-2 text-sm' dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.description || '') }}></p>

          <section className="my-2 mt-4">
            <button className="">Play</button>
          </section>
        </div>
      </div>

      <div className='flex-1 pt-4 overflow-auto max-h-[500px] no-scrollbar'>
        {data.tracks?.items?.map(({ track }, index) => (
          <div
            key={track?.id}
            className='fadeup flex mb-2 py-2 gap-3'
          >
            <Image
              width={48}
              height={48}
              src={track?.album?.images?.[0]?.url || ''}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500 }}>{track?.name}</div>
              <div style={{ fontSize: 12 }} className='subtext'>{track?.artists.map(item => item.name).join(', ')}</div>
            </div>
            <div style={{ fontSize: 12 }} className='subtext'>{formatDuration(track?.duration_ms)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
