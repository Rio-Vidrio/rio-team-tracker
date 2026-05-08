import { useState } from "react";

// ─── TYPES ──────────────────────────────────────────────────────────────────

interface Agent {
  name: string;
  handle: string;
  role?: string;
  isLeader?: boolean;
}

// ─── TEAM ───────────────────────────────────────────────────────────────────

const RIO: Agent = {
  name: "Rio Vidrio",
  handle: "rio.vidrio",
  role: "Team Leader",
  isLeader: true,
};

const TEAM: Agent[] = [
  { name: "Brisa Roman", handle: "brisasellsaz" },
  { name: "Xochilt Mandujano", handle: "xorealtor.az" },
  { name: "Mariel Palafox Leon", handle: "mariel.palafox.leon.realtor" },
  { name: "Jilario Leon", handle: "jilarioleon" },
  { name: "Anthony Gonzales", handle: "antsellshomes_" },
  { name: "Liv Clarke", handle: "azrealty.livclarke" },
  { name: "Britni Christenson", handle: "britni.christenson.azrealtor" },
  { name: "Mike Montesano", handle: "mikemhomes" },
  { name: "Giovanni Sotelo", handle: "gsotelo4" },
  { name: "Jon Sheets", handle: "jonbsheets" },
  { name: "Egon Von P", handle: "egonvon.p" },
  { name: "Ana Vega Gonzalez", handle: "homeswithana2.0" },
  { name: "Amanda Montano", handle: "az_realtor_montano" },
  { name: "Osmany Acosta", handle: "osmanyazrealtor" },
  { name: "Iris", handle: "iris_placeholder" },
];

const igUrl = (handle: string) => `https://www.instagram.com/${handle}/`;

// Avatar resolution chain:
// 1. /agents/{handle}.jpg (local file you can drop in)
// 2. /api/avatar?handle={handle} (Vercel function that scrapes IG)
// 3. gradient initial fallback (always works)
const localAvatar = (handle: string) => `/agents/${handle}.jpg`;
const apiAvatar = (handle: string) => `/api/avatar?handle=${encodeURIComponent(handle)}`;

function hueFromHandle(handle: string): number {
  let h = 0;
  for (let i = 0; i < handle.length; i++) h = (h * 31 + handle.charCodeAt(i)) >>> 0;
  return h % 360;
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}

