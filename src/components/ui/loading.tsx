"use client";

export function LoadingSpinner({ message = "Memuat data..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4 w-full min-h-[300px]">
      <div className="w-8 h-8 border-2 border-zinc-800 border-t-zinc-200 rounded-full animate-spin" />
      <p className="text-sm font-medium text-zinc-400 tracking-wide">
        {message}
      </p>
    </div>
  );
}

export function PanelLoading() {
  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-8">
      <LoadingSpinner message="Menyiapkan Panel Admin..." />
    </div>
  );
}
