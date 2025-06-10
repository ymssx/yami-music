import { useEffect, useState } from "react";
import { getArtistAlbums } from "@/core/spotify/api";
import MaterialList from "@/components/material-list";
import Ablum from '@/view/playlist/album';
import { useLocation } from "react-router-dom";

export default () => {
  const [playlist, setPlaylists] = useState<any[]>([]);
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);

  useEffect(() => {
    getArtistAlbums(queryParams.get('id') || '').then((res) => {
      console.log(res);
      setPlaylists(res.filter((item: any) => item?.id).map((item: any) => ({
        ...item,
        cover: item?.images?.[0]?.url,
      })));
    });
  }, []);

  return (
    <div style={{ width: '100vw', height: '100%' }}>
      <MaterialList list={playlist} size={[500, 500, 8]} renderContent={(data) => <Ablum {...data} />} />
    </div>
  );
};