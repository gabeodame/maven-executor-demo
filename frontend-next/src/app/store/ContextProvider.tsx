"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { MenuProvider } from "./react-context/MenuContext";
// import { SessionProvider } from "./react-context/SessionProvider";
import { Provider } from "react-redux";
import { store } from "./redux-toolkit/store";

interface Props {
  children: React.ReactNode;
}

export default function ContextProvider({ children }: Props) {
  return (
    <NextAuthSessionProvider>
      <Provider store={store}>
        <MenuProvider>
          {" "}
          {/* ✅ MenuProvider must be first */}
          {children}
        </MenuProvider>
      </Provider>
    </NextAuthSessionProvider>
  );
}
