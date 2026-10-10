"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BackButton } from "../components/BackButton";
import { LogIn, Mail, Lock, ArrowRight, User } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save user data to local storage for the dashboard to read
    if (typeof window !== "undefined") {
      localStorage.setItem("skillSetuUser", JSON.stringify({ name, email }));
    }
    
    // Redirect to dashboard
    router.push("/dashboard");
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-200">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center opacity-30">
        <div className="h-[40rem] w-[40rem] rounded-full bg-cyan-900/20 blur-[120px]" />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16 sm:px-6">
        <BackButton />

        {/* Premium Glassmorphism Container */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-8 backdrop-blur-xl shadow-2xl shadow-cyan-900/20">
          <div className="mb-8 flex flex-col items-center justify-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10 shadow-[0_0_30px_-5px_rgba(34,211,238,0.3)]">
              <LogIn className="h-6 w-6 text-cyan-400" />
            </div>
            <h1 className="text-center text-3xl font-bold tracking-tight text-white">Welcome back</h1>
            <p className="text-center text-sm text-zinc-400">
              Sign in to access your saved roadmaps and progress.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-4 w-4 text-zinc-500" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="block w-full rounded-xl border border-white/5 bg-slate-900/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 backdrop-blur-sm transition-colors focus:border-cyan-400/50 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-zinc-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="block w-full rounded-xl border border-white/5 bg-slate-900/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 backdrop-blur-sm transition-colors focus:border-cyan-400/50 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-zinc-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-white/5 bg-slate-900/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 backdrop-blur-sm transition-colors focus:border-cyan-400/50 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition-all hover:bg-cyan-400 shadow-[0_0_20px_-5px_rgba(34,211,238,0.4)] hover:shadow-[0_0_25px_-5px_rgba(34,211,238,0.6)]"
            >
              <span>Continue</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-zinc-500">
            Don't have an account?{" "}
            <a href="#" className="font-medium text-cyan-400 hover:text-cyan-300 hover:underline transition-colors">
              Sign up
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
