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

// Use unavatar.io to proxy Instagram profile pictures
const avatarUrl = (handle: string) =>
  `https://unavatar.io/instagram/${handle}?fallback=https://unavatar.io/${handle}`;

const igUrl = (handle: string) => `https://www.instagram.com/${handle}/`;

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
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 flex items-center justify-between">
            <img
              src="/rio-logo-white.png"
              alt="The Rio Group"
              className="h-10 md:h-14 w-auto"
            />
            <img
              src="/az-logo-white.png"
              alt="AZ & Associates"
              className="h-9 md:h-12 w-auto opacity-80"
            />
          </div>
        </header>

        {/* ─── HERO ──────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 pt-20 md:pt-28 pb-12 md:pb-16">
          <p className="text-rio text-[11px] md:text-xs tracking-[0.4em] uppercase font-semibold mb-6">
            The Rio Group · Est. 2024
          </p>
          <h1 className="font-bold text-white tracking-tight leading-[0.95]" style={{ fontSize: "clamp(3rem, 9vw, 8rem)" }}>
            Meet the
            <br />
            <span className="italic font-light text-white/60">team that</span>
            <br />
            <span className="text-rio">moves Arizona.</span>
          </h1>
          <p className="mt-8 text-white/50 text-base md:text-lg max-w-xl leading-relaxed">
            A directory of every realtor, every Reel, every story.
            Hover to peek — tap to follow.
          </p>
        </section>

        {/* ─── LEADER FEATURE ────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 mb-16 md:mb-20">
          <FeatureCard
            agent={RIO}
            hovered={hovered === RIO.handle}
            onHover={setHovered}
          />
        </section>

        {/* ─── DIVIDER ───────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 mb-12 md:mb-16">
          <div className="flex items-center gap-6">
            <span className="text-rio text-[10px] md:text-xs tracking-[0.4em] uppercase font-semibold whitespace-nowrap">
              The Roster · {TEAM.length} agents
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-rio/40 via-white/10 to-transparent" />
          </div>
        </div>

        {/* ─── TEAM GRID ─────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 pb-20 md:pb-32">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06] rounded-3xl overflow-hidden border border-white/10">
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
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] tracking-widest uppercase text-white/40">
            <span>© {new Date().getFullYear()} The Rio Group</span>
            <span>Powered by AZ &amp; Associates</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

// ─── FEATURE CARD (Leader) ──────────────────────────────────────────────────

function FeatureCard({
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
      className="group relative grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 md:gap-12 items-center bg-gradient-to-br from-rio/15 via-black to-black border border-rio/30 rounded-3xl p-8 md:p-12 overflow-hidden hover:border-rio transition-all duration-500"
    >
      {/* Glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-rio/20 rounded-full blur-3xl" />
      </div>

      {/* Avatar */}
      <div className="relative">
        <div className={`relative w-full max-w-[280px] mx-auto aspect-square rounded-full overflow-hidden ring-1 ring-rio/30 transition-all duration-500 ${hovered ? "ring-4 ring-rio scale-[1.02]" : ""}`}>
          <img
            src={avatarUrl(agent.handle)}
            alt={agent.name}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect fill='%23C8202A' width='100' height='100'/><text x='50' y='62' text-anchor='middle' font-family='sans-serif' font-size='40' fill='white' font-weight='700'>${agent.name[0]}</text></svg>`;
            }}
          />
        </div>
        {/* Decorative ring */}
        <div className="absolute inset-0 rounded-full border border-rio/20 scale-110 pointer-events-none" />
      </div>

      {/* Info */}
      <div className="relative">
        <span className="inline-block text-rio text-[10px] tracking-[0.4em] uppercase font-semibold mb-4">
          {agent.role || "Featured"}
        </span>
        <h2 className="text-5xl md:text-7xl font-bold tracking-tight leading-[0.95] mb-4">
          {agent.name}
        </h2>
        <p className="text-white/60 text-lg md:text-xl mb-6 font-light">
          @{agent.handle}
        </p>
        <span className="inline-flex items-center gap-3 text-rio font-semibold text-sm tracking-wider uppercase">
          View Instagram
          <svg width="18" height="10" viewBox="0 0 18 10" fill="none" className="transition-transform group-hover:translate-x-2">
            <path d="M1 5h16M13 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </a>
  );
}

// ─── AGENT CARD ─────────────────────────────────────────────────────────────

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
      className="group relative bg-black hover:bg-zinc-950 transition-colors duration-300 p-8 md:p-10 flex flex-col justify-between min-h-[280px] overflow-hidden"
    >
      {/* Hover glow */}
      <div className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${hovered ? "opacity-100" : "opacity-0"}`}>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-rio/20 rounded-full blur-3xl" />
      </div>

      {/* Top row: number indicator + IG icon */}
      <div className="relative flex items-start justify-between mb-8">
        <div className={`w-2 h-2 rounded-full transition-all duration-500 ${hovered ? "bg-rio scale-150" : "bg-white/20"}`} />
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={`transition-all duration-500 ${hovered ? "text-rio scale-110" : "text-white/30"}`}>
          <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
        </svg>
      </div>

      {/* Profile preview — fades in on hover */}
      <div
        className={`absolute top-1/2 right-6 -translate-y-1/2 transition-all duration-500 pointer-events-none ${
          hovered ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-90 translate-x-4"
        }`}
      >
        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-2 ring-rio shadow-2xl shadow-rio/40">
          <img
            src={avatarUrl(agent.handle)}
            alt={agent.name}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect fill='%23C8202A' width='100' height='100'/><text x='50' y='62' text-anchor='middle' font-family='sans-serif' font-size='40' fill='white' font-weight='700'>${agent.name[0]}</text></svg>`;
            }}
          />
        </div>
      </div>

      {/* Name + handle */}
      <div className="relative">
        <h3 className={`font-bold text-3xl md:text-4xl tracking-tight leading-tight mb-2 transition-all duration-300 ${hovered ? "text-white translate-x-1" : "text-white/90"}`}>
          {agent.name}
        </h3>
        <p className={`text-sm font-mono tracking-wide transition-colors duration-300 ${hovered ? "text-rio" : "text-white/40"}`}>
          @{agent.handle}
        </p>
      </div>

      {/* Bottom hover indicator */}
      <div className={`absolute bottom-0 left-0 h-px bg-rio transition-all duration-500 ${hovered ? "w-full" : "w-0"}`} />
    </a>
  );
}
