import { useState, useEffect, useCallback, useRef } from "react";

// ─── TYPES ──────────────────────────────────────────────────────────────────

interface Agent {
  name: string;
  handle: string;
  isLeader?: boolean;
}

interface AgentCounts {
  personalReels: number;   // Real Estate Reels
  businessReels: number;   // Daily Life Reels
  posts: number;           // Daily Pic (POD)
}

type CountsMap = Record<string, AgentCounts>;

// ─── AGENTS ─────────────────────────────────────────────────────────────────

const RIO: Agent = { name: "Rio Vidrio", handle: "rio.vidrio", isLeader: true };

const AGENTS: Agent[] = [
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

const ALL_HANDLES = [RIO, ...AGENTS].map((a) => a.handle);

// ─── PREFILL DATA ──────────────────────────────────────────────────────────

const PREFILL_DATA: CountsMap = {
  "rio.vidrio": { personalReels: 19, businessReels: 9, posts: 10 },
  "egonvon.p": { personalReels: 19, businessReels: 3, posts: 12 },
  "mariel.palafox.leon.realtor": { personalReels: 12, businessReels: 9, posts: 17 },
  "xorealtor.az": { personalReels: 12, businessReels: 4, posts: 18 },
  "brisasellsaz": { personalReels: 12, businessReels: 3, posts: 6 },
  "antsellshomes_": { personalReels: 11, businessReels: 0, posts: 12 },
  "az_realtor_montano": { personalReels: 7, businessReels: 2, posts: 13 },
  "osmanyazrealtor": { personalReels: 5, businessReels: 3, posts: 12 },
  "jilarioleon": { personalReels: 3, businessReels: 3, posts: 12 },
  "mikemhomes": { personalReels: 4, businessReels: 1, posts: 9 },
  "homeswithana2.0": { personalReels: 3, businessReels: 0, posts: 12 },
  "azrealty.livclarke": { personalReels: 3, businessReels: 0, posts: 11 },
  "britni.christenson.azrealtor": { personalReels: 3, businessReels: 0, posts: 6 },
  "jonbsheets": { personalReels: 2, businessReels: 0, posts: 5 },
  "gsotelo4": { personalReels: 2, businessReels: 0, posts: 2 },
  "iris_placeholder": { personalReels: 1, businessReels: 0, posts: 5 },
};

// localStorage keys
const LS_YEAR = "rioReelsYear";
const LS_CURRENT = "rioReelsCurrent";
const LS_SINCE_DATE = "rioCurrentResetDate";
const ADMIN_PASSWORD = "Dothework!";

// ─── HELPERS ────────────────────────────────────────────────────────────────

function getC(map: CountsMap, handle: string): AgentCounts {
  return map[handle] || { personalReels: 0, businessReels: 0, posts: 0 };
}

function totalVideos(c: AgentCounts): number {
  return c.personalReels + c.businessReels;
}

function totalAll(c: AgentCounts): number {
  return c.personalReels + c.businessReels + c.posts;
}

function loadMap(key: string, fallback: CountsMap): CountsMap {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { ...fallback };
    const parsed = JSON.parse(raw);
    const result: CountsMap = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === "number") {
        result[k] = { personalReels: v, businessReels: 0, posts: 0 };
      } else {
        const obj = v as Record<string, number>;
        if ("reels" in obj && !("personalReels" in obj)) {
          result[k] = { personalReels: obj.reels || 0, businessReels: 0, posts: obj.posts || 0 };
        } else {
          result[k] = { personalReels: obj.personalReels || 0, businessReels: obj.businessReels || 0, posts: obj.posts || 0 };
        }
      }
    }
    return result;
  } catch {
    return { ...fallback };
  }
}

function saveMap(key: string, data: CountsMap) {
  localStorage.setItem(key, JSON.stringify(data));
}

