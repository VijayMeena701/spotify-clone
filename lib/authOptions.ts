import type { NextAuthConfig } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import GoogleProvider from "next-auth/providers/google";
// import FacebookProvider from "next-auth/providers/facebook";
// import GithubProvider from "next-auth/providers/github";
import SpotifyProvider from "next-auth/providers/spotify";
import { refreshAccessToken } from "./spotify";

declare module "next-auth" {
  interface Session {
    user: any;
    accessToken: string;
    error: string;
  }
}

declare module "next-auth" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    username?: string;
    accessTokenExpires?: number;
    error?: string;
    user?: any;
  }
}

export const authOptions: NextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      authorization: `https://accounts.spotify.com/authorize?scope=${encodeURIComponent("ugc-image-upload user-read-playback-state user-modify-playback-state user-read-currently-playing app-remote-control streaming playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private user-follow-modify user-follow-read user-read-playback-position user-top-read user-read-recently-played user-library-modify user-library-read user-read-email user-read-private")}`
    }),
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    //   authorization: {
    //     params: {
    //       prompt: "consent",
    //       access_type: "offline",
    //       response_type: "code",
    //     },
    //   },
    // }),
    // FacebookProvider({
    //   clientId: process.env.FACEBOOK_CLIENT_ID,
    //   clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    // }),
    // GithubProvider({
    //   clientId: process.env.GITHUB_CLIENT_ID,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET,
    //   authorization: {
    //     params: {
    //       prompt: "consent",
    //       access_type: "offline",
    //       response_type: "code",
    //     },
    //   },
    // }),
    // CredentialsProvider({
    //   name: "Credentials",
    //   credentials: {
    //     username: { label: "Username", type: "text", placeholder: "Username" },
    //     password: { label: "Password", type: "password", placeholder: "********" },
    //   },
    //   async authorize(credentials) {
    //     if (!credentials?.username || !credentials?.password) {
    //       return null;
    //     }

    //     // This is a basic example - you should implement proper authentication
    //     const user:User = {
    //       id: credentials.username as string,
    //       email: credentials.username as string,
    //       name: credentials.username as string,
    //       image: "https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50",
    //     };

    //     return user;
    //   },
    // }),
  ],
  callbacks: {
    jwt: async ({ token, account, user }) => {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          username: account.providerAccountId,
          accessTokenExpires: account.expires_at ? account.expires_at * 1000 : 0,
        };
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },
    session: async ({ session, token }) => {
      session.user = token.user as any;
      session.accessToken = token.accessToken as string;
      session.error = token.error as string;
      return session;
    },
    // authorized({ request, auth }) {
    //   console.log("Authorized", auth);
    //   return !!auth?.user; // Ensure there's a logged in user for every request
    // },
    signIn: async ({ user, account, profile }) => {
      console.log("Sign In", user, account, profile);
      return true;
    }
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  trustHost: true,
};
