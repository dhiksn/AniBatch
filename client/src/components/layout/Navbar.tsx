"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-stone-950/80 backdrop-blur-xl border-b border-stone-800/50">
        <div className="relative max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-6">

          <Link href="/" className="text-xl font-bold tracking-tight flex items-center shrink-0">
            <span className="text-brand-500">Ani</span>
            <span className="text-stone-100">Batch</span>
          </Link>

          <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/anime-list">Daftar Anime</NavLink>
            <NavLink href="/genre-list">Genre</NavLink>
            <NavLink href="/popular">Popular</NavLink>
            <NavLink href="/advanced-search">Advanced Search</NavLink>
            <NavLink href="/schedule">Jadwal Rilis</NavLink>
          </div>

          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Cari anime"
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-stone-400 hover:text-brand-500 hover:bg-stone-800/50 transition-colors"
          >
            <MagnifyingGlass weight="bold" size={18} />
          </button>

        </div>
      </nav>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
        isActive
          ? "text-brand-500 bg-brand-500/10"
          : "text-stone-400 hover:text-stone-100 hover:bg-stone-800/50"
      }`}
    >
      {children}
    </Link>
  );
}

function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setQuery("");
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4">
          <motion.div
            className="absolute inset-0 bg-stone-950/70 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />

          <motion.div
            className="relative w-full max-w-xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <form onSubmit={handleSearch} className="flex items-center gap-3 px-5 py-4 border-b border-stone-800/50">
              <MagnifyingGlass weight="bold" size={20} className="text-stone-500 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari anime..."
                className="flex-1 bg-transparent text-base text-stone-100 placeholder:text-stone-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup"
                className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-stone-500 hover:text-stone-200 hover:bg-stone-800 transition-colors"
              >
                <X weight="bold" size={14} />
              </button>
            </form>

            <div className="px-5 py-3 text-xs text-stone-500">
              Tekan <kbd className="px-1.5 py-0.5 bg-stone-800 rounded text-stone-300 font-mono">Enter</kbd> untuk mencari, atau{" "}
              <kbd className="px-1.5 py-0.5 bg-stone-800 rounded text-stone-300 font-mono">Esc</kbd> untuk menutup.
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}