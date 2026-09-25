"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MagnifyingGlass, X, ArrowRight } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { fetchApi } from "@/lib/api";
import { proxyImg } from "@/lib/image";

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

const AUTOCOMPLETE_LIMIT = 5;

function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // hasil yang ditampilkan di dropdown dibatasi, tapi "See all" tetap muncul kalau ada hasil
  const visibleResults = results.slice(0, AUTOCOMPLETE_LIMIT);
  const itemCount = visibleResults.length + (results.length > 0 ? 1 : 0); // +1 buat "lihat semua"

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setSelectedIndex(-1);
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [open]);

  const goToFullSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, itemCount - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
      }
      if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault();
        if (selectedIndex === visibleResults.length) {
          // item terakhir = "lihat semua hasil"
          goToFullSearch();
        } else {
          router.push(`/anime/${visibleResults[selectedIndex].slug}`);
          onClose();
        }
      }
    };
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose, visibleResults, itemCount, selectedIndex, router, query]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setLoading(true);
        try {
          const encodedQuery = query.trim().replace(/\s+/g, '-');
          const res = await fetchApi<any>(`/search?q=${encodedQuery}`);
          setResults(res.data || []);
        } catch (err) {
          console.error(err);
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const encodedQuery = query.trim().replace(/\s+/g, '-');
      router.push(`/search?q=${encodedQuery}`);
      onClose();
    }
  };

  const handleResultClick = (slug: string) => {
    router.push(`/anime/${slug}`);
    onClose();
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
            layout
          >
            <form onSubmit={handleSearch} className="flex items-center gap-3 px-5 py-4 border-b border-stone-800/50">
              <MagnifyingGlass weight="bold" size={20} className="text-stone-500 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(-1);
                }}
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

            {/* Autocomplete results */}
            {query.trim().length >= 2 && (
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="px-5 py-8 text-center text-stone-500 text-sm">
                    Mencari...
                  </div>
                ) : results.length > 0 ? (
                  <div className="py-2">
                    {visibleResults.map((anime, index) => (
                      <button
                        key={anime.slug}
                        type="button"
                        onClick={() => handleResultClick(anime.slug)}
                        className={`w-full flex items-center gap-3 px-5 py-3 transition-colors ${
                          index === selectedIndex
                            ? "bg-brand-500/10 text-brand-500"
                            : "hover:bg-stone-800/50 text-stone-200"
                        }`}
                      >
                        <div className="w-12 h-16 shrink-0 rounded overflow-hidden bg-stone-900">
                          <img
                            src={proxyImg(anime.thumbnail)}
                            alt={anime.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium line-clamp-1">{anime.title}</div>
                          {anime.type && (
                            <div className="text-xs text-stone-500 mt-0.5">{anime.type}</div>
                          )}
                        </div>
                      </button>
                    ))}

                    {/* Link ke halaman search penuh */}
                    <button
                      type="button"
                      onClick={goToFullSearch}
                      className={`w-full flex items-center justify-between gap-3 px-5 py-3 border-t border-stone-800/50 transition-colors ${
                        selectedIndex === visibleResults.length
                          ? "bg-brand-500/10 text-brand-500"
                          : "text-brand-500 hover:bg-stone-800/50"
                      }`}
                    >
                      <span className="text-sm font-semibold">
                        Lihat semua hasil untuk &quot;{query}&quot;
                      </span>
                      <ArrowRight weight="bold" size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="px-5 py-8 text-center text-stone-500 text-sm">
                    Tidak ditemukan
                  </div>
                )}
              </div>
            )}

            <div className="px-5 py-3 text-xs text-stone-500 border-t border-stone-800/50">
              Tekan <kbd className="px-1.5 py-0.5 bg-stone-800 rounded text-stone-300 font-mono">Enter</kbd> untuk mencari, atau{" "}
              <kbd className="px-1.5 py-0.5 bg-stone-800 rounded text-stone-300 font-mono">Esc</kbd> untuk menutup.
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}