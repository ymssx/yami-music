import { useEffect, useState } from "react";
import Playlist from "./playlist";
import { searchPlaylists } from "@/core/spotify/api";

export default () => {
  const [playlists, setPlaylists] = useState<any[]>([]);

  useEffect(() => {
    // getSpotifyPlaylists().then((res) => {
    //   console.log(res);
    //   setPlaylists(res.map(item => ({
    //     ...item,
    //     coverImageUrl: item?.images?.[0]?.url,
    //   })));
    // });
    searchPlaylists('billie').then((res) => {
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