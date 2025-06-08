import { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
import Playlist from "./playlist";
import { searchPlaylists } from "@/core/spotify/api";

export default () => {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);

  useEffect(() => {
    searchPlaylists(queryParams.get('keyword') || '').then((res) => {
      console.log(res);
      setPlaylists(res.filter((item: any) => item?.id).map((item: any) => ({
        ...item,
        coverImageUrl: item?.images?.[0]?.url,
      })));
    });
  }, []);

  return (
    <div style={{ width: '100vw', height: '100%' }}>
      <Playlist playlists={playlists} />
    </div>
  );
};