import Image from '@/components/image';

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

export default function PlaylistViewer({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div>
        <div className='mb-8 fadeappear slower '>
          <h1>{playlist.name}</h1>
          <p className='mt-2 text-sm'>{playlist.description}</p>

          <section className="my-2 mt-4">
            <button className="">Play</button>
          </section>
        </div>
      </div>

      <div>
        {playlist.songs.map((song, index) => (
          <div
            key={song.id}
            className='fadeup flex mb-2 py-2 gap-3'
            style={{ animationDelay: `${index * 0.3}s` }} // 每个项延迟不同时间
          >
            <Image
              width={48}
              height={48}
              src={song.coverUrl}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500 }}>{song.name}</div>
              <div style={{ fontSize: 12 }} className='subtext'>{song.artists.join(', ')}</div>
            </div>
            <div style={{ fontSize: 12 }} className='subtext'>{formatDuration(song.duration)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
