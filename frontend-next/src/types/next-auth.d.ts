// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string | null;
    user?: {
      username?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    accessToken?: string | null;
    username?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string | null;
    username?: string | null;
  }
}
