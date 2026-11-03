import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <div
        className="font-display text-[8rem] leading-none"
        style={{color: 'var(--color-paper-3)', fontFamily: '"Momo Trust Display", "Geologica", sans-serif'}}
      >
        404
      </div>
      <div>
        <h1 className="font-serif text-2xl text-ink mb-2">Halaman tidak ditemukan</h1>
        <p className="text-muted text-sm">Halaman yang kamu cari tidak ada atau sudah dipindahkan.</p>
      </div>
      <Link
        href="/"
        className="px-6 py-2.5 bg-accent text-accent-ink text-sm font-medium rounded-none transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        Kembali ke Home
      </Link>
    </div>
  );
}
