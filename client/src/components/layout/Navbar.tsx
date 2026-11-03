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
  { href: "/anime-list", label: "Daftar anime" },
  { href: "/genre-list", label: "Genre" },
  { href: "/popular", label: "Populer" },
  { href: "/advanced-search", label: "Pencarian lanjutan" },
  { href: "/schedule", label: "Jadwal rilis" },
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
        className={`sticky top-0 z-[var(--z-sticky-nav)] w-full pt-[env(safe-area-inset-top)] transition-[background-color,border-color] duration-200 ${
          scrolled
            ? "bg-paper/95 border-b border-rule"
            : "bg-paper border-b border-transparent"
        }`}
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-6">

          <Link href="/" className="flex items-center gap-1.5 shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-none">
            <span className="font-display text-2xl text-ink">
              AniBatch
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.href} href={item.href}>{item.label}</NavLink>
            ))}
          </div>

          <div className="flex items-center gap-1 sm:gap-2 -mr-2 sm:mr-0">
            {/* Desktop / tablet: search trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Cari anime"
              className="hidden sm:flex shrink-0 items-center gap-2 w-52 px-3 py-1.5 rounded-none bg-paper-2 border border-rule text-muted hover:text-ink hover:border-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <MagnifyingGlass weight="bold" size={15} className="shrink-0 text-muted" />
              <span className="text-sm truncate">Cari anime…</span>
              <kbd className="ml-auto shrink-0 px-1.5 py-0.5 text-[11px] rounded-none bg-paper-3 border border-rule text-muted">
                /
              </kbd>
            </button>

            {/* Mobile: search icon button */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Cari anime"
              className="sm:hidden w-11 h-11 flex items-center justify-center rounded-none text-ink-2 hover:text-ink active:bg-paper-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <MagnifyingGlass weight="bold" size={20} />
            </button>

            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Buka menu"
              aria-expanded={menuOpen}
              className="md:hidden w-11 h-11 flex items-center justify-center rounded-none text-ink-2 hover:text-ink active:bg-paper-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <List weight="bold" size={22} />
            </button>
          </div>

        </div>
      </nav>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

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
        <div className="md:hidden fixed inset-0 z-[var(--z-modal)]">
          <motion.div
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigasi"
            className="absolute right-0 top-0 h-full w-[82%] max-w-xs bg-paper-2 border-l border-rule shadow-2xl flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pr-[env(safe-area-inset-right)]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
          >
            <div className="h-16 shrink-0 px-5 flex items-center justify-between border-b border-rule">
              <span className="font-display text-xl text-ink">
                AniBatch
              </span>
              <button
                onClick={onClose}
                aria-label="Tutup menu"
                className="w-10 h-10 -mr-2 flex items-center justify-center rounded-none text-muted hover:text-ink active:bg-paper-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                <X weight="bold" size={18} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto overscroll-contain p-3 flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center min-h-11 px-3.5 rounded-none text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
                      isActive
                        ? "text-accent"
                        : "text-ink-2 hover:text-ink hover:bg-paper"
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
      className={`px-3 py-1.5 text-sm font-medium rounded-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
        isActive
          ? "text-accent border-b border-accent"
          : "text-muted hover:text-ink hover:bg-paper-2"
      }`}
    >
      {children}
    </Link>
  );
}

const AUTOCOMPLETE_LIMIT = 6;
const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 280;

