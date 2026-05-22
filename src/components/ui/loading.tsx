"use client";

export function LoadingSpinner({ message = "Memuat data..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4 w-full min-h-[300px]">
      <div className="relative w-12 h-12 flex items-center justify-center">
        {/* Outer Ring */}
        <div className="absolute inset-0 border-2 border-transparent border-t-purple-500 border-l-purple-500 rounded-full animate-spin" style={{ animationDuration: "1s" }} />
        {/* Inner Ring */}
        <div className="absolute w-8 h-8 border-2 border-transparent border-b-blue-400 border-r-blue-400 rounded-full animate-spin" style={{ animationDuration: "0.7s", animationDirection: "reverse" }} />
        {/* Center Dot */}
        <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
      </div>
      <p className="text-sm font-medium text-gray-400 tracking-wide animate-pulse">
        {message}
      </p>
    </div>
  );
}

export function PanelLoading() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-8">
      <LoadingSpinner message="Menyiapkan Panel Admin..." />
    </div>
  );
}
