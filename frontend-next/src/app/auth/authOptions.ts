import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "repo", // ✅ Request repo access
        },
      },
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          username: profile.login,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token; // ✅ Ensure token is stored
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken || null;
      if (session.user) {
        session.user.id = token.sub || token.id;
        session.user.username = token.username || "Unknown";
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
