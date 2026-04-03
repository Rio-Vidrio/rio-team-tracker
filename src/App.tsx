import { useState, useEffect, useCallback, useRef } from "react";

// ─── TYPES ──────────────────────────────────────────────────────────────────

interface Agent {
  name: string;
  handle: string;
  isLeader?: boolean;
}

interface AgentCounts {
  reels: number;
  posts: number;
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
  { name: "Mariana Lopez", handle: "marianalopezibarra" },
];

const ALL_HANDLES = [RIO, ...AGENTS].map((a) => a.handle);

// localStorage keys
const LS_YEAR = "rioReelsYear";
const LS_CURRENT = "rioReelsCurrent";
const LS_SINCE_DATE = "rioCurrentResetDate";
const ADMIN_PASSWORD = "Dothework!";

// ─── HELPERS ────────────────────────────────────────────────────────────────

function getC(map: CountsMap, handle: string): AgentCounts {
  return map[handle] || { reels: 0, posts: 0 };
}

function total(c: AgentCounts): number {
  return c.reels + c.posts;
}

function loadMap(key: string): CountsMap {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    // Migrate: if values are plain numbers, convert to { reels, posts }
    const result: CountsMap = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === "number") {
        result[k] = { reels: v, posts: 0 };
      } else {
        result[k] = v as AgentCounts;
      }
    }
    return result;
  } catch {
    return {};
  }
}

function saveMap(key: string, data: CountsMap) {
  localStorage.setItem(key, JSON.stringify(data));
}

