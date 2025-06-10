import { useEffect, useState } from "react";
import { getGames } from "@/core/steam/api";
import MaterialList from "@/components/material-list";
import GameDetail from './detail';

export default () => {
  const [gameList, setGameList] = useState<any[]>([]);

  useEffect(() => {
    getGames('76561199148769423')
      .then((res) => {
        console.log(res);
        setGameList(res?.games?.map((item: any) => ({
          ...item,
          id: item.appid,
          name: item.name,
          description: '『星の冒険』は、未知の星々を探索し、失われた文明の秘密を解き明かすアクションRPGです。プレイヤーは、宇宙船の艦長となり、仲間とともに広大な銀河系を旅しながら、さまざまな惑星で発生する冒険を体験します。謎に満ちた遺跡や奇妙な生物たちと対峙し、強大な敵を倒して進んでいくのです。',
          // cover: `http://media.steampowered.com/steamcommunity/public/images/apps/${item.appid}/${item.img_icon_url}.jpg`,
          cover: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${item.appid}/library_600x900.jpg`,
        })));
      });
  }, []);

  return (
    <div style={{ width: '100vw', height: '100%' }}>
      <MaterialList
        list={gameList}
        size={[600, 900, 32]}
        gap={250}
        rotate={-Math.PI / 5}
        renderContent={(data) => <GameDetail {...data} />}
      />
    </div>
  );
};