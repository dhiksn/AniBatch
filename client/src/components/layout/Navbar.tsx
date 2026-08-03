"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function Navbar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-stone-950/80 backdrop-blur-xl border-b border-stone-800/50">
      <div className="relative max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-6">

        {/* Logo — kiri */}
        <Link href="/" className="text-xl font-bold tracking-tight flex items-center shrink-0">
          <span className="text-brand-500">Ani</span>
          <span className="text-stone-100">Batch</span>
        </Link>

        {/* Nav links — tengah (absolute center) */}
        <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/anime-list">Daftar Anime</NavLink>
          <NavLink href="/genre-list">Genre</NavLink>
          <NavLink href="/popular">Popular</NavLink>
          <NavLink href="/advanced-search">Advanced Search</NavLink>
          <NavLink href="/schedule">Jadwal Rilis</NavLink>
        </div>

        {/* Search — kanan */}
        <form onSubmit={handleSearch} className="relative w-48 sm:w-64 hidden sm:block shrink-0">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anime..."
            className="w-full bg-stone-900/50 border border-stone-800 rounded-full py-2 pl-4 pr-10 text-sm text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-brand-500/50 transition-colors"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-brand-500 transition-colors">
            <MagnifyingGlass weight="bold" size={16} />
          </button>
        </form>

      </div>
    </nav>
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