function gradientAvatar(name: string, handle: string): string {
  const hue = hueFromHandle(handle);
  const c1 = `hsl(${hue}, 65%, 30%)`;
  const c2 = `hsl(${(hue + 40) % 360}, 70%, 18%)`;
  const accent = `hsl(${(hue + 180) % 360}, 80%, 60%)`;
  const init = initials(name);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='${c1}'/>
        <stop offset='1' stop-color='${c2}'/>
      </linearGradient>
      <radialGradient id='glow' cx='30%' cy='30%' r='60%'>
        <stop offset='0' stop-color='${accent}' stop-opacity='0.45'/>
        <stop offset='1' stop-color='${accent}' stop-opacity='0'/>
      </radialGradient>
    </defs>
    <rect width='200' height='200' fill='url(%23g)'/>
    <rect width='200' height='200' fill='url(%23glow)'/>
    <text x='50%' y='54%' text-anchor='middle' dominant-baseline='middle'
      font-family='Inter, system-ui, sans-serif' font-size='84' font-weight='800' fill='white'
      letter-spacing='-2'>${init}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${svg.replace(/\n\s*/g, "").replace(/#/g, "%23")}`;
}

// Smart Avatar component — tries local → API → gradient fallback
function Avatar({ agent, className }: { agent: Agent; className?: string }) {
  return (
    <img
      src={localAvatar(agent.handle)}
      alt={agent.name}
      loading="lazy"
      className={className}
      onError={(e) => {
        const img = e.currentTarget as HTMLImageElement;
        const stage = img.dataset.stage || "0";
        if (stage === "0") {
          img.dataset.stage = "1";
          img.src = apiAvatar(agent.handle);
        } else if (stage === "1") {
          img.dataset.stage = "2";
          img.src = gradientAvatar(agent.name, agent.handle);
        }
      }}
    />
  );
}

// ─── COMPONENT ──────────────────────────────────────────────────────────────

export default function App() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Ambient gradient backdrop */}
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-rio/20 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-red-900/30 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[600px] rounded-full bg-rio/10 blur-[120px]" />
      </div>

      {/* Subtle noise texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative z-10">
        {/* ─── HEADER ────────────────────────────────────────── */}
        <header className="border-b border-white/10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
            <img
              src="/rio-logo-white.png"
              alt="The Rio Group"
              className="h-9 md:h-11 w-auto"
            />
            <img
              src="/az-logo-white.png"
              alt="AZ & Associates"
              className="h-8 md:h-10 w-auto opacity-80"
            />
          </div>
        </header>

        {/* ─── HERO ──────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 md:px-10 pt-14 md:pt-20 pb-10 md:pb-14">
          <p className="text-rio text-[10px] md:text-xs tracking-[0.4em] uppercase font-semibold mb-5">
            The Rio Group · Est. 2016
          </p>
          <h1 className="font-bold text-white tracking-tight leading-[0.95]" style={{ fontSize: "clamp(2.5rem, 7vw, 6rem)" }}>
            Meet the
            <br />
            <span className="italic font-light text-white/60">team that</span>
            <br />
            <span className="text-rio">moves Arizona.</span>
          </h1>
          <p className="mt-6 text-white/50 text-sm md:text-base max-w-xl leading-relaxed">
            Every realtor, every Reel, every story — one click away.
          </p>
        </section>

        {/* ─── LEADER STRIP ──────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 md:px-10 mb-10 md:mb-12">
          <FeatureCard agent={RIO} />
        </section>

        {/* ─── DIVIDER ───────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-6 md:px-10 mb-6 md:mb-8">
          <div className="flex items-center gap-6">
            <span className="text-rio text-[10px] md:text-xs tracking-[0.4em] uppercase font-semibold whitespace-nowrap">
              The Roster · {TEAM.length} agents
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-rio/40 via-white/10 to-transparent" />
          </div>
        </div>

        {/* ─── TEAM GRID — denser ────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 md:px-10 pb-20 md:pb-28">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {TEAM.map((agent) => (
              <AgentCard
                key={agent.handle}
                agent={agent}
                hovered={hovered === agent.handle}
                onHover={setHovered}
              />
            ))}
          </div>
        </section>

        {/* ─── FOOTER ────────────────────────────────────────── */}
        <footer className="border-t border-white/10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 md:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-[10px] tracking-widest uppercase text-white/40">
            <span>© {new Date().getFullYear()} The Rio Group</span>
            <span>Powered by AZ &amp; Associates</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

// ─── FEATURE CARD (Leader, compact horizontal strip) ────────────────────────

function FeatureCard({ agent }: { agent: Agent }) {
  return (
    <a
      href={igUrl(agent.handle)}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex items-center gap-5 md:gap-7 bg-gradient-to-r from-rio/15 via-black to-black border border-rio/30 rounded-2xl p-5 md:p-6 overflow-hidden hover:border-rio transition-all duration-500"
    >
      {/* Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute -top-12 -right-12 w-72 h-72 bg-rio/20 rounded-full blur-3xl" />
      </div>

      {/* Avatar */}
      <div className="relative w-20 h-20 md:w-28 md:h-28 flex-shrink-0">
        <div className="w-full h-full rounded-full overflow-hidden ring-2 ring-rio/40 group-hover:ring-rio transition-all duration-500">
          <Avatar agent={agent} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Info */}
      <div className="relative flex-1 min-w-0">
        <span className="inline-block text-rio text-[9px] md:text-[10px] tracking-[0.3em] uppercase font-semibold mb-1">
          {agent.role || "Featured"}
        </span>
        <h2 className="text-2xl md:text-4xl font-bold tracking-tight leading-tight">
          {agent.name}
        </h2>
        <p className="text-white/50 text-xs md:text-sm font-mono mt-0.5">
          @{agent.handle}
        </p>
      </div>

      {/* Arrow */}
      <svg width="18" height="10" viewBox="0 0 18 10" fill="none" className="text-rio transition-transform group-hover:translate-x-2 flex-shrink-0">
        <path d="M1 5h16M13 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}

// ─── AGENT CARD — compact ───────────────────────────────────────────────────

function AgentCard({
  agent,
  hovered,
  onHover,
}: {
  agent: Agent;
  hovered: boolean;
  onHover: (h: string | null) => void;
}) {
  return (
    <a
      href={igUrl(agent.handle)}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => onHover(agent.handle)}
      onMouseLeave={() => onHover(null)}
      className="group relative bg-zinc-950/80 hover:bg-zinc-900 border border-white/10 hover:border-rio/40 transition-all duration-300 rounded-2xl p-4 flex flex-col items-center text-center overflow-hidden"
    >
      {/* Hover glow */}
      <div className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${hovered ? "opacity-100" : "opacity-0"}`}>
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-rio/20 rounded-full blur-3xl" />
      </div>

      {/* Avatar — always visible, scales on hover */}
      <div className="relative mb-3">
        <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden ring-2 transition-all duration-500 ${hovered ? "ring-rio scale-110 shadow-xl shadow-rio/30" : "ring-white/15"}`}>
          <Avatar agent={agent} className="w-full h-full object-cover" />
        </div>
        {/* Tiny IG badge */}
        <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-black border-2 transition-colors duration-500 flex items-center justify-center ${hovered ? "border-rio" : "border-white/15"}`}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className={`transition-colors duration-500 ${hovered ? "text-rio" : "text-white/50"}`}>
            <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
            <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* Name */}
      <div className="relative">
        <h3 className={`font-bold text-sm md:text-base tracking-tight leading-tight transition-colors duration-300 ${hovered ? "text-white" : "text-white/90"} truncate max-w-full`}>
          {agent.name}
        </h3>
        <p className={`text-[10px] md:text-[11px] font-mono tracking-tight mt-0.5 transition-colors duration-300 ${hovered ? "text-rio" : "text-white/40"} truncate`}>
          @{agent.handle}
        </p>
      </div>
    </a>
  );
}
