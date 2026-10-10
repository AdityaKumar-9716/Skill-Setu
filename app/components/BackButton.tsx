"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-cyan-400"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800/50 bg-slate-900/60 transition-colors group-hover:border-cyan-400/40 group-hover:bg-cyan-950/30">
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
      </div>
      <span>Go back</span>
    </button>
  );
}
