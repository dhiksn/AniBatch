"use client";

import { useScroll } from "./ScrollProvider";

export function ContentWrapper({ children }: { children: React.ReactNode }) {
  const { scrolled } = useScroll();

  return (
    <div className={`flex-1 max-w-7xl w-full mx-auto px-4 transition-all duration-300 ${
      scrolled ? "pt-24" : "pt-8"
    }`}>
      {children}
    </div>
  );
}
