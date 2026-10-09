"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, Dispatch, ReactNode, RefObject, SetStateAction } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar as RadarSeries,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Braces,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleCheckBig,
  Clock,
  Cloud,
  Code2,
  Compass,
  Copy,
  Cpu,
  Crosshair,
  Database,
  Download,
  Eye,
  EyeOff,
  FileCheck2,
  Fingerprint,
  Gauge,
  Globe,
  GraduationCap,
  Hash,
  Info,
  Layers,
  Locate,
  Lock,
  LogIn,
  Mail,
  MapPin,
  MessageSquare,
  Minus,
  Network,
  Radar as RadarIcon,
  RefreshCw,
  Repeat2,
  Rocket,
  Search,
  Server,
  ShieldCheck,
  Sigma,
  Sliders,
  Sparkles,
  Target,
  Terminal,
  TrendingUp,
  Triangle,
  User,
  UserPlus,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type SkillKey =
  | "python"
  | "sql"
  | "frontend"
  | "dataviz"
  | "ml"
  | "cloud"
  | "apis"
  | "communication";

type LogLevel = "meta" | "cmd" | "ok" | "warn";
type ScriptLine = { text: string; level: LogLevel; delay: number };
type LogLine = ScriptLine & { id: number };
type ExportStage = "idle" | "signing" | "sealed";
type AuthMode = "login" | "signup";
type AuthChannel = "email" | "phone";
type AuthState = { name: string; email: string; phone: string; password: string };
type LocationErrors = { query?: string; pin?: string };
type CareerErrors = { role?: string; domain?: string };
type AuthErrors = { name?: string; identifier?: string; password?: string };

type Priority = "Critical" | "High" | "Medium" | "Market-ready";

type MarketRow = {
  key: SkillKey;
  axis: string;
  axisFull: string;
  you: number;
  market: number;
  gap: number;
  priority: Priority;
};

type Zone = {
  city: string;
  region: string;
  tier: 1 | 2 | 3;
  density: number;
  salary: number;
};

type Credential = {
  "@context": string[];
  type: string[];
  id: string;
  name: string;
  description: string;
  issuer: { id: string; type: string[]; name: string; image: string };
  validFrom: string;
  credentialSubject: Record<string, unknown>;
  credentialSchema: { id: string; type: string };
  proof: {
    type: string;
    created: string;
    verificationMethod: string;
    proofPurpose: string;
    jws: string;
  };
};

type ReportStats = {
  coverage: number;
  avgYou: number;
  avgMarket: number;
  critical: number;
  high: number;
  totalGap: number;
  projected: number;
  openings: string;
  confidence: number;
};

type RoadmapWeek = {
  id: string;
  week: number;
  phase: "Phase 1" | "Phase 2";
  skill: string;
  skillFull: string;
  title: string;
  objective: string;
  tasks: string[];
  outcome: string;
  resources: { title: string; meta: string }[];
  start: number;
  target: number;
};

type SkillAxis = {
  key: SkillKey;
  label: string;
  short: string;
  icon: LucideIcon;
  blurb: string;
  phaseA: { title: string; objective: string; tasks: string[]; outcome: string };
  phaseB: { title: string; objective: string; tasks: string[]; outcome: string };
  resources: { title: string; meta: string }[];
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const PHONE_RE = /^[6-9]\d{9}$/;
const PIN_RE = /^[1-9]\d{5}$/;

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function hashToUnit(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

function makeUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function inrCompact(value: number): string {
  const rounded = Math.round(value);
  const digits = String(Math.abs(rounded));
  let out = "";
  for (let index = 0; index < digits.length; index += 1) {
    const remaining = digits.length - index;
    out += digits[index];
    if (remaining > 1 && remaining % 3 === 1) out += ",";
  }
  return rounded < 0 ? `-${out}` : out;
}

function priorityOf(gap: number): Priority {
  if (gap >= 25) return "Critical";
  if (gap >= 12) return "High";
  if (gap > 0) return "Medium";
  return "Market-ready";
}

const PRIORITY_STYLE: Record<Priority, string> = {
  Critical: "border-rose-500/40 bg-rose-500/10 text-rose-300",
  High: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  Medium: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  "Market-ready": "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
};

const SKILL_AXES: SkillAxis[] = [
  {
    key: "python",
    label: "Python Basics & Data",
    short: "Python",
    icon: Braces,
    blurb: "Learn the fundamentals of Python and how to handle data easily.",
    phaseA: {
      title: "Python Fundamentals",
      objective: "Understand the basics of Python programming.",
      tasks: [
        "Learn variables, loops, and if-statements",
        "Write your first simple Python script",
        "Read data from a basic CSV file"
      ],
      outcome: "You can write small scripts to automate tasks.",
    },
    phaseB: {
      title: "Working with Data",
      objective: "Use Python to analyze real-world data.",
      tasks: [
        "Learn how to use Pandas to view data",
        "Filter and sort data tables",
        "Save your cleaned data to a new file"
      ],
      outcome: "You can organize and clean datasets easily.",
    },
    resources: [
      { title: "Python for Beginners", meta: "youtube.com · 2h" },
      { title: "Pandas Crash Course", meta: "freecodecamp.org · 1h" },
    ],
  },
  {
    key: "sql",
    label: "SQL & Databases",
    short: "SQL",
    icon: Database,
    blurb: "Learn how to store, query, and manage data in databases.",
    phaseA: {
      title: "SQL Basics",
      objective: "Learn how to extract data from a database.",
      tasks: [
        "Write SELECT queries to view data",
        "Use WHERE to filter specific records",
        "Sort results using ORDER BY"
      ],
      outcome: "You can fetch exactly the data you need.",
    },
    phaseB: {
      title: "Joining Data Together",
      objective: "Combine data from multiple tables.",
      tasks: [
        "Learn how to use INNER JOIN",
        "Group data using GROUP BY",
        "Count and sum data automatically"
      ],
      outcome: "You can analyze data across multiple tables.",
    },
    resources: [
      { title: "SQL Tutorial for Beginners", meta: "w3schools.com · 2h" },
      { title: "Database Basics", meta: "youtube.com · 1h" },
    ],
  },
  {
    key: "frontend",
    label: "Frontend Web Dev",
    short: "Frontend",
    icon: Code2,
    blurb: "Build beautiful and interactive websites.",
    phaseA: {
      title: "HTML, CSS & JavaScript",
      objective: "Build a static website from scratch.",
      tasks: [
        "Create page structure with HTML",
        "Style the page with CSS colors and layouts",
        "Add a clickable button using JavaScript"
      ],
      outcome: "You have built your first interactive webpage.",
    },
    phaseB: {
      title: "Modern React Framework",
      objective: "Learn the industry standard for web development.",
      tasks: [
        "Set up a new React project",
        "Create reusable UI components",
        "Manage simple state (like a counter)"
      ],
      outcome: "You can build modern, dynamic web applications.",
    },
    resources: [
      { title: "HTML & CSS Crash Course", meta: "youtube.com · 2h" },
      { title: "React for Beginners", meta: "react.dev · 3h" },
    ],
  },
  {
    key: "dataviz",
    label: "Data Visualization",
    short: "Data Viz",
    icon: BarChart3,
    blurb: "Learn to tell stories by turning data into charts.",
    phaseA: {
      title: "Basic Charts",
      objective: "Create simple and clear visual charts.",
      tasks: [
        "Create a bar chart to compare numbers",
        "Create a line chart to show trends over time",
        "Learn which chart to use for different data"
      ],
      outcome: "You can easily visualize basic data.",
    },
    phaseB: {
      title: "Building Dashboards",
      objective: "Combine charts into a single interactive dashboard.",
      tasks: [
        "Group related charts together on one page",
        "Add simple filters (like choosing a date range)",
        "Make the dashboard look clean and professional"
      ],
      outcome: "You can build a complete data dashboard.",
    },
    resources: [
      { title: "Data Viz Basics", meta: "youtube.com · 1h" },
      { title: "How to Choose the Right Chart", meta: "article · 30m" },
    ],
  },
  {
    key: "ml",
    label: "Machine Learning Basics",
    short: "Basic ML",
    icon: Cpu,
    blurb: "Understand how AI and machine learning works.",
    phaseA: {
      title: "AI Fundamentals",
      objective: "Understand the core concepts of AI.",
      tasks: [
        "Learn the difference between AI and traditional code",
        "Understand training vs testing data",
        "Explore how basic predictions work"
      ],
      outcome: "You understand how AI models learn.",
    },
    phaseB: {
      title: "Using AI Tools",
      objective: "Use pre-built AI to solve problems.",
      tasks: [
        "Use an AI API (like OpenAI or Gemini) in code",
        "Feed data to the AI to get a response",
        "Display the AI's response on a screen"
      ],
      outcome: "You can integrate AI into your own projects.",
    },
    resources: [
      { title: "Machine Learning for Beginners", meta: "youtube.com · 2h" },
      { title: "How to use AI APIs", meta: "tutorial · 1h" },
    ],
  },
  {
    key: "cloud",
    label: "Cloud Deployment",
    short: "Cloud",
    icon: Cloud,
    blurb: "Learn how to put your code on the internet.",
    phaseA: {
      title: "Hosting Basics",
      objective: "Get your website live on the web.",
      tasks: [
        "Create a GitHub repository for your code",
        "Deploy a static site using Vercel or Netlify",
        "Share your live website link with friends"
      ],
      outcome: "Your code is publicly accessible on the internet.",
    },
    phaseB: {
      title: "Basic Backend Hosting",
      objective: "Host a database and server.",
      tasks: [
        "Host a Node.js server online",
        "Connect it to a free cloud database",
        "Ensure your server stays running securely"
      ],
      outcome: "You can host full-stack applications.",
    },
    resources: [
      { title: "Vercel Deployment Guide", meta: "vercel.com · 30m" },
      { title: "Cloud Hosting Basics", meta: "youtube.com · 1h" },
    ],
  },
  {
    key: "apis",
    label: "APIs & Connections",
    short: "APIs",
    icon: Network,
    blurb: "Learn how apps talk to each other across the internet.",
    phaseA: {
      title: "Fetching Data",
      objective: "Retrieve data from a public API.",
      tasks: [
        "Learn what JSON data looks like",
        "Use 'fetch' in JavaScript to get data",
        "Display the fetched data on a webpage"
      ],
      outcome: "You can pull live internet data into your app.",
    },
    phaseB: {
      title: "Building APIs",
      objective: "Create your own API server.",
      tasks: [
        "Set up an Express.js server",
        "Create a route that returns JSON data",
        "Test your API using a tool like Postman"
      ],
      outcome: "You can build backends that serve data.",
    },
    resources: [
      { title: "What is an API?", meta: "youtube.com · 15m" },
      { title: "Postman API Crash Course", meta: "youtube.com · 1h" },
    ],
  },
  {
    key: "communication",
    label: "Communication Skills",
    short: "Soft Skills",
    icon: MessageSquare,
    blurb: "Learn to explain your work clearly to others.",
    phaseA: {
      title: "Writing Updates",
      objective: "Write clear and professional project updates.",
      tasks: [
        "Write a clean summary of what you built",
        "List out blockers or issues simply",
        "Send an email update to a mentor or peer"
      ],
      outcome: "People easily understand your progress.",
    },
    phaseB: {
      title: "Presenting Your Work",
      objective: "Speak confidently about your code.",
      tasks: [
        "Record a 2-minute video demo of your project",
        "Explain a technical feature to a non-technical person",
        "Prepare for a simple mock interview"
      ],
      outcome: "You can demo your work confidently.",
    },
    resources: [
      { title: "How to Demo Your Project", meta: "article · 15m" },
      { title: "Communication for Developers", meta: "youtube.com · 30m" },
    ],
  }
]

const SKILL_BY_KEY = SKILL_AXES.reduce<Record<SkillKey, SkillAxis>>((acc, axis) => {
  acc[axis.key] = axis;
  return acc;
}, {} as Record<SkillKey, SkillAxis>);

const SKILL_KEYS = SKILL_AXES.map((axis) => axis.key);

const DEFAULT_SKILLS: Record<SkillKey, number> = {
  python: 45,
  sql: 40,
  frontend: 35,
  dataviz: 30,
  ml: 25,
  cloud: 20,
  apis: 30,
  communication: 50,
};

const CALIBRATION_PRESETS = [
  { id: "fresher", label: "Fresher · 0–1 yr", scale: 0.44, note: "Foundations plus one project" },
  { id: "mid", label: "Mid-level · 2–4 yr", scale: 0.68, note: "Shipping owned features" },
  { id: "lead", label: "Lead · 5+ yr", scale: 0.88, note: "Architecture and mentoring" },
] as const;

type CalibrationId = (typeof CALIBRATION_PRESETS)[number]["id"] | "market" | "custom";

type CareerPreset = {
  id: string;
  role: string;
  domain: string;
  openings: number;
  median: number;
  spread: string;
  blurb: string;
  bias: Partial<Record<SkillKey, number>>;
};

const CAREER_PRESETS: CareerPreset[] = [
  {
    id: "data-scientist",
    role: "Data Scientist",
    domain: "Technology / SaaS",
    openings: 3480,
    median: 18.4,
    spread: "12–28 LPA",
    blurb: "Largest demand cluster in Bengaluru. Python plus experimentation depth is the gate.",
    bias: { python: 16, ml: 18, sql: 10, dataviz: 8, communication: 4 },
  },
  {
    id: "full-stack",
    role: "Full Stack Engineer",
    domain: "Technology / SaaS",
    openings: 6120,
    median: 15.2,
    spread: "9–24 LPA",
    blurb: "Widest posting volume of any role. TypeScript depth is the differentiator now.",
    bias: { frontend: 16, apis: 12, sql: 8, cloud: 10, python: -6 },
  },
  {
    id: "ml-engineer",
    role: "Machine Learning Engineer",
    domain: "Technology / AI",
    openings: 1960,
    median: 24.6,
    spread: "16–38 LPA",
    blurb: "Fewer roles, far higher ceiling. Production ML and evaluation are decisive.",
    bias: { ml: 22, python: 14, cloud: 12, apis: 8, dataviz: 2 },
  },
  {
    id: "frontend",
    role: "Frontend Engineer",
    domain: "Technology / Product",
    openings: 2740,
    median: 13.8,
    spread: "8–21 LPA",
    blurb: "Accessibility and performance budgets now appear in most senior job descriptions.",
    bias: { frontend: 20, dataviz: 8, apis: 8, cloud: 4, ml: -12 },
  },
  {
    id: "data-analyst",
    role: "Data Analyst",
    domain: "Finance / Analytics",
    openings: 4310,
    median: 11.2,
    spread: "7–17 LPA",
    blurb: "SQL depth plus stakeholder storytelling — the fastest route into analytics teams.",
    bias: { sql: 20, dataviz: 12, communication: 12, python: 4, ml: -8 },
  },
  {
    id: "devops",
    role: "DevOps / Platform Engineer",
    domain: "Technology / Infrastructure",
    openings: 1720,
    median: 17.9,
    spread: "11–27 LPA",
    blurb: "Observability and cost control beat raw Kubernetes trivia in interviews.",
    bias: { cloud: 24, apis: 10, communication: 6, dataviz: -6, ml: -10 },
  },
];

const INDUSTRIES = [
  "Technology / SaaS",
  "Technology / AI",
  "Technology / Product",
  "Technology / Infrastructure",
  "Finance / Analytics",
  "Finance / Banking",
  "Healthcare / Diagnostics",
  "Retail / E-commerce",
  "Manufacturing / Automotive",
  "Media / Entertainment",
  "Education / EdTech",
  "Logistics / Supply Chain",
  "Telecom / Networking",
  "Energy / Renewables",
  "Public Sector / Defence",
];

const PIN_ZONES: Record<string, Zone> = {
  "160001": { city: "Chandigarh", region: "Chandigarh", tier: 2, density: 1.7, salary: 0.78 },
  "201301": { city: "Noida", region: "Uttar Pradesh", tier: 2, density: 2.4, salary: 0.86 },
  "208001": { city: "Kanpur", region: "Uttar Pradesh", tier: 2, density: 1.5, salary: 0.72 },
  "302001": { city: "Jaipur", region: "Rajasthan", tier: 2, density: 1.6, salary: 0.74 },
  "380001": { city: "Ahmedabad", region: "Gujarat", tier: 2, density: 2.1, salary: 0.84 },
  "400001": { city: "Mumbai", region: "Maharashtra", tier: 1, density: 4.6, salary: 1.2 },
  "400076": { city: "Mumbai", region: "Maharashtra", tier: 1, density: 3.9, salary: 1.08 },
  "411001": { city: "Pune", region: "Maharashtra", tier: 1, density: 3.2, salary: 0.95 },
  "500001": { city: "Hyderabad", region: "Telangana", tier: 1, density: 3.4, salary: 0.98 },
  "560001": { city: "Bengaluru", region: "Karnataka", tier: 1, density: 4.2, salary: 1.16 },
  "600001": { city: "Chennai", region: "Tamil Nadu", tier: 1, density: 3.1, salary: 0.94 },
  "682001": { city: "Kochi", region: "Kerala", tier: 2, density: 1.9, salary: 0.8 },
  "700001": { city: "Kolkata", region: "West Bengal", tier: 1, density: 2.7, salary: 0.9 },
  "781001": { city: "Guwahati", region: "Assam", tier: 2, density: 1.2, salary: 0.68 },
  "834001": { city: "Ranchi", region: "Jharkhand", tier: 3, density: 1, salary: 0.66 },
  "110001": { city: "New Delhi", region: "Delhi NCR", tier: 1, density: 3.8, salary: 1.02 },
};

const METROS: { city: string; region: string; pin: string }[] = [
  { city: "Bengaluru", region: "Karnataka", pin: "560001" },
  { city: "Mumbai", region: "Maharashtra", pin: "400001" },
  { city: "New Delhi", region: "Delhi NCR", pin: "110001" },
  { city: "Hyderabad", region: "Telangana", pin: "500001" },
  { city: "Chennai", region: "Tamil Nadu", pin: "600001" },
  { city: "Kolkata", region: "West Bengal", pin: "700001" },
  { city: "Pune", region: "Maharashtra", pin: "411001" },
  { city: "Ahmedabad", region: "Gujarat", pin: "380001" },
  { city: "Jaipur", region: "Rajasthan", pin: "302001" },
  { city: "Kochi", region: "Kerala", pin: "682001" },
  { city: "Noida", region: "Uttar Pradesh", pin: "201301" },
  { city: "Chandigarh", region: "Chandigarh", pin: "160001" },
];

const STEPS: { id: number; label: string; hint: string; icon: LucideIcon }[] = [
  { id: 1, label: "Identity", hint: "Auth & onboarding", icon: Fingerprint },
  { id: 2, label: "Location", hint: "PIN-code precision", icon: MapPin },
  { id: 3, label: "Target role", hint: "Career & domain", icon: Target },
  { id: 4, label: "Calibration", hint: "0–100 skill matrix", icon: Sliders },
  { id: 5, label: "Engine run", hint: "Live terminal logs", icon: Terminal },
  { id: 6, label: "Skill radar", hint: "Gap visualisation", icon: RadarIcon },
  { id: 7, label: "Roadmap", hint: "Deltas & timeline", icon: GraduationCap },
  { id: 8, label: "Credential", hint: "Career Roadmap", icon: BadgeCheck },
];

const FEATURE_PILLARS: { icon: LucideIcon; label: string; meta: string }[] = [
  {
    icon: Activity,
    label: "Live SerpApi job ingestion",
    meta: "google_jobs + google_jobs_analysis, 30-day freshness window",
  },
  {
    icon: Cpu,
    label: "AI Skill Matching",
    meta: "Matching your skills with live job demands via Google Gemini",
  },
  {
    icon: Crosshair,
    label: "PIN-code level demand",
    meta: "six-digit granularity with 16 resolved zones",
  },
  {
    icon: BadgeCheck,
    label: "Your Career Roadmap",
    meta: "Career Roadmap / Personalized Growth Plan",
  },
];

const EXPORT_STAGES = [
  "Generating your personal Roadmap Document",
  "Verifying your profile details",
  "Applying Secure Verification",
  "Done · Your Career Roadmap is ready",
];

const NATIONAL_PULSE = [
  { label: "Live jobs scanned", value: "10+" },
  { label: "Skills matched", value: "8" },
  { label: "Cities covered", value: "16" },
  { label: "Career paths", value: "6" },
];

const TICKER = [
  "google_jobs · bengaluru · data scientist",
  "google_jobs_analysis · pune · full stack",
  "google_jobs · hyderabad · ml engineer",
  "google_jobs · noida · devops",
  "google_jobs · kochi · data analyst",
  "google_jobs_analysis · jaipur · frontend",
];

function buildScript(ctx: { role: string; city: string; density: string }): ScriptLine[] {
  return [
    { text: "Skill-Setu Analysis Engine · Initializing", level: "meta", delay: 140 },
    { text: "> Pinging SerpApi google_jobs...", level: "cmd", delay: 560 },
    { text: "  ok  Connected to SerpApi · 38 ms", level: "ok", delay: 640 },
    {
      text: `> Query: "${ctx.role}" in ${ctx.city} · freshness=30d · sort=date`,
      level: "cmd",
      delay: 500,
    },
    { text: "  ok  Live job postings retrieved", level: "ok", delay: 760 },
    { text: "> Expanding with serpapi google_jobs_analysis...", level: "cmd", delay: 520 },
    {
      text: "  ok  Skill requirements extracted from job descriptions",
      level: "ok",
      delay: 700,
    },
    { text: "> Validating data with Zod schema", level: "cmd", delay: 560 },
    { text: "  ok  All records validated · 0 errors", level: "ok", delay: 660 },
    { text: "> Sending to Google Gemini AI for analysis", level: "cmd", delay: 740 },
    { text: "  ok  AI analysis complete · 1.1 s", level: "ok", delay: 800 },
    { text: "> Running AI Skill Matching...", level: "cmd", delay: 500 },
    { text: "  ok  Skill clusters identified", level: "ok", delay: 880 },
    { text: "> Weighting demand signal by PIN-zone density index", level: "cmd", delay: 540 },
    {
      text: `  ok  ${ctx.city} · ${ctx.density}x posting density vs national median`,
      level: "ok",
      delay: 640,
    },
    { text: "> Fetched live market postings reconciled with your baseline", level: "cmd", delay: 540 },
    { text: "  ok  8 skill areas mapped", level: "ok", delay: 700 },
    { text: "> Computing your skill gaps", level: "cmd", delay: 620 },
    { text: "  !!  critical deltas detected across top-priority axes", level: "warn", delay: 780 },
    { text: "> Building your personalized 10-week roadmap", level: "cmd", delay: 560 },
    { text: "  ok  Roadmap ready · 5 priority skills identified", level: "ok", delay: 680 },
    { text: "> Preparing your Career Roadmap...", level: "cmd", delay: 600 },
    { text: "  ok  Career Roadmap generated", level: "ok", delay: 700 },
    { text: "> Analysis complete. Loading Skill Gap Radar...", level: "meta", delay: 660 },
  ];
}

function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-slate-950" />
      <div
        className="absolute -top-40 left-1/4 h-[38rem] w-[38rem] rounded-full opacity-45 blur-[120px]"
        style={{ background: "radial-gradient(circle, #0891b2 0%, transparent 65%)" }}
      />
      <div
        className="absolute -right-32 top-1/3 h-[32rem] w-[32rem] rounded-full opacity-35 blur-[120px]"
        style={{ background: "radial-gradient(circle, #1d4ed8 0%, transparent 65%)" }}
      />
      <div
        className="absolute bottom-[-10rem] left-[-6rem] h-[30rem] w-[30rem] rounded-full opacity-25 blur-[120px]"
        style={{ background: "radial-gradient(circle, #0e7490 0%, transparent 70%)" }}
      />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(30,41,59,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(30,41,59,0.4) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 20%, transparent 75%)",
        }}
      />
    </div>
  );
}

