"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MagnifyingGlass, X, ArrowRight, List, SpinnerGap } from "@phosphor-icons/react";
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

const AUTOCOMPLETE_LIMIT = 6;
const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery]               = useState("");
  const [results, setResults]           = useState<any[]>([]);
  const [loading, setLoading]           = useState(false);
  const [activeIdx, setActiveIdx]       = useState(-1);
  const inputRef  = useRef<HTMLInputElement>(null);
  const abortRef  = useRef<AbortController | null>(null);
  const itemRefs  = useRef<(HTMLLIElement | null)[]>([]);
  const router    = useRouter();

  const visible = results.slice(0, AUTOCOMPLETE_LIMIT);

  // Auto-scroll active item
  useEffect(() => {
    if (activeIdx >= 0) itemRefs.current[activeIdx]?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  // Focus & reset on open
  useEffect(() => {
    if (!open) return;
    setQuery(""); setResults([]); setActiveIdx(-1); itemRefs.current = [];
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Lock scroll
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Keyboard
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx(i => Math.min(i + 1, visible.length)); // +1 for "lihat semua"
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx(i => Math.max(i - 1, -1));
      }
      if (e.key === "Enter" && activeIdx >= 0) {
        e.preventDefault();
        if (activeIdx === visible.length) {
          goSearch();
        } else {
          router.push(`/anime/${visible[activeIdx].slug}`);
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeIdx, visible]);

  // Debounced fetch
  useEffect(() => {
    const q = query.trim();
    if (q.length < MIN_QUERY_LENGTH) {
      setResults([]); setLoading(false); abortRef.current?.abort(); return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const res = await fetchApi<any>(`/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        if (!ctrl.signal.aborted) { setResults(res.data || []); setActiveIdx(-1); }
      } catch (err: any) {
        if (err?.name !== "AbortError") setResults([]);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  function goSearch() {
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    onClose();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden">

        {/* Input row */}
        <form onSubmit={e => { e.preventDefault(); goSearch(); }} className="flex items-center gap-3 px-4 h-14 border-b border-stone-800/50">
          {loading
            ? <SpinnerGap size={18} className="text-stone-500 shrink-0 animate-spin" />
            : <MagnifyingGlass size={18} className="text-stone-500 shrink-0" />
          }
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setActiveIdx(-1); }}
            placeholder="Cari anime..."
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="flex-1 bg-transparent text-sm text-stone-100 placeholder:text-stone-500 outline-none"
          />
          <div className="flex items-center gap-1.5">
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}
                className="p-1 rounded-md hover:bg-stone-800 transition-colors text-stone-500"
              >
                <X size={14} weight="bold" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="hidden sm:flex items-center justify-center h-5 px-1.5 rounded border border-stone-700 bg-stone-800 text-[10px] font-mono text-stone-400 hover:bg-stone-700 transition-colors"
            >
              Esc
            </button>
          </div>
        </form>

        {/* Results */}
        {results.length > 0 && (
          <>
            <ul className="max-h-80 overflow-y-auto divide-y divide-stone-800/40 py-1">
              {visible.map((anime, i) => (
                <li key={anime.slug} ref={el => { itemRefs.current[i] = el; }}>
                  <button
                    type="button"
                    onClick={() => { router.push(`/anime/${anime.slug}`); onClose(); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      i === activeIdx
                        ? "bg-brand-500/10 text-brand-500"
                        : "hover:bg-stone-800/60 text-stone-200"
                    }`}
                  >
                    <div className="shrink-0 w-10 h-14 rounded overflow-hidden bg-stone-800">
                      <img
                        src={proxyImg(anime.thumbnail)}
                        alt={anime.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-medium truncate">{anime.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {anime.type  && <span className="text-[11px] text-stone-500">{anime.type}</span>}
                        {anime.score && <span className="text-[11px] text-yellow-500">★ {anime.score}</span>}
                      </div>
                    </div>
                    <span className="text-stone-600 text-xs shrink-0">↵</span>
                  </button>
                </li>
              ))}
            </ul>

            {/* Lihat semua */}
            <button
              type="button"
              onClick={goSearch}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-xs border-t border-stone-800/40 transition-colors group ${
                activeIdx === visible.length
                  ? "bg-brand-500/10 text-brand-500"
                  : "text-stone-400 hover:text-brand-500 hover:bg-stone-800/40"
              }`}
            >
              <span>Lihat semua hasil untuk <span className="font-medium text-stone-200">&quot;{query}&quot;</span></span>
              <ArrowRight size={13} weight="bold" />
            </button>
          </>
        )}

        {/* Empty state */}
        {!loading && query.trim().length >= MIN_QUERY_LENGTH && results.length === 0 && (
          <div className="px-4 py-6 text-center text-sm text-stone-500">
            Tidak ada hasil untuk <span className="font-medium text-stone-300">&quot;{query}&quot;</span>
          </div>
        )}

        {/* Footer hints */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-stone-800/40 text-[11px] text-stone-600">
          <span className="flex items-center gap-1">
            <kbd className="flex items-center justify-center h-4 px-1 rounded border border-stone-700 bg-stone-800 font-mono text-stone-400">↑↓</kbd>
            navigasi
          </span>
          <span className="flex items-center gap-1">
            <kbd className="flex items-center justify-center h-4 px-1 rounded border border-stone-700 bg-stone-800 font-mono text-stone-400">↵</kbd>
            buka
          </span>
          <span className="flex items-center gap-1">
            <kbd className="flex items-center justify-center h-4 px-1 rounded border border-stone-700 bg-stone-800 font-mono text-stone-400">Esc</kbd>
            tutup
          </span>
        </div>
      </div>
    </div>
  );
}