"use client";
import { createContext, useContext, useState } from "react";
import { ModalProvider } from "./ModalContext";

interface MenuContextType {
  isOpen: boolean;
  toggleMenu: () => void;
  closeMenu: () => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  return (
    <MenuContext.Provider value={{ isOpen, toggleMenu, closeMenu }}>
      <ModalProvider>{children}</ModalProvider>
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return context;
};
