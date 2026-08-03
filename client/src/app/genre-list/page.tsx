"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { ErrorState } from "@/components/ui/ErrorState";
import { Tag } from "@phosphor-icons/react";
import Link from "next/link";
import { motion } from "motion/react";

export default function GenreListPage() {
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
    <div className="flex gap-8 items-start">
      <main className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-8 bg-stone-900/40 p-6 rounded-2xl border border-stone-800/50">
          <Tag weight="fill" className="text-brand-500 text-3xl" />
          <div>
            <h1 className="text-2xl font-black text-stone-100 tracking-tight">Daftar Genre</h1>
            <p className="text-sm text-stone-400 mt-1">Jelajahi anime berdasarkan genre</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-wrap gap-3">
            {[...Array(30)].map((_, i) => (
              <div key={i} className="h-10 w-24 bg-stone-900 rounded-full animate-pulse border border-stone-800/50" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : (
          <div className="flex flex-wrap gap-3">
            {data.map((genre: any, i: number) => (
              <motion.div key={genre.slug} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.01 }}>
                <Link href={`/genre/${genre.slug}`} className="block bg-stone-900/50 border border-stone-800/80 hover:bg-brand-500 hover:border-brand-500 hover:text-stone-50 px-5 py-2 rounded-full text-sm font-medium text-stone-300 transition-colors">
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
