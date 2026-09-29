"use client";

import { WarningCircle, ArrowClockwise } from "@phosphor-icons/react";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = "Gagal memuat data", onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <WarningCircle weight="fill" className="text-red-500/60 text-5xl" />
      <div>
        <p className="text-stone-300 font-semibold">Terjadi Kesalahan</p>
        <p className="text-stone-500 text-sm mt-1">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm font-medium transition-colors border border-stone-700"
        >
          <ArrowClockwise weight="bold" size={14} />
          Coba lagi
        </button>
      )}
    </div>
  );
}
