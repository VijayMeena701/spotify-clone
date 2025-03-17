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
    
    const data = await response.json();
    return { success: true, data, error: null };
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

export async function searchSpotify(query: string, types: string[], session: Session | null) {
  const typesString = types.join(',');
  const result = await fetchFromSpotify(`/search?q=${encodeURIComponent(query)}&type=${typesString}`, session);
  return result.success ? result.data : {};
}

// Function to get recommended tracks with available previews
// export async function getRecommendedTracks(session: Session | null) {
//   try {
//     // First get some seed genres
//     const genresResult = await fetchFromSpotify(`/recommendations/available-genre-seeds`, session);
//     if (!genresResult.success || !genresResult.data?.genres?.length) {
//       console.error("Failed to get genre seeds");
//       return { tracks: [] };
//     }
    
//     // Take 3 random genres as seeds
//     const allGenres = genresResult.data.genres;
//     const selectedGenres = [];
//     for (let i = 0; i < 3 && allGenres.length > 0; i++) {
//       const randomIndex = Math.floor(Math.random() * allGenres.length);
//       selectedGenres.push(allGenres[randomIndex]);
//       allGenres.splice(randomIndex, 1);
//     }
    
//     // Get recommended tracks with these genres, filtering for only those with preview URLs
//     const result = await fetchFromSpotify(
//       `/recommendations?limit=20&seed_genres=${selectedGenres.join(',')}`, 
//       session
//     );
    
//     if (!result.success) {
//       console.error("Failed to get recommendations");
//       return { tracks: [] };
//     }
    
//     // Filter to only tracks with preview_url
//     const tracksWithPreviews = result.data.tracks.filter(track => track.preview_url);
//     console.log(`Found ${tracksWithPreviews.length} tracks with previews out of ${result.data.tracks.length}`);
    
//     return { tracks: tracksWithPreviews };
//   } catch (error) {
//     console.error("Error getting recommended tracks:", error);
//     return { tracks: [] };
//   }
// }