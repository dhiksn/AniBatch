"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MagnifyingGlass, X, ArrowRight, List } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { fetchApi } from "@/lib/api";
import { proxyImg } from "@/lib/image";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/anime-list", label: "Daftar Anime" },
  { href: "/genre-list", label: "Genre" },
  { href: "/popular", label: "Popular" },
  { href: "/advanced-search", label: "Advanced Search" },
  { href: "/schedule", label: "Jadwal Rilis" },
];

export function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !searchOpen) {
        const activeElement = document.activeElement;
        const isInput = activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement;
        if (!isInput) {
          e.preventDefault();
          setSearchOpen(true);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen]);

  return (
    <>
      <nav
        className={`sticky top-0 z-50 w-full pt-[env(safe-area-inset-top)] transition-all duration-300 ${
          scrolled
            ? "bg-stone-950/80 backdrop-blur-xl border-b border-stone-800/50 shadow-lg shadow-black/20"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-6">

          <Link href="/" className="text-xl font-bold tracking-tight flex items-center shrink-0">
            <span className="text-brand-500">Ani</span>
            <span className="text-stone-100">Batch</span>
          </Link>

          <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.href} href={item.href}>{item.label}</NavLink>
            ))}
          </div>

          <div className="flex items-center gap-1 sm:gap-2 -mr-2 sm:mr-0">
            {/* Desktop / tablet: kolom pencarian */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Cari anime"
              className="hidden sm:flex shrink-0 items-center gap-2 w-52 px-3 py-2 rounded-full bg-stone-900/60 border border-stone-800 text-stone-500 hover:border-stone-700 hover:bg-stone-900 transition-colors"
            >
              <MagnifyingGlass weight="bold" size={16} className="shrink-0" />
              <span className="text-sm truncate">Cari anime...</span>
              <kbd className="ml-auto shrink-0 px-1.5 py-0.5 text-[11px] font-mono rounded bg-stone-800 border border-stone-700 text-stone-400">
                /
              </kbd>
            </button>

            {/* Mobile: tombol ikon (target sentuh 44px) */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Cari anime"
              className="sm:hidden w-11 h-11 flex items-center justify-center rounded-full text-stone-300 active:bg-stone-800/70 transition-colors"
            >
              <MagnifyingGlass weight="bold" size={22} />
            </button>

            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Buka menu"
              aria-expanded={menuOpen}
              className="md:hidden w-11 h-11 flex items-center justify-center rounded-full text-stone-300 active:bg-stone-800/70 transition-colors"
            >
              <List weight="bold" size={24} />
            </button>
          </div>

        </div>
      </nav>

      {/* Di luar <nav>: backdrop-filter pada nav akan membuat elemen fixed di dalamnya ikut terpotong */}
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  // Tutup otomatis saat pindah halaman
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="md:hidden fixed inset-0 z-[90]">
          <motion.div
            className="absolute inset-0 bg-stone-950/70 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigasi"
            className="absolute right-0 top-0 h-full w-[82%] max-w-xs bg-stone-950 border-l border-stone-800 shadow-2xl flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pr-[env(safe-area-inset-right)]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.22, ease: "easeOut" }}
          >
            <div className="h-16 shrink-0 px-5 flex items-center justify-between border-b border-stone-800/60">
              <span className="text-lg font-bold tracking-tight">
                <span className="text-brand-500">Ani</span>
                <span className="text-stone-100">Batch</span>
              </span>
              <button
                onClick={onClose}
                aria-label="Tutup menu"
                className="w-11 h-11 -mr-2 flex items-center justify-center rounded-full text-stone-400 active:bg-stone-800/70 transition-colors"
              >
                <X weight="bold" size={20} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto overscroll-contain p-3 flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center min-h-12 px-4 rounded-xl text-base font-medium transition-colors ${
                      isActive
                        ? "text-brand-500 bg-brand-500/10"
                        : "text-stone-300 active:bg-stone-800/70"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
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
const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 250;

function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const router = useRouter();

  const visibleResults = results.slice(0, AUTOCOMPLETE_LIMIT);
  const itemCount = visibleResults.length + (results.length > 0 ? 1 : 0);

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

  // Debounced search — lebih cepat trigger, cancel request lama biar nggak race condition
  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setLoading(false);
      abortRef.current?.abort();
      return;
    }

    // langsung tampilkan status loading begitu user ngetik, bukan nunggu debounce selesai
    setLoading(true);

    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetchApi<any>(
          `/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        );
        if (!controller.signal.aborted) {
          setResults(res.data || []);
        }
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error(err);
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
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
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[calc(env(safe-area-inset-top)+0.75rem)] sm:pt-24 px-3 sm:px-4">
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
            <form onSubmit={handleSearch} className="flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 border-b border-stone-800/50">
              <MagnifyingGlass weight="bold" size={20} className="text-stone-500 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                inputMode="search"
                enterKeyHint="search"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(-1);
                }}
                placeholder="Cari anime..."
                className="flex-1 min-w-0 bg-transparent text-base text-stone-100 placeholder:text-stone-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup"
                className="shrink-0 w-10 h-10 sm:w-7 sm:h-7 -mr-2 sm:mr-0 flex items-center justify-center rounded-full text-stone-500 hover:text-stone-200 hover:bg-stone-800 transition-colors"
              >
                <X weight="bold" size={14} />
              </button>
            </form>

            {query.trim().length >= MIN_QUERY_LENGTH && (
              <div className="max-h-[50dvh] sm:max-h-96 overflow-y-auto overscroll-contain">
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
                        className={`w-full flex items-center gap-3 px-4 sm:px-5 py-3 transition-colors ${
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
                        <div className="flex-1 min-w-0 text-left">
                          <div className="text-sm font-medium line-clamp-2 sm:line-clamp-1">{anime.title}</div>
                          {anime.type && (
                            <div className="text-xs text-stone-500 mt-0.5">{anime.type}</div>
                          )}
                        </div>
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={goToFullSearch}
                      className={`w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 sm:py-3 border-t border-stone-800/50 transition-colors ${
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

            <div className="hidden sm:block px-5 py-3 text-xs text-stone-500 border-t border-stone-800/50">
              Tekan <kbd className="px-1.5 py-0.5 bg-stone-800 rounded text-stone-300 font-mono">Enter</kbd> untuk mencari dan{" "}
              <kbd className="px-1.5 py-0.5 bg-stone-800 rounded text-stone-300 font-mono">Esc</kbd> untuk menutup.
           </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}