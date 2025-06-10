import { useEffect, useState } from "react";
import { getAllUserPlaylists } from "@/core/spotify/api";
import MaterialList from "@/components/material-list";
import Ablum from '@/view/playlist/album';

export default () => {
  const [playlist, setPlaylists] = useState<any[]>([]);

  useEffect(() => {
    getAllUserPlaylists().then((res) => {
      console.log(res);
      setPlaylists(res.map((item: any) => ({
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