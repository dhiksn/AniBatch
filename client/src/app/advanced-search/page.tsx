"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { AnimeCard } from "@/components/ui/AnimeCard";
import { CardGridSkeleton } from "@/components/ui/Skeletons";
import { MagnifyingGlass, CaretLeft, CaretRight, CaretDown, X, Check } from "@phosphor-icons/react";

/* ── option sets ── */
const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
  { value: "upcoming", label: "Upcoming" },
];
const TYPE_OPTIONS = [
  { value: "", label: "Semua Tipe" },
  { value: "tv", label: "TV" },
  { value: "movie", label: "Movie" },
  { value: "bd", label: "BD" },
  { value: "ova", label: "OVA" },
  { value: "ona", label: "ONA" },
  { value: "special", label: "Special" },
  { value: "series", label: "Series" },
];
const ORDER_OPTIONS = [
  { value: "", label: "Default" },
  { value: "title", label: "Judul A-Z" },
  { value: "titlereverse", label: "Judul Z-A" },
  { value: "update", label: "Terbaru Update" },
  { value: "added", label: "Terbaru Ditambah" },
  { value: "popular", label: "Terpopuler" },
  { value: "rating", label: "Rating Tertinggi" },
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
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
          value
            ? "bg-brand-500/10 border-brand-500/40 text-brand-400"
            : "bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700"
        }`}
      >
        {current.label}
        <CaretDown size={11} weight="bold" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-20 bg-stone-900 border border-stone-800 rounded-xl shadow-xl overflow-hidden min-w-[150px]">
            {options.map((o) => (
              <button
                key={o.value}
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={`w-full text-left px-4 py-2 text-xs transition-colors ${
                  o.value === value
                    ? "text-brand-500 bg-brand-500/10 font-semibold"
                    : "text-stone-300 hover:bg-stone-800"
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
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
          count > 0
            ? "bg-brand-500/10 border-brand-500/40 text-brand-400"
            : "bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700"
        }`}
      >
        {label}{count > 0 ? ` (${count})` : ""}
        <CaretDown size={11} weight="bold" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-20 bg-stone-900 border border-stone-800 rounded-xl shadow-xl overflow-hidden min-w-[180px] max-h-64 overflow-y-auto">
            {options.map((o) => {
              const active = selected.has(o.value);
              return (
                <button
                  key={o.value}
                  onClick={() => onToggle(o.value)}
                  className={`w-full text-left px-4 py-2 text-xs transition-colors flex items-center justify-between gap-2 ${
                    active ? "text-brand-500 bg-brand-500/10" : "text-stone-300 hover:bg-stone-800"
                  }`}
                >
                  {o.label}
                  {active && <Check size={11} weight="bold" />}
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
function AdvancedSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState(searchParams.get("status") ?? "");
  const [type, setType] = useState(searchParams.get("type[]") ?? searchParams.get("type") ?? "");
  const [order, setOrder] = useState(searchParams.get("order") ?? "");
  const [title, setTitle] = useState(searchParams.get("title") ?? "");
  const [genres, setGenres] = useState<Set<string>>(
    new Set(searchParams.getAll("genre[]"))
  );
  const [seasons, setSeasons] = useState<Set<string>>(
    new Set(searchParams.getAll("season[]"))
  );
  const [page, setPage] = useState(parseInt(searchParams.get("page") ?? "1") || 1);

  const [genreOptions, setGenreOptions] = useState<{ value: string; label: string }[]>([]);
  const [seasonOptions, setSeasonOptions] = useState<{ value: string; label: string }[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Load genre & season options once
  useEffect(() => {
    fetchApi<any>("/genre").then((res) =>
      setGenreOptions(res.data.map((g: any) => ({ value: g.slug, label: g.name })))
    ).catch(console.error);

    fetchApi<any>("/seasons").then((res) =>
      setSeasonOptions(res.data.map((s: any) => ({ value: s.slug, label: s.label })))
    ).catch(console.error);
  }, []);

  function buildQs(overridePage?: number, overrides?: { status?: string; type?: string; order?: string; title?: string; genres?: Set<string>; seasons?: Set<string> }) {
    const p = new URLSearchParams();
    const t  = overrides?.title   !== undefined ? overrides.title   : title;
    const s  = overrides?.status  !== undefined ? overrides.status  : status;
    const ty = overrides?.type    !== undefined ? overrides.type    : type;
    const o  = overrides?.order   !== undefined ? overrides.order   : order;
    const g  = overrides?.genres  !== undefined ? overrides.genres  : genres;
    const se = overrides?.seasons !== undefined ? overrides.seasons : seasons;
    if (t)  p.set("title", t);
    if (s)  p.set("status", s);
    if (ty) p.append("type[]", ty);
    if (o)  p.set("order", o);
    g.forEach((v) => p.append("genre[]", v));
    se.forEach((v) => p.append("season[]", v));
    const pg = overridePage ?? page;
    if (pg > 1) p.set("page", String(pg));
    return p.toString();
  }

  function doSearch(pg = 1, overrides?: { status?: string; type?: string; order?: string; title?: string; genres?: Set<string>; seasons?: Set<string> }) {
    setPage(pg);
    const qs = buildQs(pg, overrides);
    router.replace(`/advanced-search${qs ? "?" + qs : ""}`, { scroll: false });
    setLoading(true);
    fetchApi<any>(`/advanced-search?${qs}`)
      .then((res) => {
        setData(res.data ?? []);
        setPagination(res.pagination ?? null);
        setLoading(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      })
      .catch((err) => {
        console.error(err);
        setData([]);
        setLoading(false);
      });
  }

  const initialized = useRef(false);

  useEffect(() => {
    // Initial load only
    doSearch(page);
    initialized.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-search whenever any filter changes (after initial load)
  useEffect(() => {
    if (!initialized.current) return;
    doSearch(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, type, order, genres, seasons]);

  function toggleGenre(slug: string) {
    setGenres((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
  }

  function toggleSeason(slug: string) {
    setSeasons((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
  }

  const hasFilters = status || type || order || genres.size > 0 || seasons.size > 0;

  function clearFilters() {
    const empty = { status: "", type: "", order: "", title: "", genres: new Set<string>(), seasons: new Set<string>() };
    setStatus(""); setType(""); setOrder(""); setTitle("");
    setGenres(new Set()); setSeasons(new Set()); setPage(1);
    doSearch(1, empty);
  }

  return (
    <div className="flex gap-8 items-start">
      <main className="flex-1 min-w-0">

        {/* Filter bar */}
        <div className="bg-stone-900/40 border border-stone-800/50 rounded-2xl p-5 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <MagnifyingGlass weight="bold" className="text-brand-500 text-3xl" />
            <div>
              <h1 className="text-2xl font-black text-stone-100 tracking-tight">Advanced Search</h1>
              <p className="text-sm text-stone-400 mt-1">Cari anime dengan filter status, tipe, genre, dan musim</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Select value={status} options={STATUS_OPTIONS} onChange={setStatus} />
            <Select value={type} options={TYPE_OPTIONS} onChange={setType} />
            <Select value={order} options={ORDER_OPTIONS} onChange={setOrder} />
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
                label="Season"
                selected={seasons}
                options={seasonOptions}
                onToggle={toggleSeason}
              />
            )}

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-stone-500 hover:text-stone-300 border border-stone-800 hover:border-stone-700 transition-colors"
              >
                <X size={11} weight="bold" /> Reset
              </button>
            )}

            <button
              onClick={() => doSearch(1)}
              className="ml-auto flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold bg-brand-500 hover:bg-brand-400 text-stone-50 transition-colors"
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {data.map((anime: any) => (
                <AnimeCard key={anime.slug} anime={anime} />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12 mb-8">
                <button
                  onClick={() => doSearch(page - 1)}
                  disabled={!pagination.hasPrev}
                  className="p-2 rounded-full bg-stone-900 border border-stone-800 text-stone-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-800 hover:text-brand-500 transition-colors"
                >
                  <CaretLeft weight="bold" size={16} />
                </button>
                <div className="text-sm font-medium text-stone-400">
                  Halaman <span className="text-stone-100">{pagination.page}</span> dari{" "}
                  <span className="text-stone-100">{pagination.totalPages}</span>
                </div>
                <button
                  onClick={() => doSearch(page + 1)}
                  disabled={!pagination.hasNext}
                  className="p-2 rounded-full bg-stone-900 border border-stone-800 text-stone-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-800 hover:text-brand-500 transition-colors"
                >
                  <CaretRight weight="bold" size={16} />
                </button>
              </div>
            )}
          </>
        ) : !loading ? (
          <div className="text-center py-20 text-stone-500 border border-dashed border-stone-800 rounded-2xl">
            Tidak ada hasil ditemukan. Coba ubah filter atau kata kunci.
          </div>
        ) : null}
      </main>

      <Sidebar />
    </div>
  );
}

export default function AdvancedSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex gap-8 items-start">
          <main className="flex-1 min-w-0">
            <div className="h-40 bg-stone-900/40 rounded-2xl animate-pulse border border-stone-800/50 mb-8" />
            <CardGridSkeleton count={20} />
          </main>
          <Sidebar />
        </div>
      }
    >
      <AdvancedSearchContent />
    </Suspense>
  );
}
