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

export async function fetchFromSpotify(endpoint: string, session: Session | null, options = {}) {
  const accessToken = await getAccessToken(session);
  
  const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`Spotify API error: ${response.status}`);
  }
  
  return await response.json();
}

// Featured API endpoints
export async function getFeaturedPlaylists(session: Session | null) {
  return fetchFromSpotify("/browse/featured-playlists", session);
}

export async function getNewReleases(session: Session | null) {
  return fetchFromSpotify("/browse/new-releases", session);
}

export async function getUserPlaylists(session: Session | null) {
  return fetchFromSpotify("/me/playlists", session);
}

export async function getPlaylist(id: string, session: Session | null) {
  return fetchFromSpotify(`/playlists/${id}`, session);
}

export async function getAlbum(id: string, session: Session | null) {
  return fetchFromSpotify(`/albums/${id}`, session);
}

export async function getArtist(id: string, session: Session | null) {
  return fetchFromSpotify(`/artists/${id}`, session);
}

export async function searchSpotify(query: string, types: string[], session: Session | null) {
  const typesString = types.join(',');
  return fetchFromSpotify(`/search?q=${encodeURIComponent(query)}&type=${typesString}`, session);
}