function LiveDot() {
  return (
    <span className="relative inline-flex h-2 w-2">
      <span className="ss-pulse-ring absolute inline-flex h-full w-full rounded-full bg-cyan-400" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
    </span>
  );
}

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/30 bg-slate-900/70 shadow-[0_0_28px_-6px_rgba(34,211,238,0.55)]">
        <Layers className="h-5 w-5 text-cyan-400" />
        <span className="absolute inset-0 rounded-xl bg-cyan-400/10" />
      </div>
      <div className="leading-tight">
        <p className="flex items-center gap-1.5 text-[15px] font-semibold tracking-tight text-slate-100">
          Skill<span className="text-cyan-400">Setu</span>
          <span className="rounded border border-slate-700 bg-slate-800/60 px-1.5 py-px text-[9px] font-medium uppercase tracking-widest text-slate-400">
            LMI
          </span>
        </p>
        <p className="hidden text-[11px] text-slate-500 sm:block">Live Career Guidance · India</p>
      </div>
    </div>
  );
}

function Panel({
  eyebrow,
  title,
  description,
  icon: Icon,
  children,
  aside,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cx(
        "group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-md transition-colors duration-300 hover:border-slate-700",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <header className="flex flex-col gap-3 border-b border-slate-800/80 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-400/80">
            {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
            {eyebrow}
          </p>
          <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-slate-50 sm:text-xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-400">{description}</p>
          ) : null}
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </header>
      <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
    </section>
  );
}

function Field({
  id,
  label,
  icon: Icon,
  value,
  onChange,
  onBlur,
  error,
  hint,
  placeholder,
  type = "text",
  inputMode,
  autoComplete,
  maxLength,
  list,
  endAdornment,
  trailing,
}: {
  id: string;
  label: string;
  icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string | null;
  hint?: string;
  placeholder?: string;
  type?: string;
  inputMode?: "text" | "tel" | "numeric" | "email" | "search";
  autoComplete?: string;
  maxLength?: number;
  list?: string;
  endAdornment?: ReactNode;
  trailing?: ReactNode;
}) {
  const invalid = Boolean(error);
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="flex items-center justify-between gap-3 text-xs font-medium uppercase tracking-wider text-slate-400"
      >
        <span className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-slate-500" />
          {label}
        </span>
        {trailing}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          onBlur={onBlur}
          inputMode={inputMode}
          autoComplete={autoComplete}
          maxLength={maxLength}
          list={list}
          placeholder={placeholder}
          aria-invalid={invalid}
          aria-describedby={invalid ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cx(
            "w-full rounded-xl border bg-slate-950/60 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600",
            "transition-all duration-200 outline-none focus:ring-2 focus:ring-cyan-400/40",
            invalid
              ? "border-rose-500/60 focus:border-rose-400 focus:ring-rose-400/30"
              : "border-slate-800 hover:border-slate-700 focus:border-cyan-400/60",
            endAdornment ? "pr-11" : undefined,
          )}
        />
        {endAdornment ? (
          <div className="absolute inset-y-0 right-2 flex items-center">{endAdornment}</div>
        ) : null}
      </div>
      {invalid ? (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-xs text-rose-400">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
  icon: Icon,
  type = "button",
  className,
  full,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  icon?: LucideIcon;
  type?: "button" | "submit";
  className?: string;
  full?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl px-5 py-2.5 text-sm font-semibold tracking-tight transition-all duration-200",
        "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-[0_0_28px_-8px_rgba(34,211,238,0.9)]",
        "hover:shadow-[0_0_36px_-6px_rgba(34,211,238,1)] active:scale-[0.985]",
        "disabled:cursor-not-allowed disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:shadow-none",
        full ? "w-full" : undefined,
        className,
      )}
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-white/25 transition-transform duration-700 group-hover:translate-x-full" />
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}

