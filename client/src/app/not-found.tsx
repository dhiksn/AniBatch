import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <div className="text-8xl font-black text-stone-800">404</div>
      <div>
        <h1 className="text-2xl font-bold text-stone-200 mb-2">Halaman tidak ditemukan</h1>
        <p className="text-stone-500 text-sm">Halaman yang kamu cari tidak ada atau sudah dipindahkan.</p>
      </div>
      <Link href="/" className="px-6 py-2.5 bg-brand-500 hover:bg-brand-400 text-white text-sm font-bold rounded-full transition-colors">
        Kembali ke Home
      </Link>
    </div>
  );
}
