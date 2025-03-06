"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { MenuProvider } from "./MenuContext";
import { SessionProvider } from "./SessionProvider";

interface Props {
  children: React.ReactNode;
}

export default function ContextProvider({ children }: Props) {
  return (
    <NextAuthSessionProvider>
      <MenuProvider>
        {" "}
        {/* ✅ MenuProvider must be first */}
        <SessionProvider>{children}</SessionProvider>
      </MenuProvider>
    </NextAuthSessionProvider>
  );
}
