"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { AnimeCard } from "@/components/ui/AnimeCard";
import { CardGridSkeleton } from "@/components/ui/Skeletons";
import { MagnifyingGlass, CaretLeft, CaretRight, CaretDown, X, Check } from "@phosphor-icons/react";

/* ── option sets ── */
const STATUS_OPTIONS = [
  { value: "", label: "Semua status" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
  { value: "upcoming", label: "Upcoming" },
];
const TYPE_OPTIONS = [
  { value: "", label: "Semua tipe" },
  { value: "tv", label: "TV" },
  { value: "movie", label: "Movie" },
  { value: "bd", label: "BD" },
  { value: "ova", label: "OVA" },
  { value: "ona", label: "ONA" },
  { value: "special", label: "Special" },
  { value: "series", label: "Series" },
];
const ORDER_OPTIONS = [
  { value: "", label: "Urutan bawaan" },
  { value: "title", label: "Judul A-Z" },
  { value: "titlereverse", label: "Judul Z-A" },
  { value: "update", label: "Pembaruan terbaru" },
  { value: "added", label: "Terbaru ditambah" },
  { value: "popular", label: "Paling populer" },
  { value: "rating", label: "Rating tertinggi" },
];

/* ── single-select dropdown ── */
function Select({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const current = options.find((o) => o.value === value) ?? options[0];
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus ${
          value
            ? "bg-accent/15 border-accent/40 text-accent"
            : "bg-paper-3 border-rule text-ink-2 hover:border-muted"
        }`}
      >
        {current.label}
        <CaretDown size={11} weight="bold" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[70] bg-black/60 sm:z-10 sm:bg-transparent" onClick={() => setOpen(false)} />
          <div className="fixed inset-x-0 bottom-0 z-[80] max-h-[70dvh] overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)] bg-paper-2 border-t border-rule rounded-t-2xl shadow-2xl sm:absolute sm:inset-x-auto sm:bottom-auto sm:top-full sm:left-0 sm:mt-1 sm:z-20 sm:pb-0 sm:border sm:rounded-xl sm:shadow-xl sm:overflow-hidden sm:max-h-none sm:min-w-[160px]">
            {options.map((o) => (
              <button
                key={o.value}
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={`w-full text-left px-5 sm:px-4 py-3 sm:py-2 text-sm sm:text-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus ${
                  o.value === value
                    ? "text-accent bg-paper-3 font-semibold"
                    : "text-ink-2 hover:bg-paper"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── multi-select pill dropdown ── */
function MultiSelect({
  label,
  selected,
  options,
  onToggle,
}: {
  label: string;
  selected: Set<string>;
  options: { value: string; label: string }[];
  onToggle: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const count = selected.size;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus ${
          count > 0
            ? "bg-accent/15 border-accent/40 text-accent"
            : "bg-paper-3 border-rule text-ink-2 hover:border-muted"
        }`}
      >
        {label}{count > 0 ? ` (${count})` : ""}
        <CaretDown size={11} weight="bold" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[70] bg-black/60 sm:z-10 sm:bg-transparent" onClick={() => setOpen(false)} />
          <div className="fixed inset-x-0 bottom-0 z-[80] max-h-[70dvh] overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)] bg-paper-2 border-t border-rule rounded-t-2xl shadow-2xl sm:absolute sm:inset-x-auto sm:bottom-auto sm:top-full sm:left-0 sm:mt-1 sm:z-20 sm:pb-0 sm:border sm:rounded-xl sm:shadow-xl sm:min-w-[190px] sm:max-h-64">
            {options.map((o) => {
              const active = selected.has(o.value);
              return (
                <button
                  key={o.value}
                  onClick={() => onToggle(o.value)}
                  className={`w-full text-left px-5 sm:px-4 py-3 sm:py-2 text-sm sm:text-xs transition-colors flex items-center justify-between gap-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus ${
                    active ? "text-accent bg-paper-3 font-semibold" : "text-ink-2 hover:bg-paper"
                  }`}
                >
                  {o.label}
                  {active && <Check size={14} weight="bold" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ── main content ── */
export function AdvancedSearchContent() {
  const pathname = usePathname();
  const [status, setStatus]   = useState("");
  const [type, setType]       = useState("");
  const [order, setOrder]     = useState("");
  const [title, setTitle]     = useState("");
  const [genres, setGenres]   = useState<Set<string>>(new Set());
  const [seasons, setSeasons] = useState<Set<string>>(new Set());
  const [page, setPage]       = useState(1);

  const [genreOptions, setGenreOptions] = useState<{ value: string; label: string }[]>([]);
  const [seasonOptions, setSeasonOptions] = useState<{ value: string; label: string }[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const reqId = useRef(0);

  useEffect(() => {
    fetchApi<any>("/genre").then((res) =>
      setGenreOptions(res.data.map((g: any) => ({ value: g.slug, label: g.name })))
    ).catch(console.error);

    fetchApi<any>("/seasons").then((res) =>
      setSeasonOptions(res.data.map((s: any) => ({ value: s.slug, label: s.label })))
    ).catch(console.error);
  }, []);

  function buildQs(pg: number, s: string, ty: string, o: string, t: string, g: Set<string>, se: Set<string>) {
    const p = new URLSearchParams();
    if (t)  p.set("title", t);
    if (s)  p.set("status", s);
    if (ty) p.append("type[]", ty);
    if (o)  p.set("order", o);
    g.forEach((v) => p.append("genre[]", v));
    se.forEach((v) => p.append("season[]", v));
    if (pg > 1) p.set("page", String(pg));
    return p.toString();
  }

  function fetchSearch(pg: number, s: string, ty: string, o: string, t: string, g: Set<string>, se: Set<string>, updateUrl = true) {
    setPage(pg);
    const qs = buildQs(pg, s, ty, o, t, g, se);
    if (updateUrl) {
      window.history.replaceState(null, "", `/advanced-search${qs ? "?" + qs : ""}`);
    }
    const id = ++reqId.current;
    setLoading(true);
    fetchApi<any>(`/advanced-search?${qs}`)
      .then((res) => {
        if (id !== reqId.current) return;
        setData(res.data ?? []);
        setPagination(res.pagination ?? null);
        setLoading(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      })
      .catch((err) => {
        if (id !== reqId.current) return;
        console.error(err);
        setData([]);
        setLoading(false);
      });
  }

  function doSearch(pg = 1) {
    fetchSearch(pg, status, type, order, title, genres, seasons, true);
  }

  useEffect(() => {
    if (!pathname.startsWith("/advanced-search")) return;
    const sp = new URLSearchParams(window.location.search);
    const initStatus  = sp.get("status") ?? "";
    const initType    = sp.get("type[]") ?? sp.get("type") ?? "";
    const initOrder   = sp.get("order") ?? "";
    const initTitle   = sp.get("title") ?? "";
    const initGenres  = new Set(sp.getAll("genre[]"));
    const initSeasons = new Set(sp.getAll("season[]"));
    const initPage    = parseInt(sp.get("page") ?? "1") || 1;

    setStatus(initStatus);
    setType(initType);
    setOrder(initOrder);
    setTitle(initTitle);
    setGenres(initGenres);
    setSeasons(initSeasons);
    setPage(initPage);

    fetchSearch(initPage, initStatus, initType, initOrder, initTitle, initGenres, initSeasons, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function changeStatus(v: string) {
    setStatus(v);
    fetchSearch(1, v, type, order, title, genres, seasons);
  }

  function changeType(v: string) {
    setType(v);
    fetchSearch(1, status, v, order, title, genres, seasons);
  }

  function changeOrder(v: string) {
    setOrder(v);
    fetchSearch(1, status, type, v, title, genres, seasons);
  }

  function toggleGenre(slug: string) {
    const next = new Set(genres);
    next.has(slug) ? next.delete(slug) : next.add(slug);
    setGenres(next);
    fetchSearch(1, status, type, order, title, next, seasons);
  }

  function toggleSeason(slug: string) {
    const next = new Set(seasons);
    next.has(slug) ? next.delete(slug) : next.add(slug);
    setSeasons(next);
    fetchSearch(1, status, type, order, title, genres, next);
  }

  const hasFilters = status || type || order || genres.size > 0 || seasons.size > 0;

  function clearFilters() {
    const empty = new Set<string>();
    setStatus(""); setType(""); setOrder(""); setTitle("");
    setGenres(empty); setSeasons(empty); setPage(1);
    fetchSearch(1, "", "", "", "", empty, empty, true);
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 lg:items-start">
      <main className="w-full lg:flex-1 min-w-0">

        {/* Filter bar */}
        <div className="bg-paper-2 border border-rule rounded-xl p-4 sm:p-5 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <MagnifyingGlass weight="bold" className="text-accent text-2xl shrink-0" />
            <div className="min-w-0">
              <h1 className="font-serif text-2xl font-medium text-ink tracking-tight break-words">Pencarian lanjutan</h1>
              <p className="text-sm text-muted mt-1">Cari anime dengan filter status, tipe, genre, dan musim</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Select value={status} options={STATUS_OPTIONS} onChange={changeStatus} />
            <Select value={type} options={TYPE_OPTIONS} onChange={changeType} />
            <Select value={order} options={ORDER_OPTIONS} onChange={changeOrder} />
            {genreOptions.length > 0 && (
              <MultiSelect
                label="Genre"
                selected={genres}
                options={genreOptions}
                onToggle={toggleGenre}
              />
            )}
            {seasonOptions.length > 0 && (
              <MultiSelect
                label="Musim"
                selected={seasons}
                options={seasonOptions}
                onToggle={toggleSeason}
              />
            )}

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-muted hover:text-ink border border-rule hover:border-muted transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus"
              >
                <X size={11} weight="bold" /> Reset
              </button>
            )}

            <button
              onClick={() => doSearch(1)}
              className="ml-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-accent text-accent-ink hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <MagnifyingGlass weight="bold" size={13} /> Cari
            </button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <CardGridSkeleton count={20} />
        ) : data.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {data.map((anime: any) => (
                <AnimeCard key={anime.slug} anime={anime} />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12 mb-8">
                <button
                  onClick={() => doSearch(page - 1)}
                  disabled={!pagination.hasPrev}
                  aria-label="Halaman sebelumnya"
                  className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-paper-2 border border-rule text-ink disabled:opacity-30 disabled:cursor-not-allowed hover:bg-paper-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  <CaretLeft weight="bold" size={16} />
                </button>
                <div className="text-sm font-medium text-muted num">
                  Halaman <span className="text-ink font-semibold">{pagination.page}</span> dari{" "}
                  <span className="text-ink font-semibold">{pagination.totalPages}</span>
                </div>
                <button
                  onClick={() => doSearch(page + 1)}
                  disabled={!pagination.hasNext}
                  aria-label="Halaman berikutnya"
                  className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-paper-2 border border-rule text-ink disabled:opacity-30 disabled:cursor-not-allowed hover:bg-paper-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  <CaretRight weight="bold" size={16} />
                </button>
              </div>
            )}
          </>
        ) : !loading ? (
          <div className="text-center py-20 text-muted border border-dashed border-rule rounded-xl">
            Tidak ada hasil ditemukan. Coba ubah filter atau kata kunci.
          </div>
        ) : null}
      </main>

      <Sidebar />
    </div>
  );
}
