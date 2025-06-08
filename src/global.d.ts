declare global {
  interface Window {
    Spotify: typeof Spotify;
    onSpotifyWebPlaybackSDKReady: () => void;
    getTokenJob: Promise<any>;
    initPlayerJob: Promise<any>;
  }

  namespace Spotify {
    interface PlayerInit {
      name: string;
      getOAuthToken: (cb: (token: string) => void) => void;
      volume?: number;
    }

    interface Player {
      connect(): Promise<boolean>;
      addListener(event: string, callback: (...args: any[]) => void): boolean;
      removeListener(event: string, callback: any): boolean;
      getCurrentState(): Promise<any>;
      pause(): Promise<void>;
      resume(): Promise<void>;
      previousTrack(): Promise<void>;
      nextTrack(): Promise<void>;
      activateElement(): Promise<void>;
    }
  }

  var Spotify: {
    Player: new (options: Spotify.PlayerInit) => Spotify.Player;
  };
}

export {};
