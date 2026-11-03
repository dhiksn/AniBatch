"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { ErrorState } from "@/components/ui/ErrorState";
import { Tag } from "@phosphor-icons/react";
import Link from "next/link";
import { motion } from "motion/react";

export function GenreListContent() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    fetchApi<any>("/genre")
      .then((res) => { setData(res.data); setLoading(false); })
      .catch((err) => { setError(err.message || "Gagal memuat daftar genre"); setLoading(false); });
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 lg:items-start">
      <main className="w-full lg:flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-6 sm:mb-8 bg-paper-2 p-4 sm:p-6 rounded-xl border border-rule">
          <Tag weight="fill" className="text-accent text-3xl shrink-0" />
          <div className="min-w-0">
            <h1 className="font-serif text-2xl sm:text-3xl font-medium text-ink tracking-tight break-words">Daftar genre</h1>
            <p className="text-sm text-muted mt-1">Jelajahi anime berdasarkan kategori dan genre</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-wrap gap-2.5">
            {[...Array(30)].map((_, i) => (
              <div key={i} className="h-9 w-24 bg-paper-2 rounded-full animate-pulse border border-rule" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {data.map((genre: any, i: number) => (
              <motion.div key={genre.slug} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.01, duration: 0.2 }}>
                <Link
                  href={`/genre/${genre.slug}`}
                  className="block bg-paper-2 border border-rule hover:border-accent hover:text-accent px-4 py-2 rounded-full text-xs font-medium text-ink-2 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus"
                >
                  {genre.name}
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>
      <Sidebar showSchedule={false} />
    </div>
  );
}
