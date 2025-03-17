"use client";
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { Session } from 'next-auth';
import { useSession } from 'next-auth/react';

interface Track {
  id: string;
  name: string;
  album: {
    images: { url: string }[];
    name: string;
  };
  artists: { name: string }[];
  duration_ms: number;
  uri: string;
}

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  playTrack: (trackId: string, session: Session | null) => Promise<void>;
  pauseTrack: () => void;
  resumeTrack: () => void;
  setVolume: (value: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seekPosition: (positionMs: number) => void;
  deviceId: string | null;
  queue: Track[];
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  skipToNext: () => Promise<void>;
  skipToPrevious: () => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session } = useSession();
  const [player, setPlayer] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(50);
  const [queue, setQueue] = useState<Track[]>([]);
  const [playHistory, setPlayHistory] = useState<Track[]>([]);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const [initializationState, setInitializationState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const initAttempts = useRef(0);
  const MAX_INIT_ATTEMPTS = 3;
  const [reconnectionAttempts, setReconnectionAttempts] = useState(0);
  const MAX_RECONNECTION_ATTEMPTS = 3;
  const RECONNECTION_INTERVAL = 5000; // 5 seconds

  // Initialize the Spotify Web Playback SDK when session is available
  useEffect(() => {
    if (typeof window !== 'undefined' && session?.accessToken && initializationState === 'idle') {
      const initPlayer = () => {
        setInitializationState('loading');
        
        if (!document.getElementById('spotify-player')) {
          console.log('Loading Spotify Web Playback SDK script...');
          const script = document.createElement('script');
          script.id = 'spotify-player';
          script.src = 'https://sdk.scdn.co/spotify-player.js';
          script.async = true;
          
          script.onerror = () => {
            console.error('Failed to load Spotify SDK script');
            setInitializationState('error');
          };
          
          document.body.appendChild(script);
          
          window.onSpotifyWebPlaybackSDKReady = () => {
            console.log('Spotify Web Playback SDK is ready');
            initializePlayer(session.accessToken as string);
          };
        } else if (window.Spotify) {
          console.log('Spotify SDK already loaded, initializing player...');
          initializePlayer(session.accessToken as string);
        } else {
          // SDK script is present but not loaded yet
          const checkSDK = setInterval(() => {
            if (window.Spotify) {
              clearInterval(checkSDK);
              initializePlayer(session.accessToken as string);
            } else {
              initAttempts.current++;
              if (initAttempts.current >= MAX_INIT_ATTEMPTS) {
                clearInterval(checkSDK);
                setInitializationState('error');
                console.error('Failed to initialize Spotify SDK after maximum attempts');
              }
            }
          }, 1000);
        }
      };

      initPlayer();
    }
  }, [session, initializationState]);

  // Initialize player when SDK is ready and we have a session
  const initializePlayer = (token: string) => {
    if (!window.Spotify || !token || player) {
      setInitializationState('error');
      return;
    }

    // Validate token before initializing
    fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).then(response => {
      if (!response.ok) {
        throw new Error('Token validation failed');
      }
      return response.json();
    }).then(() => {
      console.log('Token validated, initializing Spotify player');
      
      const newPlayer = new window.Spotify.Player({
        name: 'Spotify Clone Web Player',
        getOAuthToken: async (cb: (token: string) => void) => {
          try {
            cb(token);
          } catch (error) {
            console.error('Error fetching token:', error);
            window.location.reload();
          }
        },
        volume: volume / 100
      });

      // Add error listeners
      newPlayer.addListener('initialization_error', ({ message }: { message: string }) => {
        console.error('Player initialization error:', message);
        // Consider refreshing the page or showing user feedback
        alert('Failed to initialize Spotify player. Please refresh the page and try again.');
      });

      // Error handling
      newPlayer.addListener('initialization_error', ({ message }: { message: string }) => {
        console.error('Failed to initialize player:', message);
      });
      
      newPlayer.addListener('authentication_error', ({ message }: { message: string }) => {
        console.error('Failed to authenticate player:', message);
      });
      
      newPlayer.addListener('account_error', ({ message }: { message: string }) => {
        console.error('Premium account required:', message);
        alert('Spotify Premium is required to use the Web Playback SDK. Using preview mode instead.');
      });
      
      newPlayer.addListener('playback_error', ({ message }: { message: string }) => {
        console.error('Playback error:', message);
      });

      // Player status
      newPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
        console.log('Player ready with device ID:', device_id);
        setDeviceId(device_id);
        
        // Transfer playback to this device
        transferPlayback(device_id, token);
      });
      
      newPlayer.addListener('not_ready', ({ device_id }: { device_id: string }) => {
        console.log('Device ID has gone offline:', device_id);
      });
      
      // Playback state
      newPlayer.addListener('player_state_changed', (state: any) => {
        if (!state) {
          setIsPlaying(false);
          return;
        }
        
        // Update current track
        const currentTrackInfo = state.track_window.current_track;
        setCurrentTrack({
          id: currentTrackInfo.id,
          name: currentTrackInfo.name,
          album: {
            images: currentTrackInfo.album.images,
            name: currentTrackInfo.album.name
          },
          artists: currentTrackInfo.artists,
          duration_ms: currentTrackInfo.duration_ms,
          uri: currentTrackInfo.uri
        });
        
        // Update playback state
        setIsPlaying(!state.paused);
        setProgress((state.position / state.duration) * 100);
        
        // Update progress with a timer since the SDK doesn't provide real-time updates
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
        
        if (!state.paused) {
          progressInterval.current = setInterval(() => {
            newPlayer.getCurrentState().then((state: any) => {
              if (state) {
                setProgress((state.position / state.duration) * 100);
              }
            });
          }, 1000);
        }
      });
      
      // Connect and store the player
      newPlayer.connect()
        .then((success: boolean) => {
          if (success) {
            console.log('The Web Playback SDK successfully connected to Spotify!');
            setPlayer(newPlayer);
            setInitializationState('ready');
          } else {
            console.error('Failed to connect to Spotify');
            setInitializationState('error');
          }
        })
        .catch((error: any) => {
          console.error('Error connecting to Spotify:', error);
          setInitializationState('error');
        });
    }).catch(error => {
      console.error('Failed to validate token:', error);
      setInitializationState('error');
    });
  };

  const transferPlayback = async (deviceId: string, token: string) => {
    try {
      await fetch('https://api.spotify.com/v1/me/player', {
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
      console.log('Transferred playback to this device');
    } catch (error) {
      console.error('Error transferring playback:', error);
    }
  };

  // Play a specific track
  const playTrack = async (trackId: string, session: Session | null) => {
    console.log('Attempting to play track:', trackId, { hasSession: !!session, deviceId });
    
    if (!session?.accessToken) {
      console.error('Cannot play: missing access token');
      return;
    }
    
    // If player not initialized or device ID not ready, initialize and wait
    if (!deviceId) {
      console.log('Device ID not ready, initializing player...');
      
      if (!player && window.Spotify) {
        console.log('Initializing player from playTrack');
        initializePlayer(session.accessToken as string);
        
        // Wait a bit for initialization and retry
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (!deviceId) {
          console.error('Device ID still not available after initialization');
          alert('Could not initialize Spotify playback. Please make sure you have a Premium account and try again.');
          return;
        }
      } else {
        console.error('SDK not ready or player cannot be initialized');
        return;
      }
    }
    
    try {
      console.log('Playing track on device:', deviceId);
      
      // Play the track using the Spotify Connect API
      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: [`spotify:track:${trackId}`],
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error playing track (${response.status}):`, errorText);
        
        // If unauthorized, refresh the page to get a new token
        if (response.status === 401) {
          alert('Your session has expired. Please reload the page to continue.');
          window.location.reload();
        }
      } else {
        console.log('Track playback started successfully');
      }
    } catch (error) {
      console.error('Error playing track:', error);
    }

    try {
      const trackResponse = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
      });
      
      if (!trackResponse.ok) {
        throw new Error('Failed to fetch track details');
      }
      
      const trackData = await trackResponse.json();
      const trackInfo: Track = {
        id: trackData.id,
        name: trackData.name,
        album: {
          images: trackData.album.images,
          name: trackData.album.name
        },
        artists: trackData.artists,
        duration_ms: trackData.duration_ms,
        uri: trackData.uri
      };
      
      setCurrentTrack(trackInfo);
      setIsPlaying(true);
      
      // Clear the play history when starting a new track directly
      if (!queue.some(t => t.id === trackId) && !playHistory.some(t => t.id === trackId)) {
        setPlayHistory([]);
      }
    } catch (error) {
      console.error('Failed to play track:', error);
    }
  };

  // Pause the current track
  const pauseTrack = () => {
    if (!player) return;
    
    player.pause().then(() => {
      setIsPlaying(false);
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    });
  };

  // Resume playback
  const resumeTrack = () => {
    if (!player) return;
    
    player.resume().then(() => {
      setIsPlaying(true);
      // Restart progress tracking
      if (!progressInterval.current) {
        progressInterval.current = setInterval(() => {
          player.getCurrentState().then((state: any) => {
            if (state) {
              setProgress((state.position / state.duration) * 100);
            }
          });
        }, 1000);
      }
    });
  };

  // Set volume (0-100)
  const setPlayerVolume = (value: number) => {
    setVolume(value);
    if (player) {
      player.setVolume(value / 100);
    }
  };

  // Skip to next track
  const nextTrack = () => {
    if (!player) return;
    player.nextTrack();
  };

  // Go to previous track
  const previousTrack = () => {
    if (!player) return;
    player.previousTrack();
  };

  // Seek to position
  const seekPosition = (positionMs: number) => {
    if (!player || !currentTrack) return;
    
    const positionPercent = positionMs / currentTrack.duration_ms;
    player.seek(positionMs);
    setProgress(positionPercent * 100);
  };

  const addToQueue = (track: Track) => {
    setQueue(prev => [...prev, track]);
  };

  const removeFromQueue = (trackId: string) => {
    setQueue(prev => prev.filter(track => track.id !== trackId));
  };

  const clearQueue = () => {
    setQueue([]);
  };

  const skipToNext = async () => {
    if (!player || !session) return;
    
    if (queue.length > 0) {
      const nextTrack = queue[0];
      setQueue(prev => prev.slice(1));
      if (currentTrack) {
        setPlayHistory(prev => [...prev, currentTrack]);
      }
      await playTrack(nextTrack.id, session);
    }
  };

  const skipToPrevious = async () => {
    if (!player || !session) return;
    
    if (playHistory.length > 0) {
      const previousTrack = playHistory[playHistory.length - 1];
      setPlayHistory(prev => prev.slice(0, -1));
      if (currentTrack) {
        setQueue(prev => [currentTrack, ...prev]);
      }
      await playTrack(previousTrack.id, session);
    }
  };

  const attemptReconnection = async () => {
    if (reconnectionAttempts >= MAX_RECONNECTION_ATTEMPTS) {
      console.error('Max reconnection attempts reached');
      setInitializationState('error');
      return;
    }

    setReconnectionAttempts(prev => prev + 1);
    
    try {
      if (player) {
        const connected = await player.connect();
        if (connected) {
          console.log('Successfully reconnected to Spotify');
          setReconnectionAttempts(0);
          return;
        }
      }
      
      // If player reconnection failed, reinitialize
      if (session?.accessToken) {
        console.log('Attempting to reinitialize player...');
        initializePlayer(session.accessToken);
      }
    } catch (error) {
      console.error('Reconnection attempt failed:', error);
      // Try again after interval
      setTimeout(attemptReconnection, RECONNECTION_INTERVAL);
    }
  };

  // Add not_ready listener with reconnection logic
  useEffect(() => {
    if (player) {
      player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
        console.log('Device ID has gone offline:', device_id);
        attemptReconnection();
      });
    }
  }, [player, session]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      if (player) {
        player.removeListener('not_ready');
        player.disconnect();
      }
    };
  }, [player]);

  return (
    <PlayerContext.Provider value={{
      currentTrack,
      isPlaying,
      progress,
      volume,
      playTrack,
      pauseTrack,
      resumeTrack,
      setVolume: setPlayerVolume,
      nextTrack,
      previousTrack,
      seekPosition,
      deviceId,
      queue,
      addToQueue,
      removeFromQueue,
      clearQueue,
      skipToNext,
      skipToPrevious,
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};