function fmtDate(iso: string | null): string {
  if (!iso) return "Jan 1";
  const parts = iso.split("T")[0].split("-");
  if (parts.length === 3) {
    const d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return "Jan 1";
}

function fmtDateFull(iso: string | null): string {
  if (!iso) return "Jan 1, 2026";
  const parts = iso.split("T")[0].split("-");
  if (parts.length === 3) {
    const d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  return "Jan 1, 2026";
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

  const [yearMap, setYearMap] = useState<CountsMap>(() => loadMap(LS_YEAR));
  const [currentMap, setCurrentMap] = useState<CountsMap>(() => loadMap(LS_CURRENT));
  const [sinceDate, setSinceDate] = useState<string | null>(
    () => localStorage.getItem(LS_SINCE_DATE)
  );

  // hover preview removed

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

  const adjust = useCallback((handle: string, field: "reels" | "posts", delta: number) => {
    setYearMap((prev) => {
      const c = getC(prev, handle);
      return { ...prev, [handle]: { ...c, [field]: Math.max(0, c[field] + delta) } };
    });
    setCurrentMap((prev) => {
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
    ALL_HANDLES.forEach((h) => { empty[h] = { reels: 0, posts: 0 }; });
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
    ALL_HANDLES.forEach((h) => { empty[h] = { reels: 0, posts: 0 }; });
    setYearMap(empty);
    setCurrentMap(empty);
    saveMap(LS_YEAR, empty);
    saveMap(LS_CURRENT, empty);
    setShowResetConfirm(null);
    setConfirmText("");
    resetAdminTimer();
  }, [confirmText, resetAdminTimer]);

  // ─── COMPUTED ───────────────────────────────────────────────────────────

  const sortedAgents = [...AGENTS].sort(
    (a, b) => total(getC(yearMap, b.handle)) - total(getC(yearMap, a.handle))
  );

  const totalReels = AGENTS.reduce((s, a) => s + getC(yearMap, a.handle).reels, 0);
  const totalPosts = AGENTS.reduce((s, a) => s + getC(yearMap, a.handle).posts, 0);

  const mostActive = AGENTS.reduce(
    (best, a) => {
      const t = total(getC(yearMap, a.handle));
      return t > best.total ? { agent: a, total: t } : best;
    },
    { agent: null as Agent | null, total: 0 }
  );

  const agentsActive = AGENTS.filter((a) => total(getC(yearMap, a.handle)) > 0).length;

  const sinceLabel = fmtDate(sinceDate);

  // ─── ROW RENDERER ───────────────────────────────────────────────────────

  function renderRow(agent: Agent, rank: number | null, isLeaderRow: boolean) {
    const yc = getC(yearMap, agent.handle);
    const cc = getC(currentMap, agent.handle);

    return (
      <div
        key={agent.handle}
        className={`grid grid-cols-[44px_1fr_100px_100px_80px_80px] md:grid-cols-[56px_1fr_120px_120px_100px_100px] px-5 py-4 border-b items-center transition-colors ${
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

        {/* Reels — YTD */}
        <div className="flex items-center justify-center gap-1">
          {adminUnlocked && (
            <button onClick={() => adjust(agent.handle, "reels", -1)} className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 font-bold text-sm flex items-center justify-center transition-all active:scale-90">-</button>
          )}
          <span className="text-lg font-bold text-gray-900 w-10 text-center tabular-nums">{yc.reels}</span>
          {adminUnlocked && (
            <button onClick={() => adjust(agent.handle, "reels", 1)} className="w-6 h-6 rounded-full bg-rio hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center transition-all active:scale-90">+</button>
          )}
        </div>

        {/* Posts — YTD */}
        <div className="flex items-center justify-center gap-1">
          {adminUnlocked && (
            <button onClick={() => adjust(agent.handle, "posts", -1)} className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 font-bold text-sm flex items-center justify-center transition-all active:scale-90">-</button>
          )}
          <span className="text-lg font-bold text-gray-900 w-10 text-center tabular-nums">{yc.posts}</span>
          {adminUnlocked && (
            <button onClick={() => adjust(agent.handle, "posts", 1)} className="w-6 h-6 rounded-full bg-rio hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center transition-all active:scale-90">+</button>
          )}
        </div>

        {/* Reels — Since */}
        <div className="text-center">
          <span className="text-sm font-semibold text-gray-700 tabular-nums">{cc.reels}</span>
        </div>

        {/* Posts — Since */}
        <div className="text-center">
          <span className="text-sm font-semibold text-gray-700 tabular-nums">{cc.posts}</span>
        </div>

      </div>
    );
  }

  // ─── RENDER ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-offwhite">
      {/* ─── HEADER ──────────────────────────────────────── */}
      <header className="bg-white border-b-2 border-rio px-4 md:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rio rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-lg">R</span>
            </div>
            <h1 className="text-lg font-bold tracking-tight text-gray-900">
              The Rio Group
            </h1>
          </div>
          <h2 className="text-sm md:text-base font-semibold text-gray-900 hidden sm:block">
            Team Content Tracker
          </h2>
          <div className="flex items-center gap-3">
            <p className="text-xs text-muted font-medium hidden md:block">{todayStr()}</p>
            {adminUnlocked ? (
              <button
                onClick={() => setAdminUnlocked(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-xl text-xs font-semibold text-green-700 hover:bg-green-100 transition-colors"
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-5">
            <p className="text-[11px] text-muted uppercase tracking-widest font-semibold">Total Reels YTD</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{totalReels.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-5">
            <p className="text-[11px] text-muted uppercase tracking-widest font-semibold">Total Posts YTD</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{totalPosts.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-5">
            <p className="text-[11px] text-muted uppercase tracking-widest font-semibold">Most Active</p>
            <p className="text-lg font-bold text-gray-900 mt-1 truncate">{mostActive.agent?.name ?? "—"}</p>
            {mostActive.total > 0 && (
              <p className="text-xs text-rio font-semibold">{mostActive.total} total</p>
            )}
          </div>
          <div className="bg-white rounded-2xl shadow-md p-5">
            <p className="text-[11px] text-muted uppercase tracking-widest font-semibold">Agents Active</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {agentsActive}<span className="text-base text-muted font-normal"> / 15</span>
            </p>
          </div>
        </div>

        {/* ─── LEADERBOARD ───────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-md overflow-visible">
          {/* Column headers — two groups: YTD and Since */}
          <div className="grid grid-cols-[44px_1fr_100px_100px_80px_80px] md:grid-cols-[56px_1fr_120px_120px_100px_100px] px-5 py-2 border-b border-gray-200 text-[10px] text-muted uppercase tracking-wider font-semibold">
            <span />
            <span />
            <span className="text-center col-span-2 border-b border-gray-200 pb-1 -mb-2">YTD</span>
            <span className="text-center col-span-2 border-b border-gray-200 pb-1 -mb-2">Since {sinceLabel}</span>
          </div>
          <div className="grid grid-cols-[44px_1fr_100px_100px_80px_80px] md:grid-cols-[56px_1fr_120px_120px_100px_100px] px-5 py-2 border-b border-gray-100 text-[10px] text-muted uppercase tracking-wider font-semibold">
            <span>#</span>
            <span>Agent</span>
            <span className="text-center">Reels</span>
            <span className="text-center">Posts</span>
            <span className="text-center">Reels</span>
            <span className="text-center">Posts</span>
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
                  Zeros ALL Reels &amp; Posts — cannot be undone
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