function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const router = useRouter();

  const visible = results.slice(0, AUTOCOMPLETE_LIMIT);

  useEffect(() => {
    if (activeIdx >= 0) itemRefs.current[activeIdx]?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  useEffect(() => {
    if (!open) return;
    setQuery(""); setResults([]); setActiveIdx(-1); itemRefs.current = [];
    const t = setTimeout(() => inputRef.current?.focus(), 40);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prevOverflow; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx(i => Math.min(i + 1, visible.length));
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
  }, [open, activeIdx, visible]);

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
      className="fixed inset-0 z-[var(--z-modal)] flex items-start justify-center pt-4 sm:pt-[10vh] px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-paper-2 border border-rule rounded-none shadow-lg overflow-hidden">
        <form onSubmit={e => { e.preventDefault(); goSearch(); }} className="flex items-center gap-3 px-4 h-14 border-b border-rule">
          {loading
            ? <SpinnerGap size={18} className="text-muted shrink-0 animate-spin" />
            : <MagnifyingGlass size={18} className="text-muted shrink-0" />
          }
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setActiveIdx(-1); }}
            placeholder="Cari anime…"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="flex-1 bg-transparent text-sm text-ink placeholder:text-muted outline-none"
          />
          <div className="flex items-center gap-1.5">
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}
                className="p-1 rounded-none hover:bg-paper-3 transition-colors text-muted hover:text-ink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus"
              >
                <X size={14} weight="bold" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="hidden sm:flex items-center justify-center h-5 px-1.5 rounded-none border border-rule bg-paper-3 text-[11px] text-muted hover:text-ink transition-colors"
            >
              Esc
            </button>
          </div>
        </form>

        {results.length > 0 && (
          <>
            <ul className="max-h-[40dvh] sm:max-h-80 overflow-y-auto divide-y divide-rule py-1">
              {visible.map((anime, i) => (
                <li key={anime.slug} ref={el => { itemRefs.current[i] = el; }}>
                  <button
                    type="button"
                    onClick={() => { router.push(`/anime/${anime.slug}`); onClose(); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus ${
                      i === activeIdx
                        ? "bg-paper-3 text-accent"
                        : "hover:bg-paper text-ink"
                    }`}
                  >
                    <div className="shrink-0 w-10 h-14 rounded-none overflow-hidden bg-paper-3 border border-rule">
                      <img
                        src={proxyImg(anime.thumbnail)}
                        alt={anime.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-ink">{anime.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {anime.type && <span className="text-[11px] text-muted">{anime.type}</span>}
                        {anime.score && <span className="text-[11px] text-accent">★ {anime.score}</span>}
                      </div>
                    </div>
                    <span className="text-muted text-xs shrink-0">↵</span>
                  </button>
                </li>
              ))}
            </ul>

            {results.length > AUTOCOMPLETE_LIMIT && (
              <button
                type="button"
                onClick={goSearch}
                className={`nowrap w-full flex items-center justify-between px-4 py-2.5 text-xs border-t border-rule transition-colors text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus ${
                  activeIdx === visible.length
                    ? "bg-paper-3 text-accent"
                    : "text-muted hover:text-accent hover:bg-paper"
                }`}
              >
                <span className="truncate">Semua hasil pencarian</span>
                <ArrowRight size={13} weight="bold" className="shrink-0 ml-2" />
              </button>
            )}
          </>
        )}

        {!loading && query.trim().length >= MIN_QUERY_LENGTH && results.length === 0 && (
          <div className="px-4 py-6 text-center text-sm text-muted">
            Tidak ada hasil untuk &ldquo;{query}&rdquo;
          </div>
        )}

        <div className="flex items-center gap-4 px-4 py-2 border-t border-rule text-[11px] text-muted">
          <span className="flex items-center gap-1">
            <kbd className="flex items-center justify-center h-4 px-1 rounded-none border border-rule bg-paper-3 text-muted">↑↓</kbd>
            navigasi
          </span>
          <span className="flex items-center gap-1">
            <kbd className="flex items-center justify-center h-4 px-1 rounded-none border border-rule bg-paper-3 text-muted">↵</kbd>
            buka
          </span>
          <span className="flex items-center gap-1">
            <kbd className="flex items-center justify-center h-4 px-1 rounded-none border border-rule bg-paper-3 text-muted">Esc</kbd>
            tutup
          </span>
        </div>
      </div>
    </div>
  );
}
