import NextAuth, { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { AdapterUser } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login, // ✅ Ensure name falls back to login
          email: profile.email,
          image: profile.avatar_url,
          username: profile.login, // ✅ Ensure username is extracted
        } as AdapterUser & { username: string };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token || null; // ✅ Store GitHub access token
      }
      if (user) {
        token.username = user.username || null; // ✅ Store GitHub username
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken || null; // ✅ Ensure accessToken is available
      if (session.user) {
        session.user.username = token.username || "Unknown";
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

// ✅ Named exports for Next.js App Router
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