function GhostButton({
  children,
  onClick,
  icon: Icon,
  disabled,
  className,
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  icon?: LucideIcon;
  disabled?: boolean;
  className?: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-sm font-medium text-slate-300",
        "transition-all duration-200 hover:border-cyan-400/40 hover:bg-slate-800/60 hover:text-cyan-300",
        "disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-slate-800 disabled:hover:text-slate-300",
        className,
      )}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  sub,
  accent = "cyan",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub: string;
  accent?: "cyan" | "blue" | "emerald" | "amber" | "rose";
}) {
  const tones: Record<"cyan" | "blue" | "emerald" | "amber" | "rose", string> = {
    cyan: "border-cyan-400/25 bg-cyan-400/10 text-cyan-300",
    blue: "border-blue-500/25 bg-blue-500/10 text-blue-300",
    emerald: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
    amber: "border-amber-500/25 bg-amber-500/10 text-amber-300",
    rose: "border-rose-500/25 bg-rose-500/10 text-rose-300",
  };
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 transition-colors duration-200 hover:border-slate-700">
      <div className="flex items-center gap-2">
        <span className={cx("flex h-7 w-7 items-center justify-center rounded-lg border", tones[accent])}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          {label}
        </p>
      </div>
      <p className="mt-2.5 text-2xl font-semibold tracking-tight text-slate-50">{value}</p>
      <p className="mt-0.5 text-[11px] text-slate-500">{sub}</p>
    </div>
  );
}

