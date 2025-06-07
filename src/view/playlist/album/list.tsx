const playlist = {
  id: 'pl_001',
  name: '轻松午后播放列表',
  description: '精选适合午后放松的音乐，让你沉浸在惬意的时光中。',
  coverUrl: 'https://example.com/playlist-cover.jpg',
  songs: [
    {
      id: 'song_001',
      name: 'Sunshine Melody',
      coverUrl: 'https://example.com/song1-cover.jpg',
      duration: 245, // 秒
      artists: ['Luna Waves']
    },
    {
      id: 'song_002',
      name: 'Coffee Break',
      coverUrl: 'https://example.com/song2-cover.jpg',
      duration: 198,
      artists: ['The Chillouts', 'Miko']
    },
    {
      id: 'song_003',
      name: 'Lazy Afternoon',
      coverUrl: 'https://example.com/song3-cover.jpg',
      duration: 312,
      artists: ['Ocean Breeze']
    },
    {
      id: 'song_004',
      name: 'Warm Light',
      coverUrl: 'https://example.com/song4-cover.jpg',
      duration: 275,
      artists: ['Kaze']
    }
  ]
}

console.log(playlist);
