import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.id.toString(), // ✅ Ensure ID is included
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          username: profile.login,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token || null; // ✅ Store GitHub access token
      }
      if (user) {
        token.id = user.id; // ✅ Store user ID
        token.username = user.username || null;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken || null;
      if (session.user) {
        session.user.id = token.id; // ✅ Ensure ID is included in session
        session.user.username = token.username || "Unknown";
      }

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
