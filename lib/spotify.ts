import { Session } from "next-auth";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const BASIC = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

export async function getAccessToken(session: Session | null) {
  if (!session || !session.accessToken) {
    throw new Error("No access token available");
  }
  return session.accessToken;
}

export async function refreshAccessToken(token: any) {
  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Basic ${BASIC}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("Error refreshing access token", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

let tokenRefreshPromise: Promise<any> | null = null;

export async function fetchFromSpotify(endpoint: string, session: Session | null, options = {}) {
  const executeRequest = async (token: string) => {
    console.log(`Bearer ${token}`)
    const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      ...options,
    });
    
    if (response.status === 401) {
      // Token expired, try to refresh
      if (!tokenRefreshPromise) {
        tokenRefreshPromise = refreshAccessToken(session);
      }
      
      try {
        const newToken = await tokenRefreshPromise;
        tokenRefreshPromise = null;
        
        // Retry the request with new token
        return executeRequest(newToken.accessToken);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        return { 
          success: false, 
          error: 'Session expired',
          data: null 
        };
      }
    }
    
    if (!response.ok) {
      console.error(`Spotify API error: ${response.status} for endpoint ${endpoint}`);
      return { 
        success: false, 
        error: `API error: ${response.status}`,
        data: null 
      };
    }

    try {
      const data = await response.json();
      return { success: true, data, error: null };
    } catch (error) {
      console.log(error)
      return { success: true, data:null, error: null }
    }
    
  };

  try {
    const accessToken = await getAccessToken(session);
    return executeRequest(accessToken);
  } catch (error) {
    console.error(`Error fetching from Spotify for ${endpoint}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error",
      data: null 
    };
  }
}

// Featured API endpoints
export async function getFeaturedPlaylists(session: Session | null) {
  const result = await fetchFromSpotify("/browse/featured-playlists", session);
  return result.success ? result.data : { playlists: { items: [] }, message: "Unable to load featured playlists" };
}

export async function getNewReleases(session: Session | null) {
  const result = await fetchFromSpotify("/browse/new-releases", session);
  return result.success ? result.data : { albums: { items: [] } };
}

export async function getUserPlaylists(session: Session | null) {
  const result = await fetchFromSpotify("/me/playlists", session);
  return result.success ? result.data : { items: [] };
}

export async function getPlaylist(id: string, session: Session | null) {
  const result = await fetchFromSpotify(`/playlists/${id}`, session);
  return result.success ? result.data : null;
}

export async function getPlaylistTracks(id: string, session: Session | null) {
  const result = await fetchFromSpotify(`/playlists/${id}/tracks`, session);
  return result.success ? result.data : { items: [] };
}

export async function getAlbum(id: string, session: Session | null) {
  const result = await fetchFromSpotify(`/albums/${id}`, session);
  return result.success ? result.data : null;
}

export async function getAlbumTracks(id: string, session: Session | null) {
  const result = await fetchFromSpotify(`/albums/${id}/tracks`, session);
  return result.success ? result.data : { items: [] };
}

export async function getTrack(id: string, session: Session | null) {
  const result = await fetchFromSpotify(`/tracks/${id}`, session);
  return result.success ? result.data : null;
}

export async function getArtist(id: string, session: Session | null) {
  const result = await fetchFromSpotify(`/artists/${id}`, session);
  return result.success ? result.data : null;
}

// Check if track is saved in user's library
export async function isTrackSaved(trackId: string, session: Session | null) {
  const result = await fetchFromSpotify(`/me/tracks/contains?ids=${trackId}`, session);
  return result.success ? result.data[0] : false;
}

// Save track to user's library (like)
export async function saveTrack(trackId: string, session: Session | null) {
  const result = await fetchFromSpotify(`/me/tracks?ids=${trackId}`, session, {
    method: 'PUT',
  });
  return result.success;
}

// Remove track from user's library (unlike)
export async function removeTrack(trackId: string, session: Session | null) {
  const result = await fetchFromSpotify(`/me/tracks?ids=${trackId}`, session, {
    method: 'DELETE',
  });
  return result.success;
}

export async function searchSpotify(query: string, types: string[], session: Session | null) {
  const typesString = types.join(',');
  const result = await fetchFromSpotify(`/search?q=${encodeURIComponent(query)}&type=${typesString}&market=from_token&limit=20`, session);
  return result.success ? result.data : {};
}


export async function getRecommendedTracks(session: Session | null) {
  const result = await fetchFromSpotify("/recommendations", session, {
    method: "GET",
  });
  return result.success ? result.data : { tracks: [] };
}

export async function getArtistAlbums(id: string, session: Session | null) {
  const result = await fetchFromSpotify(`/artists/${id}/albums?market=from_token&limit=48`, session, { method: "GET" });
  if (!result.success) {
    return { items: [] };
  }

  // Filter unique albums by name and sort by popularity
  const uniqueAlbums = Array.from(
    new Map(result.data.items.map((album: any) => [album.name, album])).values()
  );

  return { items: uniqueAlbums };
}

// Add queue management functions
export async function getSpotifyQueue(session: Session | null) {
  const result = await fetchFromSpotify('/me/player/queue', session);
  return result.success ? result.data : { queue: [] };
}