"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface ScrollContextType {
  scrolled: boolean;
}

const ScrollContext = createContext<ScrollContextType>({ scrolled: false });

export function ScrollProvider({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <ScrollContext.Provider value={{ scrolled }}>
      {children}
    </ScrollContext.Provider>
  );
}

export function useScroll() {
  return useContext(ScrollContext);
}