function fmtDate(iso: string | null): string {
  if (!iso) return "Mar 23";
  const parts = iso.split("T")[0].split("-");
  if (parts.length === 3) {
    const d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return "Mar 23";
}

function fmtDateFull(iso: string | null): string {
  if (!iso) return "Mar 23, 2026";
  const parts = iso.split("T")[0].split("-");
  if (parts.length === 3) {
    const d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  return "Mar 23, 2026";
}

function todayStr(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// ─── COMPONENT ──────────────────────────────────────────────────────────────

export default function App() {
  // Clean up stale localStorage keys on mount
  useEffect(() => {
    [
      "rioTeamTracker", "rioTeamYear", "rioTeamCurrent", "rioTeamBaseline",
      "rioTeamRefreshDate", "rioReelBaseline", "rioPodsYear", "rioPodsCurrent",
    ].forEach((k) => localStorage.removeItem(k));
  }, []);

  const [yearMap, setYearMap] = useState<CountsMap>(() => loadMap(LS_YEAR, PREFILL_DATA));
  const [currentMap, setCurrentMap] = useState<CountsMap>(() => loadMap(LS_CURRENT, PREFILL_DATA));
  const [sinceDate, setSinceDate] = useState<string | null>(
    () => localStorage.getItem(LS_SINCE_DATE) || "2026-03-23"
  );

  // Admin
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState<"since" | "year" | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [newSinceDate, setNewSinceDate] = useState("");
  const adminTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persist
  useEffect(() => { saveMap(LS_YEAR, yearMap); }, [yearMap]);
  useEffect(() => { saveMap(LS_CURRENT, currentMap); }, [currentMap]);
  useEffect(() => {
    if (sinceDate) localStorage.setItem(LS_SINCE_DATE, sinceDate);
  }, [sinceDate]);

  // Auto-lock after 5 min
  const resetAdminTimer = useCallback(() => {
    if (adminTimer.current) clearTimeout(adminTimer.current);
    adminTimer.current = setTimeout(() => {
      setAdminUnlocked(false);
      setShowAdminModal(false);
      setShowResetConfirm(null);
      setConfirmText("");
    }, 300000);
  }, []);

  useEffect(() => {
    if (adminUnlocked) resetAdminTimer();
    return () => { if (adminTimer.current) clearTimeout(adminTimer.current); };
  }, [adminUnlocked, resetAdminTimer]);

  // ─── ACTIONS ────────────────────────────────────────────────────────────

  const adjust = useCallback((handle: string, field: "personalReels" | "businessReels" | "posts", delta: number) => {
    // Adjusting the "Since" counter also updates YTD
    setCurrentMap((prev) => {
      const c = getC(prev, handle);
      return { ...prev, [handle]: { ...c, [field]: Math.max(0, c[field] + delta) } };
    });
    setYearMap((prev) => {
      const c = getC(prev, handle);
      return { ...prev, [handle]: { ...c, [field]: Math.max(0, c[field] + delta) } };
    });
  }, []);

  const handleUnlock = useCallback(() => {
    if (adminPassword === ADMIN_PASSWORD) {
      setAdminUnlocked(true);
      setPasswordError(false);
      setAdminPassword("");
      setShowAdminModal(false);
      resetAdminTimer();
    } else {
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 600);
    }
  }, [adminPassword, resetAdminTimer]);

  const handleResetSince = useCallback(() => {
    const empty: CountsMap = {};
    ALL_HANDLES.forEach((h) => { empty[h] = { personalReels: 0, businessReels: 0, posts: 0 }; });
    setCurrentMap(empty);
    saveMap(LS_CURRENT, empty);
    const dateVal = newSinceDate || new Date().toISOString().split("T")[0];
    setSinceDate(dateVal);
    localStorage.setItem(LS_SINCE_DATE, dateVal);
    setShowResetConfirm(null);
    setNewSinceDate("");
    resetAdminTimer();
  }, [newSinceDate, resetAdminTimer]);

  const handleResetYear = useCallback(() => {
    if (confirmText !== "RESET") return;
    const empty: CountsMap = {};
    ALL_HANDLES.forEach((h) => { empty[h] = { personalReels: 0, businessReels: 0, posts: 0 }; });
    setYearMap(empty);
    setCurrentMap(empty);
    saveMap(LS_YEAR, empty);
    saveMap(LS_CURRENT, empty);
    setShowResetConfirm(null);
    setConfirmText("");
    resetAdminTimer();
  }, [confirmText, resetAdminTimer]);

  // ─── COMPUTED ───────────────────────────────────────────────────────────

  // Sort by total videos (RE + Daily reels)
  const sortedAgents = [...AGENTS].sort(
    (a, b) => totalVideos(getC(currentMap, b.handle)) - totalVideos(getC(currentMap, a.handle))
  );

  const totalREReels = AGENTS.reduce((s, a) => s + getC(currentMap, a.handle).personalReels, 0);
  const totalDailyReels = AGENTS.reduce((s, a) => s + getC(currentMap, a.handle).businessReels, 0);
  const totalPOD = AGENTS.reduce((s, a) => s + getC(currentMap, a.handle).posts, 0);

  const mostActive = AGENTS.reduce(
    (best, a) => {
      const t = totalVideos(getC(currentMap, a.handle));
      return t > best.total ? { agent: a, total: t } : best;
    },
    { agent: null as Agent | null, total: 0 }
  );

  const agentsActive = AGENTS.filter((a) => totalAll(getC(currentMap, a.handle)) > 0).length;

  const sinceLabel = fmtDate(sinceDate);

  // ─── ROW RENDERER ───────────────────────────────────────────────────────

  const gridCols = "grid-cols-[36px_1fr_60px_60px_60px_50px_50px_50px] md:grid-cols-[56px_1fr_100px_100px_100px_80px_80px_80px]";

  function renderRow(agent: Agent, rank: number | null, isLeaderRow: boolean) {
    const cc = getC(currentMap, agent.handle);
    const yc = getC(yearMap, agent.handle);

    return (
      <div
        key={agent.handle}
        className={`grid ${gridCols} px-3 md:px-5 py-4 border-b items-center transition-colors ${
          isLeaderRow
            ? "bg-yellow-50 border-l-4 border-l-gold border-b-gray-200"
            : "border-b-gray-50 hover:bg-gray-50/80"
        }`}
      >
        {/* Rank */}
        <div className="flex items-center">
          {isLeaderRow ? (
            <span className="text-[10px] text-gold font-bold uppercase">Lead</span>
          ) : rank === 1 ? (
            <span className="text-2xl" title="1st Place">&#128081;</span>
          ) : rank === 2 ? (
            <span className="w-8 h-8 rounded-full bg-silver/20 flex items-center justify-center text-sm font-bold text-silver">2</span>
          ) : rank === 3 ? (
            <span className="w-8 h-8 rounded-full bg-bronze/20 flex items-center justify-center text-sm font-bold text-bronze">3</span>
          ) : (
            <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-muted">{rank}</span>
          )}
        </div>

        {/* Agent name + link */}
        <div className="min-w-0">
          <p className="text-gray-900 font-bold text-sm truncate">
            {agent.name}
            {isLeaderRow && <span className="ml-2 text-[10px] text-gold font-semibold uppercase">Team Leader</span>}
          </p>
          <a
            href={`https://www.instagram.com/${agent.handle}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-600 hover:underline text-xs font-medium truncate block"
          >
            @{agent.handle}
          </a>
        </div>

        {/* ── SINCE (primary, editable) ── */}

        {/* RE Reels — Since */}
        <div className="flex items-center justify-center gap-0.5">
          {adminUnlocked && (
            <button onClick={() => adjust(agent.handle, "personalReels", -1)} className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 font-bold text-xs flex items-center justify-center transition-all active:scale-90">-</button>
          )}
          <span className="text-base md:text-lg font-bold text-gray-900 w-7 md:w-10 text-center tabular-nums">{cc.personalReels}</span>
          {adminUnlocked && (
            <button onClick={() => adjust(agent.handle, "personalReels", 1)} className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-rio hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center transition-all active:scale-90">+</button>
          )}
        </div>

        {/* Daily Life — Since */}
        <div className="flex items-center justify-center gap-0.5">
          {adminUnlocked && (
            <button onClick={() => adjust(agent.handle, "businessReels", -1)} className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 font-bold text-xs flex items-center justify-center transition-all active:scale-90">-</button>
          )}
          <span className="text-base md:text-lg font-bold text-gray-900 w-7 md:w-10 text-center tabular-nums">{cc.businessReels}</span>
          {adminUnlocked && (
            <button onClick={() => adjust(agent.handle, "businessReels", 1)} className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-rio hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center transition-all active:scale-90">+</button>
          )}
        </div>

        {/* Daily Pic — Since */}
        <div className="flex items-center justify-center gap-0.5">
          {adminUnlocked && (
            <button onClick={() => adjust(agent.handle, "posts", -1)} className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 font-bold text-xs flex items-center justify-center transition-all active:scale-90">-</button>
          )}
          <span className="text-base md:text-lg font-bold text-gray-900 w-7 md:w-10 text-center tabular-nums">{cc.posts}</span>
          {adminUnlocked && (
            <button onClick={() => adjust(agent.handle, "posts", 1)} className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-rio hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center transition-all active:scale-90">+</button>
          )}
        </div>

        {/* ── YTD (read-only, right side) ── */}

        {/* RE Reels — YTD */}
        <div className="text-center">
          <span className="text-xs md:text-sm font-semibold text-gray-700 tabular-nums">{yc.personalReels}</span>
        </div>

        {/* Daily Life — YTD */}
        <div className="text-center">
          <span className="text-xs md:text-sm font-semibold text-gray-700 tabular-nums">{yc.businessReels}</span>
        </div>

        {/* Daily Pic — YTD */}
        <div className="text-center">
          <span className="text-xs md:text-sm font-semibold text-gray-700 tabular-nums">{yc.posts}</span>
        </div>

      </div>
    );
  }

  // ─── RENDER ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-offwhite">
      {/* ─── HEADER (black with logos) ───────────────────── */}
      <header className="bg-black px-4 md:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <img src="/rio-logo-white.png" alt="The Rio Group" className="h-10 md:h-12 w-auto" />
          <div className="text-center hidden sm:block">
            <h1 className="text-white text-sm md:text-base font-bold tracking-wide uppercase">
              Team Content Tracker
            </h1>
            <p className="text-gray-400 text-[10px] md:text-xs font-medium">{todayStr()}</p>
          </div>
          <div className="flex items-center gap-3">
            <img src="/az-logo-white.png" alt="AZ & Associates" className="h-8 md:h-10 w-auto" />
            {adminUnlocked ? (
              <button
                onClick={() => setAdminUnlocked(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-900/40 border border-green-500/40 rounded-xl text-xs font-semibold text-green-400 hover:bg-green-900/60 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Admin
              </button>
            ) : (
              <button
                onClick={() => setShowAdminModal(true)}
                className="text-xl hover:scale-110 transition-transform"
                title="Admin Login"
              >
                &#128274;
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {/* ─── SUMMARY CARDS ─────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-5">
            <p className="text-[11px] text-muted uppercase tracking-widest font-semibold">RE Reels</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{totalREReels.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-5">
            <p className="text-[11px] text-muted uppercase tracking-widest font-semibold">Daily Life Reels</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{totalDailyReels.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-5">
            <p className="text-[11px] text-muted uppercase tracking-widest font-semibold">Daily Pics</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{totalPOD.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-5">
            <p className="text-[11px] text-muted uppercase tracking-widest font-semibold">Most Active</p>
            <p className="text-lg font-bold text-gray-900 mt-1 truncate">{mostActive.agent?.name ?? "—"}</p>
            {mostActive.total > 0 && (
              <p className="text-xs text-rio font-semibold">{mostActive.total} videos</p>
            )}
          </div>
          <div className="bg-white rounded-2xl shadow-md p-5">
            <p className="text-[11px] text-muted uppercase tracking-widest font-semibold">Agents Active</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {agentsActive}<span className="text-base text-muted font-normal"> / {AGENTS.length}</span>
            </p>
          </div>
        </div>

        {/* ─── LEADERBOARD ───────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-md overflow-visible">
          {/* Column headers — Since (primary, left) | YTD (right) */}
          <div className={`grid ${gridCols} px-3 md:px-5 py-2 border-b border-gray-200 text-[9px] md:text-[10px] text-muted uppercase tracking-wider font-semibold`}>
            <span />
            <span />
            <span className="text-center col-span-3 border-b border-rio pb-1 -mb-2 text-rio">Since {sinceLabel}</span>
            <span className="text-center col-span-3 border-b border-gray-200 pb-1 -mb-2">YTD</span>
          </div>
          <div className={`grid ${gridCols} px-3 md:px-5 py-2 border-b border-gray-100 text-[8px] md:text-[10px] text-muted uppercase tracking-wider font-semibold`}>
            <span>#</span>
            <span>Agent</span>
            <span className="text-center">RE Reel</span>
            <span className="text-center">Daily</span>
            <span className="text-center">Pic</span>
            <span className="text-center">RE Reel</span>
            <span className="text-center">Daily</span>
            <span className="text-center">Pic</span>
          </div>

          {/* Rio's row — admin only */}
          {adminUnlocked && (
            <>
              {renderRow(RIO, null, true)}
              <div className="border-b-2 border-gray-300" />
            </>
          )}

          {/* Team rows */}
          {sortedAgents.map((agent, idx) => renderRow(agent, idx + 1, false))}
        </div>

        {/* ─── ADMIN PANEL (inline, only when unlocked) ──── */}
        {adminUnlocked && (
          <div className="mt-8 mb-8 bg-white rounded-2xl shadow-md p-6 max-w-lg">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-green-600 font-semibold">Admin Mode — auto-locks in 5 min</span>
            </div>

            {/* Reset Since Date */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Reset &ldquo;Since&rdquo; Period</p>
              <p className="text-xs text-muted mb-3">Pick a new start date and zero the &ldquo;Since&rdquo; columns.</p>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={newSinceDate}
                  onChange={(e) => setNewSinceDate(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rio"
                />
                <button
                  onClick={handleResetSince}
                  className="px-4 py-2 bg-rio text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors"
                >
                  Reset Since Date
                </button>
              </div>
              {sinceDate && (
                <p className="text-[11px] text-muted mt-2">Currently: Since {fmtDateFull(sinceDate)}</p>
              )}
            </div>

            {/* Reset Year */}
            {showResetConfirm !== "year" ? (
              <button
                onClick={() => setShowResetConfirm("year")}
                className="w-full px-4 py-3 bg-red-50 hover:bg-red-100 rounded-xl text-sm font-semibold text-red-600 transition-colors text-left"
              >
                Reset Year (All Counts)
                <span className="block text-xs text-red-400 font-normal mt-0.5">
                  Zeros ALL counts — cannot be undone
                </span>
              </button>
            ) : (
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <p className="text-sm text-red-700 font-semibold mb-2">Type RESET to confirm</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="RESET"
                    className="flex-1 px-4 py-2 border border-red-200 rounded-xl text-sm focus:outline-none focus:border-red-400"
                  />
                  <button
                    onClick={handleResetYear}
                    disabled={confirmText !== "RESET"}
                    className="px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-40 transition-colors"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => { setShowResetConfirm(null); setConfirmText(""); }}
                    className="px-4 py-2 bg-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ─── ADMIN MODAL ─────────────────────────────────── */}
      {showAdminModal && !adminUnlocked && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowAdminModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Admin Login</h3>
            <p className="text-sm text-muted mb-4">Enter password to unlock editing</p>
            <div className={passwordError ? "animate-shake" : ""}>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                placeholder="Password"
                autoFocus
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rio focus:ring-2 focus:ring-rio/20 mb-3"
              />
            </div>
            {passwordError && (
              <p className="text-red-500 text-xs mb-3 font-medium">Incorrect password</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleUnlock}
                className="flex-1 px-4 py-2.5 bg-rio text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Unlock
              </button>
              <button
                onClick={() => { setShowAdminModal(false); setAdminPassword(""); setPasswordError(false); }}
                className="px-4 py-2.5 bg-gray-100 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
