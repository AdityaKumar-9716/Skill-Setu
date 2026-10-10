"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BackButton } from "../components/BackButton";
import { User, MapPin, Briefcase, Calendar, ChevronRight, Award, Compass, Search, Edit2, Activity, Target, Check, LogOut } from "lucide-react";
import Link from "next/link";

type UserData = {
  name: string;
  email: string;
};

type RoadmapHistory = {
  id: string;
  role: string;
  location: string;
  date: string;
  completion: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [history, setHistory] = useState<RoadmapHistory[]>([]);
  const [progressLoaded, setProgressLoaded] = useState(false);

  // Feature states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // 1. Fetch real user from local state
    const storedUser = localStorage.getItem("skillSetuUser");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    setUserData(JSON.parse(storedUser));

    // 2. Fetch history
    const fetchHistory = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setHistory([
        { id: "rd_1", role: "Frontend Developer", location: "Bengaluru, India", date: "Oct 12, 2026", completion: 40 },
        { id: "rd_2", role: "Data Scientist", location: "Mumbai, India", date: "Sep 28, 2026", completion: 15 },
        { id: "rd_3", role: "Backend Engineer", location: "Remote", date: "Aug 05, 2026", completion: 85 },
      ]);
      setLoading(false);
      
      // Trigger dynamic progress bar animations
      setTimeout(() => setProgressLoaded(true), 150);
    };
    fetchHistory();
  }, [router]);

  const handleSaveProfile = () => {
    if (!userData) return;
    const newData = { ...userData, name: editName, email: editEmail };
    setUserData(newData);
    if (typeof window !== "undefined") {
      localStorage.setItem("skillSetuUser", JSON.stringify(newData));
    }
    setIsEditing(false);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("skillSetuUser");
    }
    router.push("/login");
  };

  if (!userData) return null; // Prevent flash of empty state before redirect

  const filteredHistory = history.filter((item) =>
    item.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-200">
      <div className="pointer-events-none fixed inset-0 z-0 flex items-start justify-center opacity-20">
        <div className="mt-[-20%] h-[50rem] w-[50rem] rounded-full bg-cyan-900/30 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/75 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Compass className="h-6 w-6 text-cyan-400" />
            <span className="text-xl font-bold tracking-tight text-slate-100">Skill Setu</span>
          </div>
          <Link href="/" className="text-sm font-medium text-zinc-400 transition-colors hover:text-cyan-400">
            New Audit
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-[1200px] px-4 py-12 sm:px-6 lg:px-8">
        <BackButton />

        <div className="grid gap-8 lg:grid-cols-[350px_minmax(0,1fr)]">
          {/* Profile Sidebar */}
          <aside className="space-y-6">
            <div className="relative rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl shadow-2xl shadow-cyan-900/20">
              
              {/* Edit Profile Button */}
              {isEditing ? (
                <button 
                  onClick={handleSaveProfile}
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/50 bg-cyan-500/20 transition-all hover:bg-cyan-500/40 group"
                  title="Save Profile"
                >
                  <Check className="h-4 w-4 text-cyan-400 transition-colors group-hover:text-cyan-300" />
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setEditName(userData.name);
                    setEditEmail(userData.email);
                    setIsEditing(true);
                  }}
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-slate-800/50 transition-all hover:bg-white/10 group"
                  title="Edit Profile"
                >
                  <Edit2 className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-white" />
                </button>
              )}

              <div className="mb-6 flex flex-col items-center text-center mt-2">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-800/80 ring-4 ring-slate-900/50 shadow-inner">
                  <User className="h-10 w-10 text-cyan-400" />
                </div>
                
                {isEditing ? (
                  <div className="w-full space-y-3 px-2">
                    <input 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full rounded-md border border-white/10 bg-slate-900/80 px-3 py-1.5 text-center text-sm font-medium text-white transition-colors focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
                    />
                    <input 
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="Email Address"
                      className="w-full rounded-md border border-white/10 bg-slate-900/80 px-3 py-1.5 text-center text-sm text-zinc-300 transition-colors focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-white">{userData.name}</h2>
                    <p className="text-sm text-zinc-400">{userData.email}</p>
                  </>
                )}
              </div>

              {/* Quick Stats */}
              <div className="mb-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/5 bg-slate-900/40 p-3 backdrop-blur-md">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                    <Activity className="h-3.5 w-3.5" />
                    Total Audits
                  </span>
                  <div className="mt-1 text-lg font-bold text-white">3</div>
                </div>
                <div className="rounded-xl border border-white/5 bg-slate-900/40 p-3 backdrop-blur-md">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                    <Target className="h-3.5 w-3.5" />
                    Avg Match
                  </span>
                  <div className="mt-1 text-lg font-bold text-cyan-400">72%</div>
                </div>
              </div>

              <div className="space-y-4 rounded-xl border border-white/5 bg-slate-950/40 p-4">
                <div className="flex items-center gap-3 text-sm text-zinc-300">
                  <MapPin className="h-4 w-4 text-zinc-500" />
                  <span>Bengaluru, India</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-300">
                  <Briefcase className="h-4 w-4 text-zinc-500" />
                  <span>Aspiring Developer</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-300">
                  <Calendar className="h-4 w-4 text-zinc-500" />
                  <span>Joined Oct 2026</span>
                </div>
              </div>

              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl shadow-2xl shadow-cyan-900/10">
              <div className="mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-emerald-400" />
                <h3 className="font-semibold text-white">Earned Badges</h3>
              </div>
              <p className="text-sm text-zinc-400">Complete roadmaps to earn Open Badges 3.0 credentials.</p>
            </div>
          </aside>

          {/* Main Dashboard Content */}
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight text-white">Your Roadmaps</h1>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search history..."
                  className="w-full rounded-full border border-white/10 bg-slate-900/40 py-1.5 pl-9 pr-4 text-sm text-zinc-200 placeholder-zinc-500 backdrop-blur-md transition-colors focus:border-cyan-400/50 focus:bg-slate-900/60 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 sm:w-64"
                />
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="flex h-40 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                </div>
              ) : filteredHistory.length > 0 ? (
                filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="group flex cursor-pointer flex-col justify-between gap-4 rounded-2xl border border-white/5 bg-slate-900/30 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/40 hover:bg-slate-800/60 hover:shadow-[0_8px_30px_-4px_rgba(34,211,238,0.15)] sm:flex-row sm:items-center"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-slate-200 transition-colors duration-300 group-hover:text-cyan-400">
                        {item.role}
                      </h3>
                      <div className="mt-1 flex items-center gap-3 text-sm text-zinc-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                          {item.location}
                        </span>
                        <span className="text-zinc-700">•</span>
                        <span>{item.date}</span>
                      </div>
                    </div>

                    <div className="mt-2 flex w-full items-center justify-between gap-6 sm:mt-0 sm:w-auto sm:justify-end">
                      <div className="flex w-full flex-col gap-1 sm:w-auto sm:items-end">
                        <span className="text-xs font-medium text-zinc-500">Progress</span>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800/80 shadow-inner sm:w-24">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 transition-all duration-1000 ease-out"
                              style={{ width: progressLoaded ? `${item.completion}%` : '0%' }}
                            />
                          </div>
                          <span className="w-8 text-right text-sm font-medium text-zinc-300">
                            {item.completion}%
                          </span>
                        </div>
                      </div>
                      
                      <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/5 bg-slate-900 transition-all duration-300 group-hover:border-cyan-500/30 group-hover:bg-cyan-950/40 group-hover:text-cyan-400">
                        <ChevronRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-900/30 p-12 text-center shadow-inner backdrop-blur-xl">
                  <Compass className="mb-4 h-12 w-12 text-zinc-700" />
                  <h3 className="text-lg font-medium text-zinc-300">
                    {searchQuery ? "No roadmaps match your search" : "No roadmaps found"}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-500">
                    {searchQuery ? "Try adjusting your filters." : "You haven't generated any skill roadmaps yet."}
                  </p>
                  {!searchQuery && (
                    <Link
                      href="/"
                      className="mt-6 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 font-medium text-cyan-400 transition-colors hover:border-cyan-500/40 hover:bg-cyan-500/20"
                    >
                      Start an Audit
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
