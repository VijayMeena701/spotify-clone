import NextAuth from "next-auth";
import { authOptions } from "./lib/authOptions";

const nextAuth = NextAuth(authOptions);

export const { auth, handlers, signIn, signOut } = nextAuth;

export default nextAuth;