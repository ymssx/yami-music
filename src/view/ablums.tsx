import { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
import Playlist from "./playlist";
import { getArtistAlbums } from "@/core/spotify/api";

export default () => {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);

  useEffect(() => {
    getArtistAlbums(queryParams.get('id') || '').then((res) => {
      console.log(res);
      setPlaylists(res.filter((item: any) => item?.id).map((item: any) => ({
        ...item,
        coverImageUrl: item?.images?.[0]?.url,
      })));
    });
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Playlist playlists={playlists} />
    </div>
  );
};