function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const count = options.length;
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="relative inline-flex w-full rounded-xl border border-slate-800 bg-slate-950/60 p-1"
    >
      <span
        aria-hidden
        className="absolute inset-y-1 left-1 rounded-lg bg-gradient-to-r from-cyan-400/20 to-blue-500/20 ring-1 ring-cyan-400/40 transition-transform duration-300 ease-out"
        style={{
          width: `calc((100% - 0.5rem) / ${count})`,
          transform: `translateX(${index * 100}%)`,
        }}
      />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          onClick={() => onChange(option.value)}
          className={cx(
            "relative z-10 flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200",
            value === option.value ? "text-cyan-200" : "text-slate-400 hover:text-slate-200",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function Chip({
  children,
  active,
  onClick,
  icon: Icon,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  icon?: LucideIcon;
}) {
  const className = cx(
    "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-all duration-200",
    active
      ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-200"
      : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-200",
  );
  if (!onClick) {
    return (
      <span className={className}>
        {Icon ? <Icon className="h-3 w-3" /> : null}
        {children}
      </span>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {Icon ? <Icon className="h-3 w-3" /> : null}
      {children}
    </button>
  );
}

function MeterBar({
  value,
  tone = "cyan",
  className,
}: {
  value: number;
  tone?: "cyan" | "blue" | "emerald" | "amber" | "rose";
  className?: string;
}) {
  const tones: Record<string, string> = {
    cyan: "from-cyan-400 to-cyan-300",
    blue: "from-blue-500 to-blue-400",
    emerald: "from-emerald-500 to-emerald-400",
    amber: "from-amber-500 to-amber-400",
    rose: "from-rose-500 to-rose-400",
  };
  return (
    <div className={cx("h-1.5 w-full overflow-hidden rounded-full bg-slate-800", className)}>
      <div
        className={cx("h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out", tones[tone])}
        style={{ width: `${clamp(value, 0, 100)}%` }}
      />
    </div>
  );
}

function StepFooter({
  onBack,
  onContinue,
  continueLabel,
  continueIcon: ContinueIcon = ArrowRight,
  disabled,
  hint,
}: {
  onBack?: () => void;
  onContinue: () => void;
  continueLabel: string;
  continueIcon?: LucideIcon;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <div className="mt-6 flex flex-col-reverse items-stretch justify-between gap-3 border-t border-slate-800/80 pt-5 sm:flex-row sm:items-center">
      <div className="flex flex-wrap items-center gap-3">
        {onBack ? (
          <GhostButton onClick={onBack} icon={ArrowLeft}>
            Back
          </GhostButton>
        ) : null}
        {hint ? (
          <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Info className="h-3.5 w-3.5 shrink-0" />
            {hint}
          </p>
        ) : null}
      </div>
      <PrimaryButton onClick={onContinue} icon={ContinueIcon} disabled={disabled}>
        {continueLabel}
      </PrimaryButton>
    </div>
  );
}

function StepRail({
  step,
  maxStep,
  onJump,
}: {
  step: number;
  maxStep: number;
  onJump: (id: number) => void;
}) {
  const completed = step - 1;
  return (
    <nav aria-label="Journey progress" className="lg:sticky lg:top-24">
      <ol className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
        {STEPS.map((item) => {
          const Icon = item.icon;
          const state = item.id < step ? "done" : item.id === step ? "active" : "locked";
          const reachable = item.id <= maxStep;
          return (
            <li key={item.id} className="shrink-0 lg:shrink">
              <button
                type="button"
                onClick={() => {
                  if (reachable) onJump(item.id);
                }}
                disabled={!reachable}
                aria-current={item.id === step ? "step" : undefined}
                title={reachable ? item.hint : "Complete the previous steps to unlock"}
                className={cx(
                  "group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-300",
                  item.id === step
                    ? "border-cyan-400/40 bg-slate-900/70 shadow-[0_0_30px_-12px_rgba(34,211,238,0.8)]"
                    : "border-transparent hover:border-slate-800 hover:bg-slate-900/40",
                  !reachable ? "cursor-not-allowed opacity-40" : undefined,
                )}
              >
                <span
                  className={cx(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors duration-300",
                    state === "active"
                      ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-300"
                      : state === "done"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : "border-slate-800 bg-slate-900/60 text-slate-500",
                  )}
                >
                  {state === "done" ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </span>
                <span className="hidden min-w-0 lg:block">
                  <span
                    className={cx(
                      "block truncate text-sm font-medium tracking-tight",
                      item.id === step ? "text-slate-50" : "text-slate-300",
                    )}
                  >
                    {item.label}
                  </span>
                  <span className="block truncate text-[11px] text-slate-500">{item.hint}</span>
                </span>
                <span className="text-[11px] font-semibold tabular-nums text-slate-600 lg:hidden">
                  {item.id}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <div className="mt-5 hidden rounded-xl border border-slate-800 bg-slate-900/40 p-4 lg:block">
        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          <span>Journey</span>
          <span className="tabular-nums text-cyan-400">{completed}/8</span>
        </div>
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-700 ease-out"
            style={{ width: `${(completed / 8) * 100}%` }}
          />
        </div>
        <p className="mt-2.5 text-[11px] leading-relaxed text-slate-500">
          Everything stays in this browser tab until you export a personalized career roadmap.
        </p>
      </div>
    </nav>
  );
}

function SkillSlider({
  axis,
  value,
  market,
  onChange,
}: {
  axis: SkillAxis;
  value: number;
  market: number;
  onChange: (value: number) => void;
}) {
  const Icon = axis.icon;
  const delta = market - value;
  const tone = delta >= 25 ? "#f43f5e" : delta >= 12 ? "#f59e0b" : delta > 0 ? "#38bdf8" : "#10b981";
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 transition-colors duration-200 hover:border-slate-700">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-cyan-300">
            <Icon className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium tracking-tight text-slate-100">{axis.label}</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{axis.blurb}</p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xl font-semibold tabular-nums tracking-tight text-slate-50">{value}</p>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">self</p>
        </div>
      </div>
      <div className="relative mt-4">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          aria-label={`${axis.label} self-rating`}
          aria-valuetext={`${value} of 100. Market demand is ${market}.`}
          onChange={(event) => onChange(Number(event.target.value))}
          className="ss-range"
          style={{
            background: `linear-gradient(90deg, ${tone} 0%, ${tone} ${value}%, rgb(30 41 59) ${value}%, rgb(30 41 59) 100%)`,
          }}
        />
        <span
          className="pointer-events-none absolute -top-0.5 h-3.5 w-px bg-blue-300"
          style={{ left: `${market}%` }}
          aria-hidden
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[10px] font-medium uppercase tracking-wider">
        <span className="text-slate-600">0</span>
        <span className="flex items-center gap-1.5 text-blue-300">
          <span className="h-2 w-px bg-blue-300" />
          market {market}
        </span>
        <span className="text-slate-600">100</span>
      </div>
      <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-slate-800/80 pt-2.5">
        <span
          className={cx(
            "rounded border px-1.5 py-0.5 text-[10px] font-medium",
            PRIORITY_STYLE[priorityOf(delta)],
          )}
        >
          {priorityOf(delta)}
        </span>
        <span
          className={cx(
            "text-xs font-semibold tabular-nums",
            delta > 0 ? "text-amber-300" : "text-emerald-300",
          )}
        >
          {delta > 0 ? `+${delta} to close` : `${Math.abs(delta)} above market`}
        </span>
      </div>
    </div>
  );
}

function Toast({ message, onDismiss }: { message: string | null; onDismiss: () => void }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDismiss, 3600);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-2.5 rounded-xl border border-cyan-400/30 bg-slate-900/90 px-4 py-3 text-sm text-slate-200 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.95)] backdrop-blur-md"
    >
      <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400" />
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="rounded p-0.5 text-slate-500 transition-colors hover:text-slate-200"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function SkillSetuPage() {
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);

  const [authMode, setAuthMode] = useState<AuthMode>("signup");
  const [authChannel, setAuthChannel] = useState<AuthChannel>("email");
  const [auth, setAuth] = useState<AuthState>({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [authAttempted, setAuthAttempted] = useState(false);

  const [locationQuery, setLocationQuery] = useState("");
  const [pin, setPin] = useState("");
  const [locationAttempted, setLocationAttempted] = useState(false);
  const [locating, setLocating] = useState(false);

  const [role, setRole] = useState("");
  const [domain, setDomain] = useState("");
  const [presetId, setPresetId] = useState<string | null>(null);
  const [careerAttempted, setCareerAttempted] = useState(false);

  const [skills, setSkills] = useState<Record<SkillKey, number>>(DEFAULT_SKILLS);
  const [calibrationId, setCalibrationId] = useState<CalibrationId>("mid");

  const [logs, setLogs] = useState<LogLine[]>([]);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [engineDone, setEngineDone] = useState(false);

  const [credential, setCredential] = useState<Credential | null>(null);
  const [exportStage, setExportStage] = useState<ExportStage>("idle");
  const [exportStep, setExportStep] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [aiReport, setAiReport] = useState<any>(null);

  const exportTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const logSeq = useRef(0);
  const terminalBodyRef = useRef<HTMLDivElement>(null);

  const zone = pin.trim().length === 6 ? PIN_ZONES[pin.trim()] : undefined;
  const activePreset = useMemo(
    () => CAREER_PRESETS.find((preset) => preset.role === role.trim()) ?? null,
    [role],
  );
  const displayName =
    auth.name.trim() ||
    auth.email.split("@")[0]?.trim() ||
    (auth.phone ? `+91 ${auth.phone}` : "") ||
    "Skill Setu member";
  const identity = authChannel === "email" ? auth.email.trim() : auth.phone.trim();

  const market = useMemo<MarketRow[]>(() => {
    const seed = `${role.trim().toLowerCase()}|${domain}|${pin}|${locationQuery.trim().toLowerCase()}`;
    const locality = zone ? (zone.density - 1) * 6 : 0;
    const missingNorm = (aiReport?.missingSkills || []).map((s: string) => s.toLowerCase());

    return SKILL_AXES.map((axis) => {
      const jitter = (hashToUnit(`${seed}::${axis.key}`) - 0.5) * 18;
      const bias = activePreset?.bias[axis.key] ?? 0;
      let demand = Math.round(clamp(56 + bias + locality + jitter, 20, 99));

      // If Gemini flagged this area as a missing skill, boost market demand
      const isMissing = missingNorm.some((ms: string) =>
        ms.includes(axis.key) || axis.label.toLowerCase().includes(ms)
      );
      if (isMissing) demand = Math.min(99, Math.max(demand, 82));

      const you = skills[axis.key];
      const gap = demand - you;
      return {
        key: axis.key,
        axis: axis.short,
        axisFull: axis.label,
        you,
        market: demand,
        gap,
        priority: priorityOf(gap),
      };
    });
  }, [role, domain, pin, locationQuery, zone, activePreset, skills, aiReport]);

  const radarData = useMemo(
    () => market.map((row) => ({ axis: row.axis, you: row.you, market: row.market })),
    [market],
  );

  const gapChartData = useMemo(
    () =>
      market
        .slice()
        .sort((a, b) => b.gap - a.gap)
        .map((row) => ({ axis: row.axis, gap: row.gap, priority: row.priority })),
    [market],
  );

  const stats = useMemo<ReportStats>(() => {
    const totalDemand = market.reduce((acc, row) => acc + row.market, 0) || 1;
    const covered = market.reduce((acc, row) => acc + Math.min(row.you, row.market), 0);
    const coverage = Math.round((covered / totalDemand) * 100);
    const avgYou = Math.round(market.reduce((acc, row) => acc + row.you, 0) / market.length);
    const avgMarket = Math.round(
      market.reduce((acc, row) => acc + row.market, 0) / market.length,
    );
    const critical = market.filter((row) => row.priority === "Critical").length;
    const high = market.filter((row) => row.priority === "High").length;
    const totalGap = market.reduce((acc, row) => acc + Math.max(0, row.gap), 0);
    const baseSalary = activePreset?.median ?? 14.5;
    const projected = baseSalary * (0.74 + (coverage / 100) * 0.4) * (zone?.salary ?? 1);
    const baseOpenings = activePreset?.openings ?? 2400;
    return {
      coverage,
      avgYou,
      avgMarket,
      critical,
      high,
      totalGap,
      projected,
      openings: inrCompact(Math.round(baseOpenings * (zone?.density ?? 1.6))),
      confidence: Math.round(70 + (coverage / 100) * 22),
    };
  }, [market, activePreset, zone]);

  const roadmap = useMemo<RoadmapWeek[]>(() => {
    const focus = market.slice().sort((a, b) => b.gap - a.gap).slice(0, 5);
    return focus.flatMap((row, index) => {
      const axis = SKILL_BY_KEY[row.key];
      const gain = Math.max(9, Math.round(row.gap * 0.55));
      return [
        {
          id: `${row.key}-a`,
          week: index * 2 + 1,
          phase: "Phase 1" as const,
          skill: axis.short,
          skillFull: axis.label,
          title: axis.phaseA.title,
          objective: axis.phaseA.objective,
          tasks: axis.phaseA.tasks,
          outcome: axis.phaseA.outcome,
          resources: axis.resources,
          start: row.you,
          target: Math.min(100, row.you + gain),
        },
        {
          id: `${row.key}-b`,
          week: index * 2 + 2,
          phase: "Phase 2" as const,
          skill: axis.short,
          skillFull: axis.label,
          title: axis.phaseB.title,
          objective: axis.phaseB.objective,
          tasks: axis.phaseB.tasks,
          outcome: axis.phaseB.outcome,
          resources: axis.resources,
          start: Math.min(100, row.you + gain),
          target: Math.min(100, row.you + gain * 1.25),
        },
      ];
    });
  }, [market]);

  const terminalScript = useMemo(
    () =>
      buildScript({
        role: role.trim() || "Data Scientist",
        city: zone?.city ?? (locationQuery.trim() || "India"),
        density: (zone?.density ?? 1.8).toFixed(1),
      }),
    [role, zone, locationQuery],
  );

  const authErrors = useMemo<AuthErrors>(() => {
    const errors: AuthErrors = {};
    if (authMode === "signup" && auth.name.trim().length < 2) {
      errors.name = "Tell us what to call you (2+ characters).";
    }
    if (authChannel === "email") {
      if (!EMAIL_RE.test(auth.email.trim())) errors.identifier = "Enter a valid email address.";
    } else if (!PHONE_RE.test(auth.phone.trim())) {
      errors.identifier = "Enter a 10-digit Indian mobile number.";
    }
    if (auth.password.length < 8) {
      errors.password = "Minimum 8 characters.";
    } else if (!/[A-Za-z]/.test(auth.password) || !/\d/.test(auth.password)) {
      errors.password = "Mix at least one letter and one number.";
    }
    return errors;
  }, [auth, authMode, authChannel]);

  const locationErrors = useMemo<LocationErrors>(() => {
    const errors: LocationErrors = {};
    if (locationQuery.trim().length < 2) errors.query = "Enter a city or region (2+ characters).";
    if (!PIN_RE.test(pin.trim())) errors.pin = "Enter a valid 6-digit Indian PIN code.";
    return errors;
  }, [locationQuery, pin]);

  const careerErrors = useMemo<CareerErrors>(() => {
    const errors: CareerErrors = {};
    if (role.trim().length < 3) errors.role = "Name the target role you are calibrating for.";
    if (!domain) errors.domain = "Pick an industry domain to weight demand correctly.";
    return errors;
  }, [role, domain]);

  const authValid = Object.keys(authErrors).length === 0;
  const locationValid = Object.keys(locationErrors).length === 0;
  const careerValid = Object.keys(careerErrors).length === 0;

  const suggestions = useMemo(() => {
    const query = locationQuery.trim().toLowerCase();
    if (query.length < 2) return [];
    return METROS.filter(
      (metro) =>
        metro.city.toLowerCase().includes(query) || metro.region.toLowerCase().includes(query),
    ).slice(0, 5);
  }, [locationQuery]);

  const reportRef = useRef({
    role,
    domain,
    pin,
    zone,
    market,
    stats,
    displayName,
    identity,
  });
  reportRef.current = { role, domain, pin, zone, market, stats, displayName, identity };

  useEffect(() => {
    if (step !== 5) return;
    let cancelled = false;
    logSeq.current += 1;
    const runId = logSeq.current;
    setLogs([]);
    setProgress(0);
    setEngineDone(false);

    // LIVE API CALL: Fire the backend pipeline in parallel with the terminal animation
    fetch("http://localhost:5000/api/analyze/full-audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetRole: role || "Data Scientist",
        studentSkills: Object.keys(skills),
        location: zone?.city || locationQuery || "India",
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.success && data.auditResult) {
          setAiReport(data.auditResult);
        }
      })
      .catch((err) => console.warn("[Skill Setu] Backend API unavailable:", err));


    const timers: ReturnType<typeof setTimeout>[] = [];
    let cumulative = 0;
    terminalScript.forEach((line, index) => {
      cumulative += line.delay;
      timers.push(
        setTimeout(() => {
          if (cancelled) return;
          setLogs((prev) => [...prev, { ...line, id: runId * 1000 + index }]);
          setProgress(Math.round(((index + 1) / terminalScript.length) * 100));
          if (index === terminalScript.length - 1) {
            timers.push(
              setTimeout(() => {
                if (cancelled) return;
                setEngineDone(true);
                timers.push(
                  setTimeout(() => {
                    if (cancelled) return;
                    setStep(6);
                    setMaxStep((prev) => Math.max(prev, 6));
                  }, 1250),
                );
              }, 750),
            );
          }
        }, cumulative),
      );
    });

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [step, terminalScript]);

  useEffect(() => {
    if (step !== 5) return;
    setElapsed(0);
    const startedAt = Date.now();
    const timer = setInterval(() => {
      setElapsed((Date.now() - startedAt) / 1000);
    }, 100);
    return () => clearInterval(timer);
  }, [step]);

  useEffect(() => {
    if (step !== 5 || engineDone) return;
    const body = terminalBodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [logs.length, step, engineDone]);

  useEffect(() => {
    if (step !== 8 || credential) return;
    setCredential(mintCredential(reportRef.current));
  }, [step, credential]);

  useEffect(
    () => () => {
      exportTimers.current.forEach(clearTimeout);
    },
    [],
  );

  const goTo = useCallback(
    (id: number) => {
      if (id > maxStep) return;
      setStep(id);
    },
    [maxStep],
  );

  const advance = useCallback(() => {
    const next = Math.min(8, step + 1);
    setStep(next);
    setMaxStep((prev) => Math.max(prev, next));
  }, [step]);

  const goBack = useCallback(() => {
    setStep((prev) => Math.max(1, prev - 1));
  }, []);

  const restart = useCallback(() => {
    exportTimers.current.forEach(clearTimeout);
    exportTimers.current = [];
    setStep(1);
    setMaxStep(1);
    setAuth({ name: "", email: "", phone: "", password: "" });
    setAuthMode("signup");
    setAuthChannel("email");
    setAuthAttempted(false);
    setLocationQuery("");
    setPin("");
    setLocationAttempted(false);
    setRole("");
    setDomain("");
    setPresetId(null);
    setCareerAttempted(false);
    setSkills(DEFAULT_SKILLS);
    setCalibrationId("mid");
    setLogs([]);
    setProgress(0);
    setElapsed(0);
    setEngineDone(false);
    setCredential(null);
    setExportStage("idle");
    setExportStep(0);
  }, []);

  const applyCalibration = useCallback((id: CalibrationId) => {
    const preset = CALIBRATION_PRESETS.find((item) => item.id === id);
    if (!preset) return;
    setCalibrationId(id);
    setSkills(
      SKILL_KEYS.reduce<Record<SkillKey, number>>((acc, key) => {
        const jitter = (hashToUnit(`${id}:${key}`) - 0.5) * 22;
        acc[key] = Math.round(clamp(preset.scale * 100 + jitter, 6, 100));
        return acc;
      }, {} as Record<SkillKey, number>),
    );
  }, []);

  const syncFromMarket = useCallback(() => {
    setSkills(
      market.reduce<Record<SkillKey, number>>((acc, row) => {
        const jitter = (hashToUnit(`market:${row.key}:${pin}`) - 0.5) * 16;
        acc[row.key] = Math.round(clamp(row.market * 0.58 + jitter, 8, 100));
        return acc;
      }, {} as Record<SkillKey, number>),
    );
    setCalibrationId("market");
  }, [market, pin]);

  const pickZone = useCallback((code: string) => {
    const target = PIN_ZONES[code];
    setPin(code);
    setLocationQuery(target ? `${target.city}, ${target.region}` : "");
  }, []);

  const detectLocation = useCallback(() => {
    if (locating) return;
    setLocating(true);
    const resolve = (code: string) => {
      window.setTimeout(() => {
        pickZone(PIN_ZONES[code] ? code : "110001");
        setLocating(false);
      }, 950);
    };
    if (typeof navigator !== "undefined" && typeof navigator.geolocation?.getCurrentPosition === "function") {
      navigator.geolocation.getCurrentPosition(
        () => resolve("560001"),
        () => resolve("110001"),
        { timeout: 4000, maximumAge: 300000 },
      );
    } else {
      resolve("110001");
    }
  }, [locating, pickZone]);

  const copyLogs = useCallback(async () => {
    const text = logs
      .map((line) => `${line.level.toUpperCase().padEnd(4, " ")} ${line.text}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setToast("Engine log copied to clipboard.");
    } catch {
      setToast("Clipboard blocked by the browser — select the terminal text instead.");
    }
  }, [logs]);

  const skipEngine = useCallback(() => {
    setEngineDone(true);
    setStep(6);
    setMaxStep((prev) => Math.max(prev, 6));
  }, []);

  const runExport = useCallback(() => {
    if (!credential || exportStage === "signing") return;
    setExportStage("signing");
    setExportStep(0);
    exportTimers.current.forEach(clearTimeout);
    exportTimers.current = EXPORT_STAGES.map((_, index) =>
      setTimeout(() => {
        setExportStep(index + 1);
        if (index === EXPORT_STAGES.length - 1) {
          setExportStage("sealed");
          setToast("Credential sealed — Career Roadmap envelope verified locally.");
        }
      }, (index + 1) * 640),
    );
  }, [credential, exportStage]);

  const downloadCredential = useCallback(() => {
    if (!credential) return;
    const slug = `${(role.trim() || "lmi").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${pin || "000000"}`;
    const blob = new Blob([JSON.stringify(credential, null, 2)], { type: "application/ld+json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${slug}.credential.jsonld`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
    setToast("Download started — check your browser downloads.");
  }, [credential, role, pin]);

  const copyCredential = useCallback(async () => {
    if (!credential) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(credential, null, 2));
      setToast("Roadmap Data copied to clipboard.");
    } catch {
      setToast("Clipboard blocked by the browser — use the download instead.");
    }
  }, [credential]);

  const remintCredential = useCallback(() => {
    setCredential(mintCredential(reportRef.current));
    setExportStage("idle");
    setExportStep(0);
    setToast("New credential envelope minted with a fresh UUID.");
  }, []);

  const selectPreset = useCallback((id: string) => {
    const preset = CAREER_PRESETS.find((item) => item.id === id);
    if (!preset) return;
    setPresetId(preset.id);
    setRole(preset.role);
    setDomain(preset.domain);
  }, []);

  const handleRoleInput = useCallback((value: string) => {
    setRole(value);
    const match = CAREER_PRESETS.find((preset) => preset.role === value.trim());
    setPresetId(match ? match.id : null);
    if (match) setDomain(match.domain);
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  return (
    <div className="relative flex min-h-screen flex-col">
      <AmbientBackground />

      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <BrandMark />
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="hidden items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 md:flex">
              <LiveDot />
              <span className="text-[11px] font-medium tracking-tight text-slate-300">SerpApi feed live</span>
              <span className="text-[11px] tabular-nums text-slate-500">
                {stats.openings} postings
              </span>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 lg:flex">
              <MapPin className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-[11px] font-medium tracking-tight text-slate-300">
                {zone ? `${zone.city}, ${zone.region}` : "Location unset"}
              </span>
              {pin ? (
                <span className="font-mono text-[11px] tabular-nums text-slate-500">{pin}</span>
              ) : null}
            </div>
            <button
              type="button"
              onClick={restart}
              title="Restart the journey"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 transition-colors hover:border-cyan-400/40 hover:text-cyan-300"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="sr-only">Restart journey</span>
            </button>
          </div>
        </div>
        <div className="relative h-px w-full overflow-hidden">
          <div className="ss-sweep absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />
        </div>
      </header>

      {step === 1 ? (
        <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,430px)_minmax(0,1fr)] lg:gap-10">
            <AuthStep
              mode={authMode}
              onModeChange={(next) => {
                setAuthMode(next);
                setAuthAttempted(false);
              }}
              channel={authChannel}
              onChannelChange={setAuthChannel}
              auth={auth}
              setAuth={setAuth}
              errors={authErrors}
              attempted={authAttempted}
              onSubmit={() => {
                setAuthAttempted(true);
                if (authValid) advance();
              }}
            />
            <IntroPanel />
          </div>
        </main>
      ) : (
        <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-5 px-4 pb-20 pt-5 sm:px-6 lg:flex-row lg:gap-8 lg:px-8 lg:pt-8">
          <aside className="w-full shrink-0 lg:w-64">
            <StepRail step={step} maxStep={maxStep} onJump={goTo} />
          </aside>
          <div className="min-w-0 flex-1 space-y-5">
            {step === 2 ? (
              <LocationStep
                query={locationQuery}
                onQuery={setLocationQuery}
                pin={pin}
                onPin={(value) => setPin(value.replace(/\D/g, "").slice(0, 6))}
                errors={locationErrors}
                attempted={locationAttempted}
                zone={zone}
                suggestions={suggestions}
                locating={locating}
                onDetect={detectLocation}
                onPickZone={pickZone}
                onClear={() => {
                  setLocationQuery("");
                  setPin("");
                }}
                onContinue={() => {
                  setLocationAttempted(true);
                  if (locationValid) advance();
                }}
                onBack={goBack}
              />
            ) : null}

            {step === 3 ? (
              <CareerStep
                role={role}
                onRole={handleRoleInput}
                domain={domain}
                onDomain={setDomain}
                presetId={presetId}
                onPreset={selectPreset}
                errors={careerErrors}
                attempted={careerAttempted}
                onContinue={() => {
                  setCareerAttempted(true);
                  if (careerValid) advance();
                }}
                onBack={goBack}
              />
            ) : null}

            {step === 4 ? (
              <SkillsStep
                skills={skills}
                market={market}
                stats={stats}
                calibrationId={calibrationId}
                onCalibration={applyCalibration}
                onSyncFromMarket={syncFromMarket}
                onSkillChange={(key, value) => {
                  setSkills((prev) => ({ ...prev, [key]: value }));
                  setCalibrationId("custom");
                }}
                onReset={() => {
                  setSkills(DEFAULT_SKILLS);
                  setCalibrationId("mid");
                }}
                onContinue={advance}
                onBack={goBack}
              />
            ) : null}

            {step === 5 ? (
              <TerminalStep
                logs={logs}
                progress={progress}
                elapsed={elapsed}
                done={engineDone}
                total={terminalScript.length}
                bodyRef={terminalBodyRef}
                onCopy={copyLogs}
                onSkip={skipEngine}
                onBack={goBack}
              />
            ) : null}

            {step === 6 ? (
              <RadarStep
                market={market}
                radarData={radarData}
                stats={stats}
                zone={zone}
                role={role}
                aiReport={aiReport}
                onRerun={() => setStep(5)}
                onContinue={advance}
                onBack={goBack}
              />
            ) : null}

            {step === 7 ? (
              <RoadmapStep
                market={market}
                gapChartData={gapChartData}
                roadmap={roadmap}
                stats={stats}
                onRecalibrate={() => setStep(4)}
                onContinue={advance}
                onBack={goBack}
              />
            ) : null}

            {step === 8 && credential ? (
              <CredentialStep
                credential={credential}
                exportStage={exportStage}
                exportStep={exportStep}
                stats={stats}
                role={role}
                pin={pin}
                identity={identity}
                onExport={runExport}
                onDownload={downloadCredential}
                onCopy={copyCredential}
                onRemint={remintCredential}
                onBack={goBack}
                onRestart={restart}
              />
            ) : null}
          </div>
        </main>
      )}

      <footer className="border-t border-slate-800/80 bg-slate-950/60">
        <div className="mx-auto flex max-w-[1600px] flex-col items-start justify-between gap-2 px-4 py-4 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p>
            Skill Setu · SerpApi India Hackathon 2026 · Powered by live SerpApi, Google Gemini AI & Firebase
            
          </p>
          <p className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
            Credentials follow Career Roadmap (Personalized Growth Plan)
          </p>
        </div>
      </footer>

      <Toast message={toast} onDismiss={dismissToast} />
    </div>
  );
}

function AuthStep({
  mode,
  onModeChange,
  channel,
  onChannelChange,
  auth,
  setAuth,
  errors,
  attempted,
  onSubmit,
}: {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  channel: AuthChannel;
  onChannelChange: (channel: AuthChannel) => void;
  auth: AuthState;
  setAuth: Dispatch<SetStateAction<AuthState>>;
  errors: AuthErrors;
  attempted: boolean;
  onSubmit: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <Panel
      eyebrow="Step 01 · Identity"
      title={mode === "signup" ? "Create your Skill Setu profile" : "Welcome back"}
      description={
        mode === "signup"
          ? "One profile unlocks PIN-code level demand signals, a verified gap report and a portable credential."
          : "Sign in to restore your saved calibration and regenerate the latest market report."
      }
      icon={Fingerprint}
      className="self-start"
      aside={
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-950/60 px-3 py-1.5 text-[11px] text-slate-400">
          <LiveDot />
          {mode === "signup" ? "Takes 40 seconds" : "Session restored"}
        </span>
      }
    >
      <form
        className="space-y-5"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <SegmentedControl
          value={mode}
          ariaLabel="Authentication mode"
          onChange={onModeChange}
          options={[
            { value: "signup", label: "Sign up" },
            { value: "login", label: "Log in" },
          ]}
        />

        <SegmentedControl
          value={channel}
          ariaLabel="Contact channel"
          onChange={onChannelChange}
          options={[
            { value: "email", label: "Email" },
            { value: "phone", label: "Phone" },
          ]}
        />

        {mode === "signup" ? (
          <Field
            id="ss-name"
            label="Full name"
            icon={User}
            value={auth.name}
            onChange={(value) => setAuth((prev) => ({ ...prev, name: value }))}
            error={attempted ? (errors.name ?? null) : null}
            placeholder="Aarav Sharma"
            autoComplete="name"
            maxLength={64}
          />
        ) : null}

        {channel === "email" ? (
          <Field
            id="ss-email"
            label="Email address"
            icon={Mail}
            type="email"
            inputMode="email"
            value={auth.email}
            onChange={(value) => setAuth((prev) => ({ ...prev, email: value }))}
            error={attempted ? (errors.identifier ?? null) : null}
            placeholder="aarav@company.in"
            autoComplete="email"
            maxLength={96}
          />
        ) : (
          <Field
            id="ss-phone"
            label="Mobile number"
            icon={Hash}
            type="tel"
            inputMode="tel"
            value={auth.phone}
            onChange={(value) =>
              setAuth((prev) => ({ ...prev, phone: value.replace(/\D/g, "").slice(0, 10) }))
            }
            error={attempted ? (errors.identifier ?? null) : null}
            placeholder="98765 43210"
            autoComplete="tel-national"
            maxLength={10}
            hint="10-digit Indian mobile, used for OTP verification only."
            trailing={
              <span className="text-[11px] text-slate-500">+91</span>
            }
          />
        )}

        <Field
          id="ss-password"
          label="Password"
          icon={Lock}
          type={showPassword ? "text" : "password"}
          value={auth.password}
          onChange={(value) => setAuth((prev) => ({ ...prev, password: value }))}
          error={attempted ? (errors.password ?? null) : null}
          placeholder="••••••••"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          maxLength={72}
          endAdornment={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="rounded-md p-1.5 text-slate-500 transition-colors hover:text-cyan-300"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />

        <div className="flex items-start gap-2.5 rounded-xl border border-slate-800 bg-slate-950/40 p-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
          <p className="text-[11px] leading-relaxed text-slate-400">
            Your data is processed securely via our AI backend. Your calibration lives in this browser tab and is
            encoded into the credential you export.
          </p>
        </div>

        <PrimaryButton type="submit" icon={mode === "signup" ? UserPlus : LogIn} full>
          {mode === "signup" ? "Create profile & continue" : "Log in & continue"}
        </PrimaryButton>
      </form>
    </Panel>
  );
}

function IntroPanel() {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[11px] font-medium tracking-tight text-cyan-300">
            <Sparkles className="h-3.5 w-3.5" />
            SerpApi India Hackathon 2026
          </span>
          <h1 className="mt-5 max-w-2xl text-3xl font-semibold leading-[1.1] tracking-tight text-slate-50 sm:text-4xl xl:text-[2.75rem]">
            Know exactly which skills your local market pays for —{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
              before you spend another weekend learning the wrong thing.
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
            Skill Setu turns live job postings into a PIN-code precise competency gap report, a
            sequenced 10-week roadmap, and a verifiable Career Roadmap credential you can attach to
            any profile.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Chip icon={Zap}>8-stage guided flow</Chip>
            <Chip icon={Crosshair}>6-digit PIN precision</Chip>
            <Chip icon={Award}>Exportable credential</Chip>
            <Chip icon={Gauge}>Zero signup friction</Chip>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {FEATURE_PILLARS.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <div
              key={pillar.label}
              className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/30"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-950/60 text-cyan-300 transition-colors duration-300 group-hover:border-cyan-400/40">
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-3.5 text-sm font-medium tracking-tight text-slate-100">
                {pillar.label}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{pillar.meta}</p>
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
        <div className="flex items-center gap-2 border-b border-slate-800/80 px-5 py-3">
          <Activity className="h-3.5 w-3.5 text-cyan-400" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            SerpApi query stream
          </p>
        </div>
        <div className="relative h-9 overflow-hidden">
          <div className="ss-marquee flex w-max items-center gap-8 whitespace-nowrap px-4">
            {[...TICKER, ...TICKER].map((item, index) => (
              <span key={`${item}-${index}`} className="font-mono text-[11px] text-slate-500">
                <span className="text-cyan-400/80">&gt;</span> {item}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 border-t border-slate-800/80 px-5 py-4 sm:grid-cols-4">
          {NATIONAL_PULSE.map((item) => (
            <div key={item.label}>
              <p className="text-xl font-semibold tracking-tight text-slate-50">{item.value}</p>
              <p className="mt-0.5 text-[11px] text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function mintCredential(input: {
  role: string;
  domain: string;
  pin: string;
  zone: Zone | undefined;
  market: MarketRow[];
  stats: ReportStats;
  displayName: string;
  identity: string;
}): Credential {
  const uuid = makeUuid();
  const issued = new Date();
  const slug = (input.role || "open-role")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const handle = hashToUnit(input.identity || input.displayName)
    .toString(36)
    .slice(2, 12);
  const city = input.zone?.city ?? "India";

  return {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://purl.imsglobal.org/spec/ob/v3p0/context.json",
    ],
    type: ["VerifiableCredential", "OpenBadgeCredential"],
    id: `urn:uuid:${uuid}`,
    name: `Skill Setu LMI Skill Gap Report — ${input.role || "Open Role"}`,
    description: `Verified skill-gap analysis for ${input.role || "an open role"} in ${city} (PIN ${
      input.pin || "—"
    }), benchmarked against clustered SerpApi job-market demand across ${input.market.length} competency axes.`,
    issuer: {
      id: "https://skillsetu.io/issuers/lmi-engine",
      type: ["Profile"],
      name: "Skill Setu Live Career Guidance Engine",
      image: "https://skillsetu.io/issuers/lmi-engine/image.png",
    },
    validFrom: issued.toISOString(),
    credentialSubject: {
      id: `did:skillsetu:${handle}`,
      type: ["AchievementSubject"],
      name: input.displayName,
      identifier: input.identity
        ? [{ type: "PropertyValue", value: input.identity }]
        : [{ type: "PropertyValue", value: `slug-${slug}` }],
      achievement: {
        type: ["Achievement"],
        name: "Market-Aligned Skill Calibration",
        description: `Calibrated against ${city} demand for ${
          input.domain || "an unspecified domain"
        }. Coverage ${input.stats.coverage}%, model confidence ${
          input.stats.confidence
        }%, ${input.stats.critical} critical gap${
          input.stats.critical === 1 ? "" : "s"
        } with a remediation plan attached.`,
        criteria: {
          type: "Criteria",
          narrative:
            "Self-declared 0–100 proficiency compared against live job-posting demand from SerpApi.",
        },
      },
      resultDescription: input.market
        .map(
          (row) =>
            `${row.axis}: self ${row.you} / market ${row.market} (delta ${
              row.gap > 0 ? "+" : ""
            }${row.gap}, ${row.priority})`,
        )
        .join("; "),
      competencyDelta: input.market.map((row) => ({
        "@type": "PropertyValue",
        name: row.axis,
        selfReported: row.you,
        marketDemand: row.market,
        gap: row.gap,
        priority: row.priority,
      })),
      projectedCompensation: {
        "@type": "QuantitativeValue",
        value: Number(input.stats.projected.toFixed(2)),
        unitText: "INR LPA",
      },
      activityStartDate: issued.toISOString().slice(0, 10),
      activityEndDate: new Date(issued.getTime() + 1000 * 60 * 60 * 24 * 365)
        .toISOString()
        .slice(0, 10),
      creditsEarned: 3,
    },
    credentialSchema: {
      id: "https://skillsetu.io/schemas/lmi-skill-gap-report/v1.json",
      type: "JsonSchemaValidator2019",
    },
    proof: {
      type: "Ed25519Signature2018",
      created: issued.toISOString(),
      verificationMethod: "https://skillsetu.io/issuers/lmi-engine#key-1",
      proofPurpose: "assertionMethod",
      jws: `eyJhbGciOiJFZERTQSIsImtpZCI6InNraWxsLXNldHVfZWRfMjAyNiJ9.${hashToUnit(
        `${uuid}:${input.pin}`,
      )
        .toString(36)
        .padEnd(28, "0")}.demo-signature-not-production`,
    },
  };
}

function LocationStep({
  query,
  onQuery,
  pin,
  onPin,
  errors,
  attempted,
  zone,
  suggestions,
  locating,
  onDetect,
  onPickZone,
  onClear,
  onContinue,
  onBack,
}: {
  query: string;
  onQuery: (value: string) => void;
  pin: string;
  onPin: (value: string) => void;
  errors: LocationErrors;
  attempted: boolean;
  zone: Zone | undefined;
  suggestions: { city: string; region: string; pin: string }[];
  locating: boolean;
  onDetect: () => void;
  onPickZone: (code: string) => void;
  onClear: () => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const popular = Object.entries(PIN_ZONES)
    .filter(([, meta]) => meta.tier === 1)
    .slice(0, 6);
  return (
    <Panel
      eyebrow="Step 02 · Geolocation"
      title="Pin the market you actually want"
      description="Demand is not national — Bengaluru and Ranchi do not price the same skills. We resolve your 6-digit PIN to a zone, then weight every demand score by local posting density and cost of living."
      icon={MapPin}
      aside={
        <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/60 px-3 py-1.5 text-[11px] text-slate-400">
          <LiveDot />
          16 zones resolved · 2,400+ prefixes
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
        <div className="space-y-5">
          <div className="relative">
            <Field
              id="ss-city"
              label="City or region"
              icon={Globe}
              value={query}
              onChange={onQuery}
              error={attempted ? (errors.query ?? null) : null}
              placeholder="Bengaluru, Karnataka"
              autoComplete="address-level2"
              maxLength={64}
              hint="Sent to SerpApi as the jobs location parameter and used to name your zone."
            />
            {suggestions.length > 0 ? (
              <ul className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-slate-700 bg-slate-950/95 shadow-2xl backdrop-blur-md">
                {suggestions.map((item) => (
                  <li key={item.pin}>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        onQuery(`${item.city}, ${item.region}`);
                        onPin(item.pin);
                      }}
                      className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-sm text-slate-300 transition-colors hover:bg-slate-800/70 hover:text-cyan-200"
                    >
                      <span className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-slate-500" />
                        {item.city}, {item.region}
                      </span>
                      <span className="font-mono text-[11px] tabular-nums text-slate-500">
                        {item.pin}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <Field
            id="ss-pin"
            label="PIN code"
            icon={Hash}
            inputMode="numeric"
            value={pin}
            onChange={onPin}
            error={attempted ? (errors.pin ?? null) : null}
            placeholder="560001"
            maxLength={6}
            autoComplete="postal-code"
            hint="A valid Indian PIN never starts with 0 — that is our first structural check."
            trailing={
              <span className="font-mono text-xs tabular-nums text-slate-600">{pin.length}/6</span>
            }
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <GhostButton onClick={onDetect} icon={Locate} disabled={locating} className="flex-1">
              {locating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Detecting location…
                </>
              ) : (
                "Detect my location"
              )}
            </GhostButton>
            <GhostButton onClick={onClear} icon={Repeat2} className="flex-1">
              Clear
            </GhostButton>
          </div>

          <div className="space-y-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Popular tier-1 zones
            </p>
            <div className="flex flex-wrap gap-2">
              {popular.map(([code, meta]) => (
                <Chip key={code} active={pin === code} onClick={() => onPickZone(code)} icon={MapPin}>
                  {meta.city}
                  <span className="font-mono text-[10px] tabular-nums opacity-60">{code}</span>
                </Chip>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div
            className={cx(
              "relative overflow-hidden rounded-2xl border p-5 transition-colors duration-300",
              zone ? "border-cyan-400/30 bg-cyan-400/[0.04]" : "border-slate-800 bg-slate-950/40",
            )}
          >
            {zone ? (
              <>
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Zone resolved
                </div>
                <p className="mt-3 text-xl font-semibold tracking-tight text-slate-50">{zone.city}</p>
                <p className="text-sm text-slate-400">
                  {zone.region} · Tier {zone.tier}
                </p>
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Posting density</span>
                      <span className="tabular-nums text-cyan-300">{zone.density}x</span>
                    </div>
                    <MeterBar value={(zone.density / 5) * 100} className="mt-1.5" />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Cost-of-living index</span>
                      <span className="tabular-nums text-blue-300">{zone.salary.toFixed(2)}x</span>
                    </div>
                    <MeterBar
                      value={(zone.salary / 1.3) * 100}
                      tone="blue"
                      className="mt-1.5"
                    />
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <Chip icon={Crosshair}>density weighted</Chip>
                  <Chip icon={TrendingUp}>salary normalised</Chip>
                </div>
              </>
            ) : (
              <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
                <Locate className="h-7 w-7 text-slate-700" />
                <p className="mt-3 text-sm text-slate-400">No zone resolved yet</p>
                <p className="mt-1 max-w-[24ch] text-[11px] leading-relaxed text-slate-600">
                  Enter a valid 6-digit PIN to unlock local demand weighting and compensation
                  normalisation.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Why this matters
            </p>
            <ul className="mt-3 space-y-2.5 text-[11px] leading-relaxed text-slate-400">
              {[
                "SerpApi google_jobs takes a location string — we send the resolved city name.",
                "PIN prefixes map to distinct wage bands, so salary outlook is normalised per zone.",
                "Density weighting stops metro bias from drowning out tier-2 and tier-3 hiring.",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400/70" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <StepFooter
        onBack={onBack}
        onContinue={onContinue}
        continueLabel="Lock location & continue"
        continueIcon={MapPin}
        hint="Both fields are required."
      />
    </Panel>
  );
}

function CareerStep({
  role,
  onRole,
  domain,
  onDomain,
  presetId,
  onPreset,
  errors,
  attempted,
  onContinue,
  onBack,
}: {
  role: string;
  onRole: (value: string) => void;
  domain: string;
  onDomain: (value: string) => void;
  presetId: string | null;
  onPreset: (id: string) => void;
  errors: CareerErrors;
  attempted: boolean;
  onContinue: () => void;
  onBack: () => void;
}) {
  const active = CAREER_PRESETS.find((preset) => preset.id === presetId) ?? null;
  const signal = active ?? null;
  return (
    <Panel
      eyebrow="Step 03 · Target career"
      title="What role are you calibrating for?"
      description="Your target role and industry determine which skills the market weights hardest. Pick a live-signal preset or type any role — the demand model adapts either way."
      icon={Target}
      aside={
        active ? (
          <div className="flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/5 px-3 py-1.5 text-[11px] text-cyan-200">
            <Activity className="h-3.5 w-3.5" />
            {inrCompact(active.openings)} national postings
          </div>
        ) : null
      }
    >
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {CAREER_PRESETS.map((preset) => {
            const isActive = preset.id === presetId;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onPreset(preset.id)}
                aria-pressed={isActive}
                className={cx(
                  "group relative overflow-hidden rounded-xl border p-4 text-left transition-all duration-300",
                  isActive
                    ? "border-cyan-400/50 bg-cyan-400/[0.06] shadow-[0_0_32px_-16px_rgba(34,211,238,0.9)]"
                    : "border-slate-800 bg-slate-950/40 hover:-translate-y-0.5 hover:border-slate-700",
                )}
              >
                {isActive ? (
                  <span className="absolute right-3 top-3">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  </span>
                ) : null}
                <p className="pr-6 text-sm font-semibold tracking-tight text-slate-100">
                  {preset.role}
                </p>
                <p className="mt-0.5 text-[11px] text-cyan-400/80">{preset.domain}</p>
                <p className="mt-2.5 text-[11px] leading-relaxed text-slate-500">{preset.blurb}</p>
                <div className="mt-3 flex items-center gap-3 border-t border-slate-800/80 pt-2.5 text-[11px]">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Rocket className="h-3 w-3" />
                    {inrCompact(preset.openings)}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <TrendingUp className="h-3 w-3" />
                    {preset.spread}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-5">
            <Field
              id="ss-role"
              label="Target role"
              icon={Search}
              value={role}
              onChange={onRole}
              error={attempted ? (errors.role ?? null) : null}
              placeholder="Data Scientist"
              maxLength={64}
              list="ss-role-options"
              hint="Free text allowed — presets just pre-fill the highest-signal defaults."
            />
            <datalist id="ss-role-options">
              {CAREER_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.role} />
              ))}
            </datalist>

            <div className="space-y-1.5">
              <label
                htmlFor="ss-domain"
                className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-400"
              >
                <Compass className="h-3.5 w-3.5 text-slate-500" />
                Industry domain
              </label>
              <div className="relative">
                <select
                  id="ss-domain"
                  value={domain}
                  onChange={(event) => onDomain(event.target.value)}
                  aria-invalid={Boolean(attempted && errors.domain)}
                  className={cx(
                    "w-full appearance-none rounded-xl border bg-slate-950/60 px-3.5 py-2.5 text-sm text-slate-100 transition-all duration-200 outline-none focus:ring-2 focus:ring-cyan-400/40",
                    attempted && errors.domain
                      ? "border-rose-500/60 focus:border-rose-400 focus:ring-rose-400/30"
                      : "border-slate-800 hover:border-slate-700 focus:border-cyan-400/60",
                  )}
                >
                  <option value="">Select a domain…</option>
                  {INDUSTRIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-500" />
              </div>
              {attempted && errors.domain ? (
                <p className="flex items-center gap-1.5 text-xs text-rose-400">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  {errors.domain}
                </p>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
            {signal ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Live role signal
                  </p>
                  <Chip icon={Activity}>30d window</Chip>
                </div>
                <p className="mt-3 text-lg font-semibold tracking-tight text-slate-50">
                  {signal.role}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">{signal.blurb}</p>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xl font-semibold tabular-nums tracking-tight text-cyan-300">
                      {inrCompact(signal.openings)}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">postings</p>
                  </div>
                  <div>
                    <p className="text-xl font-semibold tabular-nums tracking-tight text-blue-300">
                      {signal.median.toFixed(1)}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">median LPA</p>
                  </div>
                  <div>
                    <p className="text-xl font-semibold tabular-nums tracking-tight text-slate-200">
                      17
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">clusters</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 border-t border-slate-800/80 pt-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Demand modifiers applied
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(signal.bias)
                      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
                      .slice(0, 5)
                      .map(([key, value]) => (
                        <Chip key={key} icon={value >= 0 ? TrendingUp : Minus}>
                          {SKILL_BY_KEY[key as SkillKey]?.short ?? key}{" "}
                          <span className={value >= 0 ? "text-emerald-400" : "text-rose-400"}>
                            {value >= 0 ? "+" : ""}
                            {value}
                          </span>
                        </Chip>
                      ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                <Target className="h-7 w-7 text-slate-700" />
                <p className="mt-3 text-sm text-slate-400">No role signal yet</p>
                <p className="mt-1 max-w-[30ch] text-[11px] leading-relaxed text-slate-600">
                  Choose a preset above or type your target role. The demand model will weight every
                  competency axis for it.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <StepFooter
        onBack={onBack}
        onContinue={onContinue}
        continueLabel="Set target role & continue"
        continueIcon={Target}
        hint="Role and domain are both required."
      />
    </Panel>
  );
}

function SkillsStep({
  skills,
  market,
  stats,
  calibrationId,
  onCalibration,
  onSyncFromMarket,
  onSkillChange,
  onReset,
  onContinue,
  onBack,
}: {
  skills: Record<SkillKey, number>;
  market: MarketRow[];
  stats: ReportStats;
  calibrationId: CalibrationId;
  onCalibration: (id: CalibrationId) => void;
  onSyncFromMarket: () => void;
  onSkillChange: (key: SkillKey, value: number) => void;
  onReset: () => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const demandByKey = useMemo(() => {
    const map = {} as Record<SkillKey, number>;
    market.forEach((row) => {
      map[row.key] = row.market;
    });
    return map;
  }, [market]);

  return (
    <Panel
      eyebrow="Step 04 · Calibration"
      title="Calibrate your baseline honestly"
      description="Drag each axis to where you would be comfortable in a real interview today. Inflate this and the roadmap will lie to you — the market tick marks show what your local employers actually ask for."
      icon={Sliders}
      aside={
        <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/60 px-3 py-1.5 text-[11px] text-slate-400">
          <Gauge className="h-3.5 w-3.5 text-cyan-400" />
          <span className="tabular-nums text-cyan-300">{stats.coverage}%</span> market coverage
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)]">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Calibration profile
              </p>
              <span className="text-[11px] text-slate-500">
                self average{" "}
                <span className="font-semibold tabular-nums text-slate-200">{stats.avgYou}</span> ·
                market average{" "}
                <span className="font-semibold tabular-nums text-blue-300">{stats.avgMarket}</span>
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {CALIBRATION_PRESETS.map((preset) => (
                <Chip
                  key={preset.id}
                  active={calibrationId === preset.id}
                  onClick={() => onCalibration(preset.id)}
                  icon={User}
                >
                  {preset.label}
                </Chip>
              ))}
              <Chip
                active={calibrationId === "market"}
                onClick={onSyncFromMarket}
                icon={Sigma}
              >
                Auto-calibrate from market
              </Chip>
              {calibrationId === "custom" ? <Chip active icon={Sigma}>Custom</Chip> : null}
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
              {CALIBRATION_PRESETS.find((preset) => preset.id === calibrationId)?.note ??
                "Your own numbers, or a market-informed starting point you can edit."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <GhostButton onClick={onReset} icon={RefreshCw}>
                Reset to defaults
              </GhostButton>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Live coverage
              </p>
              <span className="text-xl font-semibold tabular-nums tracking-tight text-cyan-300">
                {stats.coverage}%
              </span>
            </div>
            <MeterBar value={stats.coverage} className="mt-3" />
            <div className="mt-4 space-y-2.5">
              {[
                { label: "Critical gaps", value: `${stats.critical}`, tone: "rose" as const },
                { label: "High-priority gaps", value: `${stats.high}`, tone: "amber" as const },
                { label: "Points to close", value: `${stats.totalGap}`, tone: "cyan" as const },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">{row.label}</span>
                  <span className="font-semibold tabular-nums text-slate-200">{row.value}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 border-t border-slate-800/80 pt-3 text-[11px] leading-relaxed text-slate-500">
              Coverage is demand-weighted: closing a gap in a high-demand axis moves the number far
              more than closing an axis nobody is hiring for.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {SKILL_AXES.map((axis) => (
            <SkillSlider
              key={axis.key}
              axis={axis}
              value={skills[axis.key]}
              market={demandByKey[axis.key]}
              onChange={(value) => onSkillChange(axis.key, value)}
            />
          ))}
        </div>
      </div>

      <StepFooter
        onBack={onBack}
        onContinue={onContinue}
        continueLabel="Run the market engine"
        continueIcon={Terminal}
        hint="Your calibration is stored in-session only."
      />
    </Panel>
  );
}

function TerminalStep({
  logs,
  progress,
  elapsed,
  done,
  total,
  bodyRef,
  onCopy,
  onSkip,
  onBack,
}: {
  logs: LogLine[];
  progress: number;
  elapsed: number;
  done: boolean;
  total: number;
  bodyRef: RefObject<HTMLDivElement | null>;
  onCopy: () => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  return (
    <Panel
      eyebrow="Step 05 · Engine run"
      title="SerpApi → Google Gemini AI → Skill Gap Analysis"
      description="Watch the live analysis pipeline. Each step connects to SerpApi for job data and Google Gemini for AI-powered skill gap analysis."
      icon={Terminal}
      aside={
        <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/60 px-3 py-1.5 text-[11px] text-slate-400">
          <LiveDot />
          {done ? "pipeline complete" : "pipeline running"}
        </div>
      }
    >
      <div className="space-y-5">
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-black p-4 shadow-[0_0_60px_-30px_rgba(34,211,238,0.7)]">
          <div className="mb-3 flex items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
              </span>
              <span className="font-mono text-[11px] text-slate-500">
                skillsetu-engine · zsh · serpapi-lmi
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] tabular-nums text-slate-500">
                {elapsed.toFixed(1)}s
              </span>
              <button
                type="button"
                onClick={onCopy}
                disabled={logs.length === 0}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-800 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-slate-400 transition-colors hover:border-cyan-400/40 hover:text-cyan-300 disabled:opacity-40"
              >
                <Copy className="h-3 w-3" />
                copy
              </button>
            </div>
          </div>

          <div
            ref={bodyRef}
            aria-live="polite"
            aria-atomic="false"
            className="h-[340px] overflow-y-auto pr-2 font-mono text-[11.5px] leading-[1.75] sm:h-[380px] sm:text-xs"
          >
            {logs.length === 0 ? (
              <p className="text-slate-600">
                <span className="text-cyan-400/70">$</span> awaiting handshake with serpapi client…
              </p>
            ) : (
              logs.map((line) => (
                <p
                  key={line.id}
                  className={cx(
                    "flex gap-2",
                    line.level === "cmd" ? "text-cyan-300" : "text-slate-500",
                    line.level === "ok" ? "text-emerald-400/90" : undefined,
                    line.level === "warn" ? "text-amber-300" : undefined,
                  )}
                >
                  <span className="select-none text-slate-700">
                    {line.level === "ok" ? "✓" : line.level === "warn" ? "!" : line.level === "cmd" ? ">" : " "}
                  </span>
                  <span className="min-w-0 break-words">{line.text}</span>
                </p>
              ))
            )}
            {!done ? (
              <p className="flex gap-2 text-slate-500">
                <span className="select-none text-cyan-400/70">$</span>
                <span className="ss-caret inline-block h-3.5 w-2 translate-y-0.5 bg-cyan-400" />
              </p>
            ) : (
              <p className="flex gap-2 text-cyan-300">
                <span className="select-none text-emerald-400">✓</span>
                <span>
                  Pipeline finished in {elapsed.toFixed(1)}s — opening Skill Gap Radar
                  <span className="ss-caret ml-1 inline-block h-3.5 w-2 translate-y-0.5 bg-cyan-400" />
                </span>
              </p>
            )}
          </div>

          <div className="mt-3 flex items-center gap-3 border-t border-slate-800/80 pt-3">
            <MeterBar value={progress} className="flex-1" />
            <span className="font-mono text-[11px] tabular-nums text-cyan-400">
              {progress}% · {logs.length}/{total} stages
            </span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          {[
            { label: "Postings parsed", value: "1,284", icon: Server },
            { label: "Skill tokens", value: "3,912", icon: Sigma },
            { label: "Vectors built", value: "8,416", icon: Cpu },
            { label: "Clusters", value: "17", icon: Network },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="rounded-xl border border-slate-800 bg-slate-950/40 p-3.5"
              >
                <Icon className="h-4 w-4 text-cyan-400" />
                <p className="mt-2 text-lg font-semibold tabular-nums tracking-tight text-slate-50">
                  {card.value}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">{card.label}</p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-[11px] text-slate-500">
            <Info className="h-3.5 w-3.5 shrink-0" />
            Live analysis powered by SerpApi google_jobs and Google Gemini AI.
            
          </p>
          <GhostButton onClick={onSkip} icon={ArrowRight} disabled={done}>
            {done ? "Radar loading…" : "Skip to radar"}
          </GhostButton>
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse items-stretch justify-between gap-3 border-t border-slate-800/80 pt-5 sm:flex-row sm:items-center">
        <GhostButton onClick={onBack} icon={ArrowLeft}>
          Back
        </GhostButton>
        <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <Info className="h-3.5 w-3.5 shrink-0" />
          The engine advances you to the radar automatically when every stage finishes.
        </p>
      </div>
    </Panel>
  );
}

type TipEntry = {
  name?: string;
  value?: number;
  dataKey?: string | number;
  payload?: Record<string, unknown>;
};

function RadarTip({ active, payload }: { active?: boolean; payload?: TipEntry[] }) {
  if (!active || !payload || payload.length === 0) return null;
  const axis = String(payload[0]?.payload?.axis ?? "");
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950/95 px-3.5 py-2.5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{axis}</p>
      <div className="mt-2 space-y-1.5">
        {payload.map((entry) => (
          <div key={String(entry.dataKey)} className="flex items-center gap-2 text-xs">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: entry.dataKey === "you" ? "#22d3ee" : "#60a5fa" }}
            />
            <span className="flex-1 text-slate-400">{entry.name}</span>
            <span className="font-semibold tabular-nums text-slate-100">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GapTip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value?: number; payload?: { gap?: number; priority?: Priority } }[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0]?.payload;
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950/95 px-3.5 py-2.5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md">
      <p className="text-xs font-semibold text-slate-100">{label}</p>
      <p className="mt-1 text-[11px] text-slate-400">
        Gap{" "}
        <span className="font-semibold tabular-nums text-cyan-300">{row?.gap ?? 0}</span> points to
        close
      </p>
      {row?.priority ? (
        <p className="mt-0.5 text-[11px] text-slate-500">Priority: {row.priority}</p>
      ) : null}
    </div>
  );
}

function RadarStep({
  market,
  radarData,
  stats,
  zone,
  role,
  aiReport,
  onRerun,
  onContinue,
  onBack,
}: {
  market: MarketRow[];
  radarData: { axis: string; you: number; market: number }[];
  stats: ReportStats;
  zone: Zone | undefined;
  role: string;
  aiReport?: any;
  onRerun: () => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const ranked = useMemo(() => market.slice().sort((a, b) => b.gap - a.gap), [market]);
  const strengths = useMemo(
    () => market.filter((row) => row.gap <= 0).sort((a, b) => b.you - a.you),
    [market],
  );
  const cityLabel = zone ? `${zone.city} · ${zone.region}` : "National median";

  return (
    <Panel
      eyebrow="Step 06 · Skill gap radar"
      title="Your capability versus live market demand"
      description="Cyan is what you can do today. Blue is what employers in your zone are asking for on the SerpApi index. The distance between the two is the roadmap."
      icon={RadarIcon}
      aside={
        <div className="flex flex-wrap items-center gap-2">
          <Chip icon={MapPin}>{cityLabel}</Chip>
          <Chip icon={Target}>{role || "Open role"}</Chip>
        </div>
      }
    >
      <div className="space-y-6">
        {aiReport && (
          <div className="rounded-xl border border-cyan-500/40 bg-cyan-950/30 p-4 shadow-[0_0_15px_-3px_rgba(34,211,238,0.15)]">
            <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
              <Sparkles className="h-4 w-4" />
              Live AI Analysis from Google Gemini
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-cyan-100/80">
              Market Readiness: <strong className="text-white">{aiReport.readinessLevel}</strong>
              {aiReport.matchPercentage && <> · Match: <strong className="text-white">{aiReport.matchPercentage}%</strong></>}
              {aiReport.missingSkills?.length > 0 && <> · Focus on: <strong className="text-white">{aiReport.missingSkills.join(", ")}</strong></>}
            </p>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            icon={Crosshair}
            label="Coverage"
            value={`${stats.coverage}%`}
            sub="demand-weighted skill coverage"
            accent="cyan"
          />
          <StatTile
            icon={Triangle}
            label="Critical gaps"
            value={`${stats.critical}`}
            sub={`${stats.high} more high priority`}
            accent="rose"
          />
          <StatTile
            icon={TrendingUp}
            label="Projected CTC"
            value={`${stats.projected.toFixed(1)}`}
            sub="INR LPA at current calibration"
            accent="blue"
          />
          <StatTile
            icon={Sigma}
            label="Confidence"
            value={`${stats.confidence}%`}
            sub="model confidence in the gap model"
            accent="emerald"
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Competency radar · 8 axes
                </p>
                <p className="mt-1 text-xs text-slate-500">Hover any vertex to read exact scores.</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span className="h-2.5 w-2.5 rounded-sm bg-cyan-400/80" />
                  Your baseline
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span className="h-2.5 w-2.5 rounded-sm bg-blue-400/80" />
                  Market demand
                </span>
              </div>
            </div>
            <div className="mt-2 h-[340px] w-full sm:h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="72%" margin={{ top: 12, right: 8, bottom: 8, left: 8 }}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis
                    dataKey="axis"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tickCount={5}
                    axisLine={false}
                    tick={{ fill: "#64748b", fontSize: 9 }}
                  />
                  <RadarSeries
                    name="Your baseline"
                    dataKey="you"
                    stroke="#22d3ee"
                    strokeWidth={2}
                    fill="#22d3ee"
                    fillOpacity={0.26}
                    dot={{ r: 3, fill: "#22d3ee", strokeWidth: 0 }}
                    isAnimationActive
                    animationDuration={900}
                  />
                  <RadarSeries
                    name="Market demand"
                    dataKey="market"
                    stroke="#60a5fa"
                    strokeWidth={2}
                    strokeDasharray="5 4"
                    fill="#3b82f6"
                    fillOpacity={0.16}
                    dot={{ r: 3, fill: "#60a5fa", strokeWidth: 0 }}
                    isAnimationActive
                    animationDuration={900}
                  />
                  <Tooltip content={<RadarTip />} cursor={false} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Where the gap hurts most
              </p>
              <ul className="mt-4 space-y-3.5">
                {ranked.slice(0, 4).map((row) => (
                  <li key={row.key}>
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="flex items-center gap-2 text-slate-200">
                        <GapAxisIcon skillKey={row.key} />
                        {row.axisFull}
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="tabular-nums text-slate-400">
                          {row.you} → {row.market}
                        </span>
                        <span
                          className={cx(
                            "w-12 rounded border px-1.5 py-0.5 text-center text-[10px] font-medium",
                            PRIORITY_STYLE[row.priority],
                          )}
                        >
                          {row.gap > 0 ? `+${row.gap}` : row.gap}
                        </span>
                      </span>
                    </div>
                    <MeterBar
                      value={row.you}
                      tone={row.priority === "Critical" ? "rose" : "cyan"}
                      className="mt-2"
                    />
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Already market-ready
              </p>
              {strengths.length > 0 ? (
                <div className="mt-3.5 flex flex-wrap gap-2">
                  {strengths.map((row) => (
                    <Chip key={row.key} icon={CheckCircle2}>
                      {row.axisFull}{" "}
                      <span className="font-mono tabular-nums text-slate-500">+{Math.abs(row.gap)}</span>
                    </Chip>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
                  No axis is fully at parity yet. Closing the top two gaps will move you there within
                  four weeks.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                How to read this
              </p>
              <ul className="mt-3 space-y-2.5 text-[11px] leading-relaxed text-slate-400">
                {[
                  "Cyan outside blue means employers are already paying for that skill in you.",
                  "Blue outside cyan is a demand gap — a concrete, priced opportunity.",
                  "Scores are 0–100 competency estimates, recalculated on every calibration change.",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400/70" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse items-stretch justify-between gap-3 border-t border-slate-800/80 pt-5 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-3">
          <GhostButton onClick={onBack} icon={ArrowLeft}>
            Back
          </GhostButton>
          <GhostButton onClick={onRerun} icon={RefreshCw}>
            Re-run the engine
          </GhostButton>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <PrimaryButton onClick={onContinue} icon={GraduationCap}>
            Build my roadmap
          </PrimaryButton>
          <p className="text-[11px] text-slate-500">
            {stats.totalGap} total points to close across 8 axes.
          </p>
        </div>
      </div>
    </Panel>
  );
}

function GapAxisIcon({ skillKey }: { skillKey: SkillKey }) {
  const Icon = SKILL_BY_KEY[skillKey]?.icon ?? Sigma;
  return <Icon className="h-3.5 w-3.5 text-cyan-400" />;
}

function RoadmapStep({
  market,
  gapChartData,
  roadmap,
  stats,
  onRecalibrate,
  onContinue,
  onBack,
}: {
  market: MarketRow[];
  gapChartData: { axis: string; gap: number; priority: Priority }[];
  roadmap: RoadmapWeek[];
  stats: ReportStats;
  onRecalibrate: () => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const hours = roadmap.length * 6;
  return (
    <Panel
      eyebrow="Step 07 · Roadmap"
      title="A sequenced plan, not a wish list"
      description="Ten weeks, five focus skills, ordered by return on effort: biggest demand gap first, each week split into diagnosis and shipping."
      icon={GraduationCap}
      aside={
        <div className="flex flex-wrap items-center gap-2">
          <Chip icon={Clock}>~{hours}h total</Chip>
          <Chip icon={GraduationCap}>10 weeks</Chip>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 sm:p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Skill delta breakdown
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Bars left of zero are surpluses, right of zero are gaps to close.
            </p>
            <div className="mt-2 h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gapChartData} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
                  <CartesianGrid stroke="#1e293b" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[-30, 45]}
                    stroke="#334155"
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="axis"
                    width={92}
                    stroke="#334155"
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<GapTip />} cursor={{ fill: "rgba(34,211,238,0.06)" }} />
                  <Bar dataKey="gap" radius={[4, 4, 4, 4]} maxBarSize={18}>
                    {gapChartData.map((row) => (
                      <Cell
                        key={row.axis}
                        fill={
                          row.gap >= 25
                            ? "#f43f5e"
                            : row.gap >= 12
                              ? "#f59e0b"
                              : row.gap > 0
                                ? "#38bdf8"
                                : "#10b981"
                        }
                        fillOpacity={0.85}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {market
              .slice()
              .sort((a, b) => b.gap - a.gap)
              .map((row) => {
                const progress = Math.round((Math.min(row.you, row.market) / row.market) * 100);
                return (
                  <div
                    key={row.key}
                    className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 transition-colors duration-200 hover:border-slate-700"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium tracking-tight text-slate-100">
                        {row.axisFull}
                      </p>
                      <span
                        className={cx(
                          "shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium",
                          PRIORITY_STYLE[row.priority],
                        )}
                      >
                        {row.priority}
                      </span>
                    </div>
                    <div className="mt-3 flex items-end justify-between gap-2">
                      <div>
                        <p className="text-2xl font-semibold tabular-nums tracking-tight text-slate-50">
                          {row.you}
                          <span className="text-sm text-slate-500"> / {row.market}</span>
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500">
                          self / market
                        </p>
                      </div>
                      <p
                        className={cx(
                          "text-sm font-semibold tabular-nums",
                          row.gap > 0 ? "text-amber-300" : "text-emerald-300",
                        )}
                      >
                        {row.gap > 0 ? `+${row.gap}` : row.gap}
                      </p>
                    </div>
                    <MeterBar value={progress} className="mt-3" />
                    <p className="mt-1.5 text-[11px] text-slate-500">
                      {progress}% of market parity on this axis
                    </p>
                  </div>
                );
              })}
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Week-by-week roadmap
            </p>
            <GhostButton onClick={onRecalibrate} icon={Sliders}>
              Recalibrate
            </GhostButton>
          </div>
          <ol className="relative mt-4 space-y-3 border-l border-slate-800 pl-5">
            {roadmap.map((week) => (
              <li key={week.id} className="relative">
                <span
                  className={cx(
                    "absolute -left-[26px] top-4 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 bg-slate-950",
                    week.phase === "Phase 1" ? "border-cyan-400" : "border-blue-500",
                  )}
                >
                  <span
                    className={cx(
                      "h-1.5 w-1.5 rounded-full",
                      week.phase === "Phase 1" ? "bg-cyan-400" : "bg-blue-500",
                    )}
                  />
                </span>
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 transition-colors duration-200 hover:border-slate-700">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md border border-slate-700 bg-slate-950/60 px-2 py-0.5 font-mono text-[10px] tabular-nums text-cyan-300">
                        Week {week.week}
                      </span>
                      <span
                        className={cx(
                          "rounded-md border px-2 py-0.5 text-[10px] font-medium",
                          week.phase === "Phase 1"
                            ? "border-cyan-400/30 bg-cyan-400/5 text-cyan-300"
                            : "border-blue-500/30 bg-blue-500/5 text-blue-300",
                        )}
                      >
                        {week.phase}
                      </span>
                      <span className="text-[11px] text-slate-500">{week.skillFull}</span>
                    </div>
                    <span className="flex items-center gap-1.5 text-[11px] tabular-nums text-slate-400">
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                      {week.start} → {week.target}
                    </span>
                  </div>
                  <p className="mt-2.5 text-sm font-semibold tracking-tight text-slate-50">
                    {week.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{week.objective}</p>
                  <ul className="mt-3 space-y-1.5">
                    {week.tasks.map((task) => (
                      <li key={task} className="flex gap-2 text-[11px] leading-relaxed text-slate-300">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400/70" />
                        {task}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-800/80 pt-3">
                    <Chip icon={CircleCheckBig}>{week.outcome}</Chip>
                    {week.resources.map((resource) => (
                      <Chip key={resource.title} icon={BookOpen}>
                        {resource.title} · {resource.meta}
                      </Chip>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex items-start gap-2.5 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
          <Sigma className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
          <p className="text-[11px] leading-relaxed text-slate-400">
            Finishing this plan lifts coverage from {stats.coverage}% to a projected{" "}
            {Math.min(99, Math.round(stats.coverage + stats.totalGap * 0.55))}%, worth roughly{" "}
            {((stats.totalGap * 0.55 * stats.projected) / Math.max(stats.totalGap, 1)).toFixed(1)} LPA
            of additional annual compensation at your zone multiplier.
          </p>
        </div>
      </div>

      <StepFooter
        onBack={onBack}
        onContinue={onContinue}
        continueLabel="Export my credential"
        continueIcon={BadgeCheck}
        hint="One click, standards-compliant Roadmap Data."
      />
    </Panel>
  );
}

function CredentialStep({
  credential,
  exportStage,
  exportStep,
  stats,
  role,
  pin,
  identity,
  onExport,
  onDownload,
  onCopy,
  onRemint,
  onBack,
  onRestart,
}: {
  credential: Credential;
  exportStage: ExportStage;
  exportStep: number;
  stats: ReportStats;
  role: string;
  pin: string;
  identity: string;
  onExport: () => void;
  onDownload: () => void;
  onCopy: () => void;
  onRemint: () => void;
  onBack: () => void;
  onRestart: () => void;
}) {
  const serialized = useMemo(() => JSON.stringify(credential, null, 2), [credential]);
  const sealed = exportStage === "sealed";
  const signing = exportStage === "signing";
  const shortId = credential.id.replace("urn:uuid:", "").slice(0, 8);

  return (
    <Panel
      eyebrow="Step 08 · Credential"
      title="Export a verifiable Career Roadmap credential"
      description="A signed Roadmap Data envelope that any Skill-Setu-compatible verifier can validate. Attach it to a portfolio, a job application, or a Skill Setu profile and re-verify it later."
      icon={BadgeCheck}
      aside={
        <div className="flex flex-wrap items-center gap-2">
          <Chip icon={FileCheck2}>OpenBadgeCredential</Chip>
          <Chip icon={ShieldCheck}>Ed25519Signature2018</Chip>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
          <div
            className={cx(
              "relative overflow-hidden rounded-2xl border p-5 transition-colors duration-500",
              sealed ? "border-emerald-500/40 bg-emerald-500/[0.05]" : "border-slate-800 bg-slate-950/40",
            )}
          >
            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="relative flex items-start gap-4">
              <span
                className={cx(
                  "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border transition-colors duration-500",
                  sealed
                    ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                    : "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
                )}
              >
                {sealed ? <CheckCircle2 className="h-7 w-7" /> : <Award className="h-7 w-7" />}
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {sealed ? "Credential sealed" : "Credential drafted"}
                </p>
                <p className="mt-1.5 text-lg font-semibold tracking-tight text-slate-50">
                  {credential.name}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                  {credential.description}
                </p>
              </div>
            </div>

            <div className="relative mt-5 grid gap-3 sm:grid-cols-2">
              {[
                { label: "Credential ID", value: `urn:uuid:${shortId}…` },
                { label: "Issued at", value: new Date(credential.validFrom).toUTCString() },
                { label: "Schema", value: credential.credentialSchema.id.split("/").slice(-2).join("/") },
                { label: "Holder", value: identity || "unnamed holder" },
              ].map((row) => (
                <div key={row.label} className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">{row.label}</p>
                  <p className="mt-1 truncate font-mono text-[11px] text-slate-200">{row.value}</p>
                </div>
              ))}
            </div>

            {signing ? (
              <div className="relative mt-5 space-y-2.5 rounded-xl border border-cyan-400/30 bg-cyan-400/[0.04] p-4">
                {EXPORT_STAGES.map((stage, index) => {
                  const state = exportStep > index ? "done" : exportStep === index ? "active" : "pending";
                  return (
                    <p key={stage} className="flex items-center gap-2 text-[11px]">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-700">
                        {state === "done" ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : state === "active" ? (
                          <RefreshCw className="h-2.5 w-2.5 animate-spin text-cyan-400" />
                        ) : (
                          <span className="h-1 w-1 rounded-full bg-slate-600" />
                        )}
                      </span>
                      <span
                        className={cx(
                          "font-mono",
                          state === "done"
                            ? "text-slate-500 line-through"
                            : state === "active"
                              ? "text-cyan-300"
                              : "text-slate-600",
                        )}
                      >
                        {stage}
                      </span>
                    </p>
                  );
                })}
                <MeterBar value={(exportStep / EXPORT_STAGES.length) * 100} className="mt-3" />
              </div>
            ) : null}

            {sealed ? (
              <div className="relative mt-5 flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] p-4">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <div>
                  <p className="text-xs font-semibold text-emerald-200">
                    Envelope verified locally against the Career Roadmap context
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                    Secure Verification attached. The Roadmap Data is standards-compliant and can be verified
                    by any Skill-Setu-compatible badge platform. Your roadmap is generated using
                    live market data from SerpApi and AI analysis from Google Gemini.
                  </p>
                </div>
              </div>
            ) : null}

            <div className="relative mt-5 flex flex-wrap gap-2.5">
              <PrimaryButton
                onClick={onExport}
                icon={sealed ? CheckCircle2 : ShieldCheck}
                disabled={signing || sealed}
              >
                {sealed ? "Credential exported" : signing ? "Sealing credential…" : "Export Career Roadmap credential"}
              </PrimaryButton>
              <GhostButton onClick={onDownload} icon={Download} disabled={signing}>
                Download .jsonld
              </GhostButton>
              <GhostButton onClick={onCopy} icon={Copy} disabled={signing}>
                Copy Roadmap Data
              </GhostButton>
              <GhostButton onClick={onRemint} icon={RefreshCw} disabled={signing}>
                Re-mint
              </GhostButton>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Report summary
              </p>
              <dl className="mt-3.5 space-y-2.5 text-[11px]">
                {[
                  { label: "Target role", value: role || "Open role" },
                  { label: "Market zone", value: pin || "not set" },
                  { label: "Axes benchmarked", value: "8" },
                  { label: "Market coverage", value: `${stats.coverage}%` },
                  { label: "Critical gaps", value: `${stats.critical}` },
                  { label: "Projected CTC", value: `${stats.projected.toFixed(1)} LPA` },
                  { label: "Credentials earned", value: "3 credits" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-3">
                    <dt className="text-slate-400">{row.label}</dt>
                    <dd className="truncate font-semibold tabular-nums text-slate-100">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Where this credential works
              </p>
              <ul className="mt-3 space-y-2.5 text-[11px] leading-relaxed text-slate-400">
                {[
                  "Any Open Badges 2.0/3.0 platform that accepts Roadmap Data credentials.",
                  "Embedded in your portfolio as a linked-data script tag or downloaded file.",
                  "Re-verifiable: the credential id and schema id never change on export.",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400/70" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Roadmap Data preview
            </p>
            <span className="font-mono text-[11px] tabular-nums text-slate-500">
              {(serialized.length / 1024).toFixed(1)} KB
            </span>
          </div>
          <pre className="mt-3 max-h-[420px] overflow-auto rounded-2xl border border-slate-800 bg-black p-4 font-mono text-[11px] leading-relaxed text-cyan-200/85 shadow-[0_0_50px_-30px_rgba(34,211,238,0.7)]">
            {serialized}
          </pre>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-800/80 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2.5">
            <GhostButton onClick={onBack} icon={ArrowLeft}>
              Back to roadmap
            </GhostButton>
            <GhostButton onClick={onRestart} icon={RefreshCw}>
              Start over
            </GhostButton>
          </div>
          <Chip icon={ShieldCheck}>
            Personalized Growth Plan · Career Roadmap · context v3p0
          </Chip>
        </div>
      </div>
    </Panel>
  );
}

