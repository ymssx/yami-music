export function getGames(steamId: string) {
    return Promise.resolve({
        "game_count": 10,
        "games": [
            {
                "appid": 105600,
                "name": "Terraria",
                "playtime_forever": 44,
                "img_icon_url": "858961e95fbf869f136e1770d586e0caefd4cfac",
                "has_community_visible_stats": true,
                "playtime_windows_forever": 36,
                "playtime_mac_forever": 8,
                "playtime_linux_forever": 0,
                "playtime_deck_forever": 0,
                "rtime_last_played": 1745043607,
                "playtime_disconnected": 0,
                description: '『星の冒険』は、未知の星々を探索し、失われた文明の秘密を解き明かすアクションRPGです。プレイヤーは、宇宙船の艦長となり、仲間とともに広大な銀河系を旅しながら、さまざまな惑星で発生する冒険を体験します。謎に満ちた遺跡や奇妙な生物たちと対峙し、強大な敵を倒して進んでいくのです。'
            },
            {
                "appid": 431960,
                "name": "Wallpaper Engine",
                "playtime_forever": 15,
                "img_icon_url": "72edaed9d748c6cf7397ffb1c83f0b837b9ebd9d",
                "has_community_visible_stats": true,
                "playtime_windows_forever": 15,
                "playtime_mac_forever": 0,
                "playtime_linux_forever": 0,
                "playtime_deck_forever": 0,
                "rtime_last_played": 1620185514,
                "playtime_disconnected": 0
            },
            {
                "appid": 546560,
                "name": "Half-Life: Alyx",
                "playtime_forever": 134,
                "img_icon_url": "225032ac2ad1aca8f5fd98baa2b9daf1eebea5ca",
                "has_community_visible_stats": true,
                "playtime_windows_forever": 134,
                "playtime_mac_forever": 0,
                "playtime_linux_forever": 0,
                "playtime_deck_forever": 0,
                "rtime_last_played": 1642943280,
                "content_descriptorids": [
                    2,
                    5
                ],
                "playtime_disconnected": 0
            },
            {
                "appid": 703080,
                "name": "Planet Zoo",
                "playtime_forever": 17,
                "img_icon_url": "68c7a610498955f547b0ece0aff081d23f2025b5",
                "has_community_visible_stats": true,
                "playtime_windows_forever": 17,
                "playtime_mac_forever": 0,
                "playtime_linux_forever": 0,
                "playtime_deck_forever": 0,
                "rtime_last_played": 1649860605,
                "playtime_disconnected": 0
            },
            {
                "appid": 873570,
                "name": "Monster Sanctuary Demo",
                "playtime_forever": 9,
                "img_icon_url": "35e86c5470c9258e13ea127c0a72f7da7502ebe6",
                "playtime_windows_forever": 9,
                "playtime_mac_forever": 0,
                "playtime_linux_forever": 0,
                "playtime_deck_forever": 0,
                "rtime_last_played": 1741347311,
                "playtime_disconnected": 0
            },
            {
                "appid": 788100,
                "name": "Neon Abyss",
                "playtime_forever": 3172,
                "img_icon_url": "78dfe88f6e4e2d36bf916c88a8100d546989a9e3",
                "has_community_visible_stats": true,
                "playtime_windows_forever": 3172,
                "playtime_mac_forever": 0,
                "playtime_linux_forever": 0,
                "playtime_deck_forever": 0,
                "rtime_last_played": 1660020293,
                "playtime_disconnected": 0
            },
            {
                "appid": 1449850,
                "name": "Yu-Gi-Oh!  Master Duel",
                "playtime_2weeks": 61,
                "playtime_forever": 25246,
                "img_icon_url": "e87d78e42668f44fabde2da773385148e2f529bd",
                "has_community_visible_stats": true,
                "playtime_windows_forever": 25246,
                "playtime_mac_forever": 0,
                "playtime_linux_forever": 0,
                "playtime_deck_forever": 0,
                "rtime_last_played": 1748677762,
                "playtime_disconnected": 0
            },
            {
                "appid": 1293830,
                "name": "Forza Horizon 4",
                "playtime_forever": 0,
                "img_icon_url": "7c993f9089d54fe2767efec47b75a7009cdd632e",
                "has_community_visible_stats": true,
                "playtime_windows_forever": 0,
                "playtime_mac_forever": 0,
                "playtime_linux_forever": 0,
                "playtime_deck_forever": 0,
                "rtime_last_played": 0,
                "playtime_disconnected": 0
            },
            {
                "appid": 1551360,
                "name": "Forza Horizon 5",
                "playtime_forever": 991,
                "img_icon_url": "6c1d20c62c4613263548323052c62cece488876b",
                "has_community_visible_stats": true,
                "playtime_windows_forever": 991,
                "playtime_mac_forever": 0,
                "playtime_linux_forever": 0,
                "playtime_deck_forever": 0,
                "rtime_last_played": 1729607647,
                "playtime_disconnected": 0
            },
            {
                "appid": 2358720,
                "name": "Black Myth: Wukong",
                "playtime_forever": 231,
                "img_icon_url": "764ad8ff458f7020d63a3f7f0abf6ad8882c05df",
                "has_community_visible_stats": true,
                "playtime_windows_forever": 231,
                "playtime_mac_forever": 0,
                "playtime_linux_forever": 0,
                "playtime_deck_forever": 0,
                "rtime_last_played": 1726412832,
                "content_descriptorids": [
                    2,
                    5
                ],
                "playtime_disconnected": 0
            }
        ]
    });
    return window.electronAPI?.getSteamData(steamId);
}