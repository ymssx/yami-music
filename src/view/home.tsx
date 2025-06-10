import { useEffect, useState } from "react";
import { getAlbums, getAllUserPlaylists } from "@/core/spotify/api";
import MaterialList from "@/components/material-list";
import Ablum from '@/view/playlist/album';

export default () => {
  const [albums, setAlbums] = useState<any[]>([]);
  const [playlist, setPlaylists] = useState<any[]>([]);

  useEffect(() => {
    getAllUserPlaylists().then((res) => {
      setPlaylists(res.map((item: any) => ({
          ...item,
          cover: item?.images?.[0]?.url,
        })) || []);
    });
    getAlbums().then((res) => {
      setAlbums(res.map((item: any) => ({
          ...item?.album,
          cover: item?.album?.images?.[0]?.url,
        })) || []);
    });
  }, [playlist]);

  return (
    <div style={{ width: '100vw', height: '100%' }}>
      <MaterialList list={[...playlist, ...albums]} size={[500, 500, 8]} renderContent={(data) => <Ablum {...data} />} />
    </div>
  );
};