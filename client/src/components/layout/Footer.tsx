import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full mt-24 border-t border-rule bg-paper-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-rule">
          
          {/* Brand & Editorial Description */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <Link href="/" className="inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus w-fit">
              <span className="font-serif text-2xl tracking-tight text-ink">
                AniBatch
              </span>
            </Link>
            <p className="text-sm text-muted leading-relaxed max-w-sm">
              Katalog dan arsip sinema anime batch subtitle Indonesia. Menghadirkan kurasi episode, jadwal siaran mingguan, dan tautan unduh berkualitas tinggi.
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted/80 mt-2">
              <span>Bebas iklan jebakan</span>
              <span className="w-px h-3 bg-rule" />
              <span>Format batch dan per episode</span>
              <span className="w-px h-3 bg-rule" />
              <span>Resolusi 1080p, 720p, 480p</span>
            </div>
          </div>

          {/* Directory Links */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <h4 className="font-serif text-sm font-medium text-ink">Navigasi Utama</h4>
            <nav className="flex flex-col gap-2 text-xs">
              <Link href="/" className="text-muted hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus w-fit">
                Beranda
              </Link>
              <Link href="/anime-list" className="text-muted hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus w-fit">
                Indeks Abjad Anime
              </Link>
              <Link href="/popular" className="text-muted hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus w-fit">
                Peringkat Populer
              </Link>
              <Link href="/schedule" className="text-muted hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus w-fit">
                Jadwal Siaran Mingguan
              </Link>
              <Link href="/advanced-search" className="text-muted hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus w-fit">
                Pencarian Terpadu
              </Link>
              <Link href="/genre-list" className="text-muted hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus w-fit">
                Eksplorasi Genre
              </Link>
            </nav>
          </div>

          {/* Formats & Categorization */}
          <div className="md:col-span-4 flex flex-col gap-3">
            <h4 className="font-serif text-sm font-medium text-ink">Kategori Koleksi</h4>
            <nav className="flex flex-col gap-2 text-xs">
              <Link href="/advanced-search?type[]=tv" className="text-muted hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus w-fit">
                Serial Anime Televisi
              </Link>
              <Link href="/advanced-search?type[]=movie" className="text-muted hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus w-fit">
                Sinema Film Layar Lebar
              </Link>
              <Link href="/advanced-search?status=completed" className="text-muted hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus w-fit">
                Arsip Seri Tamat
              </Link>
              <Link href="/advanced-search?status=ongoing" className="text-muted hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus w-fit">
                Rilis Sedang Berjalan
              </Link>
            </nav>
          </div>

        </div>

        {/* Colophon & Legal Disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-muted/70">
          <p>
            © {new Date().getFullYear()} AniBatch. Seluruh hak cipta karya anime dan media visual merupakan milik studio dan kreator aslinya.
          </p>
          <div className="flex items-center gap-3 text-[11px]">
            <span>Editorial sinematik</span>
            <span className="w-px h-3 bg-rule" />
            <span>Pengarsipan independen</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
