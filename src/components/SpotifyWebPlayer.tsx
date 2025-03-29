"use client";
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

declare global {
  interface Window {
    Spotify: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Player: new (options: any) => any;
    };
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

const SpotifyWebPlayer = () => {
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [player, setPlayer] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [deviceId, setDeviceId] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isReady, setIsReady] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isActive, setIsActive] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  const [playerState, setPlayerState] = useState<any>(null);

  // Load the Spotify Web Playback SDK script
  useEffect(() => {
    if (!session?.accessToken) return;

    console.log('Session Access Token:', session.accessToken);

    // Only load script once
    if (document.getElementById('spotify-player')) {
      return;
    }

    const script = document.createElement('script');
    script.id = 'spotify-player';
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      initializePlayer(session.accessToken as string);
    };

    return () => {
      // Don't remove the script to prevent multiple initializations
      if (player) {
        player.disconnect();
      }
    };
  }, [session]);

  const initializePlayer = (token: string) => {
    const player = new window.Spotify.Player({
      name: 'Spotify Clone Web Player',
      getOAuthToken: (cb: (token: string) => void) => {
        cb(token);
      },
      volume: 0.5
    });

    player.addListener('initialization_error', ({ message }: { message: string }) => {
      console.error('Failed to initialize', message);
    });

    player.addListener('authentication_error', ({ message }: { message: string }) => {
      console.error('Failed to authenticate', message);
    });

    player.addListener('account_error', ({ message }: { message: string }) => {
      console.error('Failed to validate Spotify account', message);
    });

    player.addListener('playback_error', ({ message }: { message: string }) => {
      console.error('Failed to perform playback', message);
    });

    player.addListener('ready', ({ device_id }: { device_id: string }) => {
      console.log('Spotify Web Player SDK is ready with Device ID:', device_id);
      setDeviceId(device_id);
      setIsReady(true);
      transferPlayback(device_id, token);
    });

    player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
      console.log('Device ID has gone offline', device_id);
      setIsReady(false);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    player.addListener('player_state_changed', (state: any) => {
      if (!state) {
        setIsActive(false);
        return;
      }

      setPlayerState(state);
      setCurrentTrack(state.track_window.current_track);
      setIsActive(true);
    });

    player.connect()

    setPlayer(player);
  };

  const transferPlayback = async (deviceId: string, token: string) => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_ids: [deviceId],
          play: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error transferring playback:', errorData);
        return;
      }

      console.log('Transferred playback to this device');
    } catch (error) {
      console.error('Error transferring playback:', error);
    }
  };

  // This component doesn't render anything visual
  return null;
};

export default SpotifyWebPlayer;