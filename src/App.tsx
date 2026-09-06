import { useState, useEffect, useCallback, useRef } from "react";

// ─── Images ────────────────────────────────────────────────────────────────────

const u = (id: string, w = 1200) => `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

const IMG = {
  hero:        u("photo-1699138346782-8a8b211c3da2", 1600),
  wheel:       u("photo-1779508357136-93bda20fd487"),
  circuit:     u("photo-1614949194403-9602bdc14a3a", 1600),
  night:       u("photo-1547025603-ef800f02690e", 1600),
  cycling:     u("photo-1516147697747-02adcafd3fda"),
  moto:        u("photo-1753563819705-207631a922d1"),
  moto2:       u("photo-1753563826116-714980c5ee31"),
  heritageCart:u("photo-1770129157671-aabdfeb747fc"),
  heritageOx:  u("photo-1762884110133-926e4195d3b9"),
  heritageField:u("photo-1775817631187-7e153e20e598"),
  pit1:        u("photo-1765202663853-5072b1464dd3"),
  pit2:        u("photo-1779808108083-47a5282a462d"),
  pit3:        u("photo-1779808109935-ee4d88ff3841"),
};

const DRIVER_IMGS = [
  u("photo-1777457395954-584fb6e581e1", 700),
  u("photo-1776231410884-394d16b144e1", 700),
  u("photo-1770985306049-770d2893ab05", 700),
  u("photo-1761751237853-7489598b7498", 700),
  u("photo-1761942943730-c31590bb5c1b", 700),
  u("photo-1761335284674-0fb01d5bb4cd", 700),
];

// ─── Types & Data ───────────────────────────────────────────────────────────────

type Theme = "dark" | "light";
type Page  = "home" | "racing" | "drivers" | "standings" | "race-center" | "teams" | "dashboard";
type RacingClass = "heritage" | "human" | "motor" | "future";

type Auth = {
  loggedIn: boolean;
  user: { name: string; email: string } | null;
  followed: { drivers: Set<number>; teams: Set<string> };
  reminders: Set<string>;
  prediction: string | null;
};

type Driver = {
  id: number; num: string; name: string; team: string; country: string;
  cls: RacingClass; pos: number; pts: number; wins: number; podiums: number;
  topSpeed: string; img: string; quote?: string;
};
type Team = {
  name: string; pts: number; wins: number; podiums: number;
  driverNames: string[]; cls: RacingClass; desc: string; color: string; abbr: string; img: string;
};
type Round = {
  num: number; city: string; country: string; circuit: string; date: string; finale?: boolean;
  x: number; y: number; // world map coords
};

const CLS_META: Record<RacingClass, { icon: string; label: string; sub: string; color: string; img: string }> = {
  heritage: { icon: "🐂", label: "HERITAGE",    sub: "Bullock Cart",    color: "#ffd700", img: IMG.heritageCart },
  human:    { icon: "🚲", label: "HUMAN POWER", sub: "Racing Cycle",    color: "#7fff9a", img: IMG.cycling     },
  motor:    { icon: "🏍️", label: "MOTOR",        sub: "Racing Motorcycle",color: "#ff8c42", img: IMG.moto      },
  future:   { icon: "🏎️", label: "FUTURE",       sub: "Advanced Racing Car",color:"#00c8ff", img: IMG.hero    },
};

const DRIVERS: Driver[] = [
  { id:1, num:"07", name:"ARJUN RAO",    team:"Kalchakra Velocity", country:"India",       cls:"future",   pos:1, pts:277, wins:7, podiums:12, topSpeed:"312 KM/H", img:DRIVER_IMGS[0] },
  { id:2, num:"09", name:"DEV SHARMA",   team:"Parampara Racing",   country:"India",       cls:"heritage", pos:2, pts:198, wins:3, podiums:8,  topSpeed:"—",        img:DRIVER_IMGS[1], quote:"I don't race against the future. I carry the past into it." },
  { id:3, num:"21", name:"MAYA SEN",     team:"Apex Motors",        country:"India",       cls:"motor",    pos:3, pts:168, wins:4, podiums:9,  topSpeed:"287 KM/H", img:DRIVER_IMGS[2] },
  { id:4, num:"14", name:"LEO PARK",     team:"Team Orbital",       country:"South Korea", cls:"human",    pos:4, pts:121, wins:2, podiums:5,  topSpeed:"82 KM/H",  img:DRIVER_IMGS[3] },
  { id:5, num:"18", name:"KIRAN DEV",    team:"Kalchakra Velocity", country:"India",       cls:"future",   pos:5, pts:109, wins:2, podiums:4,  topSpeed:"301 KM/H", img:DRIVER_IMGS[4] },
  { id:6, num:"31", name:"ADITYA VARMA", team:"Apex Motors",        country:"India",       cls:"motor",    pos:6, pts:96,  wins:1, podiums:3,  topSpeed:"294 KM/H", img:DRIVER_IMGS[5] },
];

const TEAMS: Team[] = [
  { name:"Kalchakra Velocity", pts:277, wins:7, podiums:12, driverNames:["Arjun Rao","Kiran Dev"],   cls:"future",   desc:"The flagship future-mobility racing team.",                   color:"#00c8ff", abbr:"KV",  img:IMG.pit1 },
  { name:"Apex Motors",        pts:264, wins:4, podiums:9,  driverNames:["Maya Sen","Aditya Varma"], cls:"motor",    desc:"Engineering mechanical speed into competitive performance.",   color:"#ff8c42", abbr:"APX", img:IMG.pit2 },
  { name:"Parampara Racing",   pts:198, wins:3, podiums:8,  driverNames:["Dev Sharma"],              cls:"heritage", desc:"Guardians of the Heritage Grand Prix tradition.",              color:"#ffd700", abbr:"PAR", img:IMG.pit3 },
  { name:"Team Orbital",       pts:121, wins:2, podiums:5,  driverNames:["Leo Park"],                cls:"human",    desc:"Pushing human-powered performance to its absolute limit.",    color:"#7fff9a", abbr:"ORB", img:IMG.cycling },
];

const ROUNDS: Round[] = [
  { num:1, city:"DELHI",     country:"India",       circuit:"Rajpath Circuit",         date:"12 OCT 2026",                x:62, y:36  },
  { num:2, city:"DUBAI",     country:"UAE",         circuit:"Desert Speed Complex",    date:"26 OCT 2026",                x:54, y:42  },
  { num:3, city:"TOKYO",     country:"Japan",       circuit:"Meiji Speedway",          date:"09 NOV 2026",                x:80, y:34  },
  { num:4, city:"LONDON",    country:"UK",          circuit:"Meridian Motor Circuit",  date:"23 NOV 2026",                x:42, y:28  },
  { num:5, city:"SINGAPORE", country:"Singapore",   circuit:"Marina Bay Sprint",       date:"07 DEC 2026",                x:72, y:52  },
  { num:6, city:"HYDERABAD", country:"India",       circuit:"Deccan Speedway",         date:"21 DEC 2026", finale:true,   x:63, y:44  },
];

const CIRCUIT_TURNS = [
  { id:"T1",  cx:138, cy:90,  label:"TURN 1",       detail:"Heavy braking from 295 km/h into the opening hairpin. Prime overtaking zone and a decisive strategy point." },
  { id:"T7",  cx:322, cy:50,  label:"TURN 7",       detail:"High-speed chicane at 235 km/h. Minimal runoff. Demands commitment and precision on entry." },
  { id:"T10", cx:428, cy:128, label:"TURN 10",      detail:"Full-throttle sweeper sustaining 250 km/h. High lateral load. Tyre management is decisive." },
  { id:"T12", cx:360, cy:218, label:"TURN 12",      detail:"Technical hairpin with DRS activation on exit. Late braking defines lap time here." },
  { id:"FS",  cx:196, cy:220, label:"FINAL SECTOR", detail:"Last corner before start/finish. Exit speed determines the straight-line advantage on the main DRS zone." },
];

const SCHEDULE: { day: string; sessions: { name: string; time: string; done: boolean; next?: boolean }[] }[] = [
  { day:"FRIDAY",   sessions:[{ name:"PRACTICE 01", time:"09:00", done:true },{ name:"PRACTICE 02", time:"14:00", done:true }] },
  { day:"SATURDAY", sessions:[{ name:"QUALIFYING",  time:"15:00", done:false, next:true }] },
  { day:"SUNDAY",   sessions:[{ name:"GRAND PRIX",  time:"18:00", done:false }] },
];

const RACE_DATE = new Date("2026-10-12T12:30:00Z"); // Round 01 Delhi

type RaceEntry = {
  cls: RacingClass; title: string; vehicle: string; desc: string;
  distance: string; laps: number; requirements: string;
  nextRace: string; nextDate: string; status: string; cta: string; img: string;
};

const RACE_ENTRIES: Record<RacingClass, RaceEntry> = {
  heritage: {
    cls: "heritage", title: "HERITAGE GRAND PRIX", vehicle: "Bullock Cart",
    desc: "The most prestigious and distinctive race in the KALCHAKRA Championship. Authentic bullock cart racing — culturally rooted, competitively structured and internationally sanctioned.",
    distance: "12.4 KM", laps: 12,
    requirements: "Certified Handler · Heritage Class License · Veterinary Clearance",
    nextRace: "ROUND 06 · HYDERABAD", nextDate: "21 DEC 2026", status: "REGISTRATION OPEN",
    cta: "ENTER HERITAGE GRAND PRIX", img: IMG.heritageCart,
  },
  human: {
    cls: "human", title: "HUMAN POWER GRAND PRIX", vehicle: "Racing Cycle",
    desc: "Pure athletic endurance and speed on a global circuit. Human-powered racing machines competing over a demanding multi-discipline course against riders from every nation.",
    distance: "38.6 KM", laps: 24,
    requirements: "KALCHAKRA Cycling License · Age 18+ · National Qualification",
    nextRace: "ROUND 02 · DUBAI", nextDate: "26 OCT 2026", status: "REGISTRATION OPEN",
    cta: "ENTER HUMAN POWER RACE", img: IMG.cycling,
  },
  motor: {
    cls: "motor", title: "MOTOR GRAND PRIX", vehicle: "Racing Motorcycle",
    desc: "High-performance motorcycle racing at the edge of mechanical precision. Speed, strategy and technical mastery on international championship circuits.",
    distance: "154.2 KM", laps: 32,
    requirements: "FIM License · KALCHAKRA Motor Class · Age 18+",
    nextRace: "ROUND 01 · DELHI", nextDate: "12 OCT 2026", status: "REGISTRATION OPEN",
    cta: "ENTER MOTOR RACE", img: IMG.moto,
  },
  future: {
    cls: "future", title: "FUTURE GRAND PRIX", vehicle: "Advanced Racing Car",
    desc: "The pinnacle of KALCHAKRA racing. Next-generation vehicles at the frontier of speed, aerodynamics and intelligent performance engineering.",
    distance: "154.2 KM", laps: 32,
    requirements: "KALCHAKRA Super License · Team Entry · Age 18+",
    nextRace: "ROUND 01 · DELHI", nextDate: "12 OCT 2026", status: "REGISTRATION OPEN",
    cta: "ENTER FUTURE GRAND PRIX", img: IMG.hero,
  },
};

// ─── Hooks ──────────────────────────────────────────────────────────────────────

function useCountdown() {
  const calc = () => {
    const d = Math.max(0, RACE_DATE.getTime() - Date.now());
    return { days:Math.floor(d/86400000), hours:Math.floor((d%86400000)/3600000), minutes:Math.floor((d%3600000)/60000), seconds:Math.floor((d%60000)/1000) };
  };
  const [t, setT] = useState(calc);
  useEffect(() => { const id = setInterval(() => setT(calc()), 1000); return () => clearInterval(id); }, []);
  return t;
}

function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function useEscape(cb: () => void) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") cb(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [cb]);
}

// ─── Utilities ──────────────────────────────────────────────────────────────────

function Reveal({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} style={{ opacity:visible?1:0, transform:visible?"none":"translateY(22px)", transition:`opacity .65s ease ${delay}s, transform .65s ease ${delay}s`, ...style }}>
      {children}
    </div>
  );
}

function Countdown({ compact }: { compact?: boolean }) {
  const { days, hours, minutes, seconds } = useCountdown();
  const pad = (n: number) => String(n).padStart(2, "0");
  const items: [string, string][] = [[pad(days),"DAYS"],[pad(hours),"HRS"],[pad(minutes),"MIN"],[pad(seconds),"SEC"]];
  return (
    <div style={{ display:"flex", gap: compact?"1.25rem":"2rem" }}>
      {items.map(([v,l]) => (
        <div key={l}>
          <div className="k-display" style={{ fontSize:compact?"1.75rem":"3rem", fontWeight:900, color:"var(--accent)", lineHeight:1, fontVariantNumeric:"tabular-nums" }}>{v}</div>
          <div className="k-mono" style={{ fontSize:"0.46rem", letterSpacing:"0.24em", color:"var(--t3)", marginTop:"0.18rem" }}>{l}</div>
        </div>
      ))}
    </div>
  );
}

const OVERLAY: React.CSSProperties = {
  position:"fixed", inset:0, zIndex:500,
  background:"rgba(4,4,14,0.88)", backdropFilter:"blur(14px)",
  display:"flex", alignItems:"center", justifyContent:"center", padding:"1.25rem",
};

const MODAL = (color = "var(--accent)"): React.CSSProperties => ({
  background:"var(--modal-bg)", border:`1px solid ${color}22`, borderTop:`2px solid ${color}`,
  borderRadius:3, animation:"fadeUp 0.24s ease", overflowY:"auto" as const, maxHeight:"90vh",
});

const filterBtn = (active: boolean): React.CSSProperties => ({
  padding:"0.42rem 0.7rem", fontSize:"0.56rem", letterSpacing:"0.1em",
  fontFamily:"'JetBrains Mono',monospace", textTransform:"uppercase" as const,
  background:active?"var(--accent)":"var(--surface)",
  border:`1px solid ${active?"var(--accent)":"var(--border)"}`,
  color:active?"#000":"var(--t2)", cursor:"pointer", borderRadius:2, transition:"all .18s",
});

const INP: React.CSSProperties = {
  width:"100%", background:"var(--surface)", border:"1px solid var(--border)",
  color:"var(--t1)", fontFamily:"Inter,sans-serif", fontSize:"0.9rem",
  padding:"0.72rem 1rem", outline:"none", borderRadius:2, boxSizing:"border-box", transition:"border-color .18s",
};

// ─── Class badge ─────────────────────────────────────────────────────────────────

function ClassBadge({ cls }: { cls: RacingClass }) {
  const m = CLS_META[cls];
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:"0.28rem", padding:"0.2rem 0.52rem", borderRadius:2, border:`1px solid ${m.color}30`, background:`${m.color}0c`, fontSize:"0.5rem", fontFamily:"'JetBrains Mono',monospace", letterSpacing:"0.12em", color:m.color }}>
      {m.icon} {m.label}
    </span>
  );
}

// ─── Team Logo ───────────────────────────────────────────────────────────────────

function TeamLogo({ abbr, color, size = 44 }: { abbr: string; color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <rect width="44" height="44" rx="3" fill={`${color}12`} stroke={color} strokeWidth="1.2" />
      <text x="22" y="29" fill={color} fontSize="11" fontFamily="'Barlow Condensed',sans-serif" fontWeight="900" textAnchor="middle">{abbr}</text>
    </svg>
  );
}

// ─── Circuit SVG ─────────────────────────────────────────────────────────────────

function CircuitSVG({ selected, onSelect }: { selected: string|null; onSelect: (id: string) => void }) {
  return (
    <svg width="100%" viewBox="0 0 540 292" fill="none" preserveAspectRatio="xMidYMid meet">
      <path d="M76 198L76 128Q76 76 128 56L258 36Q308 26 338 52L418 98Q458 122 448 164L438 198Q432 238 388 248L198 258Q138 263 98 238Z" stroke="rgba(0,200,255,0.08)" strokeWidth="28" strokeLinejoin="round" fill="none" />
      <path d="M76 198L76 128Q76 76 128 56L258 36Q308 26 338 52L418 98Q458 122 448 164L438 198Q432 238 388 248L198 258Q138 263 98 238Z" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" fill="none" opacity="0.7" />
      <line x1="76" y1="190" x2="76" y2="205" stroke="rgba(255,255,255,0.8)" strokeWidth="4" />
      <text x="50" y="183" fill="var(--t3)" fontSize="7" fontFamily="'JetBrains Mono',monospace">S/F</text>
      <line x1="78" y1="166" x2="78" y2="142" stroke="#ffd700" strokeWidth="2" strokeDasharray="4 2.5" opacity="0.7" />
      <text x="84" y="157" fill="#ffd700" fontSize="6" fontFamily="'JetBrains Mono',monospace" opacity="0.65">DRS</text>
      {CIRCUIT_TURNS.map(({ id, cx, cy }) => {
        const active = selected === id;
        return (
          <g key={id} style={{ cursor:"pointer" }} onClick={() => onSelect(active?"":id)}>
            <circle cx={cx} cy={cy} r={active?15:13} fill={active?"rgba(0,200,255,0.2)":"rgba(8,8,20,0.85)"} stroke={active?"var(--accent)":"rgba(0,200,255,0.32)"} strokeWidth={active?2:1} style={{ transition:"all .22s" }} />
            <text x={cx} y={cy+4} fill={active?"var(--accent)":"rgba(255,255,255,0.44)"} fontSize="7" fontFamily="'JetBrains Mono',monospace" textAnchor="middle" fontWeight="600">{id}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Intro ───────────────────────────────────────────────────────────────────────

function IntroScreen({ onDone }: { onDone: () => void }) {
  const [exiting, setExiting] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setExiting(true), 2800);
    const t2 = setTimeout(() => onDone(), 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);
  return (
    <div className={`intro-overlay${exiting?" exiting":""}`}>
      <div className="intro-line" style={{ top:"35%", animationDelay:"0.1s" }} />
      <div className="intro-line" style={{ top:"65%", animationDelay:"0.25s" }} />
      <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(0,200,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,255,0.03) 1px,transparent 1px)", backgroundSize:"60px 60px", opacity:0.5 }} />
      <div style={{ position:"relative", textAlign:"center", zIndex:2 }}>
        <div style={{ position:"relative", display:"inline-block" }}>
          <div className="k-display" style={{ fontSize:"clamp(3.5rem,13vw,10rem)", fontWeight:900, letterSpacing:"0.06em", color:"#fff", lineHeight:1 }}>
            {"KALCHAKRA".split("").map((l, i) => (
              <span key={i} className="intro-letter" style={{ animationDelay:`${0.18+i*0.11}s` }}>{l}</span>
            ))}
          </div>
          <div className="intro-sweep" style={{ animationDelay:"1.5s" }} />
        </div>
        <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(0,200,255,0.6),transparent)", marginTop:"0.5rem", animation:"linePulse 1s ease 1.3s forwards", opacity:0 }} />
        <div className="k-mono" style={{ fontSize:"clamp(0.52rem,1.4vw,0.72rem)", letterSpacing:"0.38em", color:"rgba(0,200,255,0.55)", marginTop:"1.1rem", animation:"subtitleIn 0.7s ease 1.9s forwards", opacity:0 }}>
          MULTINATIONAL CHAMPIONSHIP
        </div>
        <div style={{ marginTop:"0.7rem", animation:"subtitleIn 0.7s ease 2.3s forwards", opacity:0 }}>
          <div className="k-display" style={{ fontSize:"clamp(0.9rem,2.5vw,1.4rem)", fontWeight:800, letterSpacing:"0.22em", color:"rgba(255,255,255,0.32)" }}>EVERY ERA. ONE TRACK.</div>
        </div>
      </div>
    </div>
  );
}

// ─── Auth Modal ──────────────────────────────────────────────────────────────────

// ─── Participation Modal ─────────────────────────────────────────────────────────

const COUNTRIES = ["India","South Korea","United Arab Emirates","Japan","United Kingdom","Singapore","United States","Germany","Brazil","Australia","France","Italy","Spain","Netherlands","Canada","Other"];
const EXP_LEVELS = ["First Time — No racing experience","Amateur — Local/regional competitions","Semi-Pro — National competition","Professional — International competition"];

function ParticipationModal({ initial, onClose }: { initial: RacingClass; onClose: () => void }) {
  useEscape(onClose);
  const [selectedCls, setSelectedCls] = useState<RacingClass>(initial);
  const [step, setStep] = useState<"select"|"form"|"confirm">("select");
  const [regId] = useState(() => "KAL-" + Math.random().toString(36).slice(2,7).toUpperCase());

  // form state
  const [form, setForm] = useState({
    name:"", age:"", country:"India", experience: EXP_LEVELS[0],
    team:"Independent", email:"", phone:"", agreed:false,
  });
  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const entry = RACE_ENTRIES[selectedCls];
  const m = CLS_META[selectedCls];

  const canSubmit = form.name && form.age && form.email && form.agreed;

  return (
    <div style={OVERLAY} onClick={onClose}>
      <div style={{ ...MODAL(m.color), maxWidth:720, width:"100%", display:"flex", flexDirection:"column" }} onClick={e => e.stopPropagation()}>

        {/* ── Step 1: Select + details ── */}
        {step === "select" && (
          <>
            {/* Background hero */}
            <div style={{ position:"relative", height:240, overflow:"hidden", flexShrink:0 }}>
              <img src={entry.img} alt={entry.title} style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center", filter:"brightness(0.45) contrast(1.1)", transition:"all .45s ease" }} />
              <div style={{ position:"absolute", inset:0, background:`linear-gradient(0deg,var(--modal-bg) 0%,rgba(0,0,0,0.12) 100%)` }} />
              {/* Class tabs */}
              <div style={{ position:"absolute", top:"1rem", left:"1.25rem", display:"flex", gap:"0.4rem" }}>
                {(["heritage","human","motor","future"] as RacingClass[]).map(cls => {
                  const cm = CLS_META[cls];
                  const active = selectedCls === cls;
                  return (
                    <button key={cls} onClick={() => setSelectedCls(cls)}
                      style={{ background: active ? cm.color : "rgba(0,0,0,0.55)", border: `1px solid ${active ? cm.color : "rgba(255,255,255,0.15)"}`, color: active ? "#000" : "rgba(255,255,255,0.6)", fontFamily:"'JetBrains Mono',monospace", fontSize:"0.48rem", letterSpacing:"0.1em", padding:"0.32rem 0.65rem", cursor:"pointer", borderRadius:2, transition:"all .2s", fontWeight: active ? 700 : 400 }}>
                      {cm.icon} {cm.label}
                    </button>
                  );
                })}
              </div>
              <button onClick={onClose} style={{ position:"absolute", top:"0.85rem", right:"0.85rem", background:"rgba(0,0,0,0.5)", border:"1px solid rgba(255,255,255,0.15)", color:"#fff", cursor:"pointer", width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:2, fontFamily:"'JetBrains Mono',monospace", fontSize:"0.6rem" }}>✕</button>
              <div style={{ position:"absolute", bottom:"1.25rem", left:"1.5rem" }}>
                <div className="k-mono" style={{ fontSize:"0.5rem", letterSpacing:"0.3em", color:m.color, marginBottom:"0.3rem", opacity:0.85 }}>PARTICIPATE IN THE CHAMPIONSHIP</div>
                <div className="k-display" style={{ fontSize:"2.2rem", fontWeight:900, color:"#fff", lineHeight:0.92 }}>{entry.title}</div>
              </div>
            </div>

            <div style={{ padding:"1.5rem 1.75rem", overflowY:"auto" }}>
              <div style={{ display:"flex", gap:"0.5rem", alignItems:"center", marginBottom:"1rem" }}>
                <ClassBadge cls={selectedCls} />
                <span style={{ display:"inline-block", padding:"0.2rem 0.55rem", background:"rgba(0,200,100,0.08)", border:"1px solid rgba(0,200,100,0.22)", borderRadius:2, fontFamily:"'JetBrains Mono',monospace", fontSize:"0.48rem", color:"#7fff9a", letterSpacing:"0.1em" }}>● {entry.status}</span>
              </div>

              <p style={{ fontSize:"0.88rem", color:"var(--t2)", lineHeight:1.76, marginBottom:"1.4rem" }}>{entry.desc}</p>

              {/* Race spec grid */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1px", background:"var(--border)", marginBottom:"1.4rem", borderRadius:2, overflow:"hidden" }}>
                {([["VEHICLE", entry.vehicle],["RACE DISTANCE", entry.distance],["LAPS", String(entry.laps)],["NEXT RACE", entry.nextRace],["RACE DATE", entry.nextDate],["STATUS", entry.status]] as [string,string][]).map(([l,v]) => (
                  <div key={l} style={{ background:"var(--bg)", padding:"0.85rem 0.9rem" }}>
                    <div className="k-mono" style={{ fontSize:"0.44rem", color:"var(--t3)", letterSpacing:"0.14em", marginBottom:"0.28rem" }}>{l}</div>
                    <div className="k-display" style={{ fontSize:"0.95rem", fontWeight:900, color: l==="STATUS"?"#7fff9a":m.color, lineHeight:1.1 }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Entry requirements */}
              <div style={{ background:`${m.color}06`, border:`1px solid ${m.color}18`, padding:"1rem 1.1rem", borderRadius:2, marginBottom:"1.5rem" }}>
                <div className="k-mono" style={{ fontSize:"0.46rem", color:m.color, letterSpacing:"0.18em", marginBottom:"0.5rem", opacity:0.8 }}>ENTRY REQUIREMENTS</div>
                <div style={{ fontSize:"0.82rem", color:"var(--t2)" }}>{entry.requirements}</div>
              </div>

              <button className="k-btn-primary" style={{ width:"100%", justifyContent:"center", fontSize:"0.88rem", background: m.color, color: "#000" }}
                onClick={() => setStep("form")}>
                {entry.cta} →
              </button>
            </div>
          </>
        )}

        {/* ── Step 2: Registration form ── */}
        {step === "form" && (
          <>
            <div style={{ padding:"1.5rem 1.75rem", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
              <div>
                <div className="k-mono" style={{ fontSize:"0.5rem", letterSpacing:"0.26em", color:m.color, marginBottom:"0.28rem", opacity:0.8 }}>STEP 02 — REGISTRATION</div>
                <div className="k-display" style={{ fontSize:"1.55rem", fontWeight:900, color:"var(--t1)" }}>{entry.title}</div>
                <div style={{ fontSize:"0.78rem", color:"var(--t2)", marginTop:"0.1rem" }}>{entry.nextRace} · {entry.nextDate}</div>
              </div>
              <button onClick={() => setStep("select")} className="k-mono" style={{ background:"none", border:"1px solid var(--border)", color:"var(--t2)", cursor:"pointer", fontSize:"0.54rem", letterSpacing:"0.12em", padding:"0.38rem 0.72rem", borderRadius:2 }}>← BACK</button>
            </div>
            <div style={{ padding:"1.5rem 1.75rem", overflowY:"auto" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.85rem", marginBottom:"0.85rem" }}>
                {([["Full Name","name","text","Your full legal name"],["Age","age","number","18"],["Email","email","email","your@email.com"],["Phone","phone","tel","+91 00000 00000"]] as [string,string,string,string][]).map(([label,key,type,ph]) => (
                  <div key={key}>
                    <label className="k-mono" style={{ display:"block", fontSize:"0.44rem", letterSpacing:"0.18em", color:"var(--t3)", marginBottom:"0.28rem" }}>{label.toUpperCase()}</label>
                    <input type={type} placeholder={ph} value={form[key as keyof typeof form] as string}
                      onChange={e => set(key, e.target.value)}
                      style={{ ...INP }}
                      onFocus={e => (e.target.style.borderColor = m.color)}
                      onBlur={e => (e.target.style.borderColor = "var(--border)")} />
                  </div>
                ))}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.85rem", marginBottom:"0.85rem" }}>
                <div>
                  <label className="k-mono" style={{ display:"block", fontSize:"0.44rem", letterSpacing:"0.18em", color:"var(--t3)", marginBottom:"0.28rem" }}>COUNTRY</label>
                  <select value={form.country} onChange={e => set("country", e.target.value)}
                    style={{ ...INP, cursor:"pointer" }}
                    onFocus={e => (e.target.style.borderColor = m.color)}
                    onBlur={e => (e.target.style.borderColor = "var(--border)")}>
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="k-mono" style={{ display:"block", fontSize:"0.44rem", letterSpacing:"0.18em", color:"var(--t3)", marginBottom:"0.28rem" }}>TEAM / ENTRY TYPE</label>
                  <select value={form.team} onChange={e => set("team", e.target.value)}
                    style={{ ...INP, cursor:"pointer" }}
                    onFocus={e => (e.target.style.borderColor = m.color)}
                    onBlur={e => (e.target.style.borderColor = "var(--border)")}>
                    {["Independent","Factory Team","Private Team","Heritage Organisation"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom:"1.1rem" }}>
                <label className="k-mono" style={{ display:"block", fontSize:"0.44rem", letterSpacing:"0.18em", color:"var(--t3)", marginBottom:"0.28rem" }}>EXPERIENCE LEVEL</label>
                <div style={{ display:"flex", flexDirection:"column", gap:"0.32rem" }}>
                  {EXP_LEVELS.map(lvl => (
                    <div key={lvl} onClick={() => set("experience", lvl)}
                      style={{ display:"flex", alignItems:"center", gap:"0.65rem", padding:"0.6rem 0.85rem", border:`1px solid ${form.experience===lvl ? m.color : "var(--border)"}`, background: form.experience===lvl ? `${m.color}08` : "var(--surface)", cursor:"pointer", borderRadius:2, transition:"all .16s" }}>
                      <div style={{ width:12, height:12, borderRadius:"50%", border:`1.5px solid ${m.color}`, background: form.experience===lvl ? m.color : "transparent", flexShrink:0, transition:"background .16s" }} />
                      <span style={{ fontSize:"0.8rem", color:"var(--t1)" }}>{lvl}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Selected race (read-only) */}
              <div style={{ background:`${m.color}06`, border:`1px solid ${m.color}18`, padding:"0.85rem 1rem", borderRadius:2, marginBottom:"1.1rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div className="k-mono" style={{ fontSize:"0.44rem", color:m.color, letterSpacing:"0.14em", marginBottom:"0.2rem", opacity:0.8 }}>SELECTED RACE</div>
                  <div className="k-display" style={{ fontSize:"1rem", fontWeight:900, color:"var(--t1)" }}>{entry.title}</div>
                  <div style={{ fontSize:"0.74rem", color:"var(--t2)" }}>{entry.nextRace} · {entry.nextDate}</div>
                </div>
                <div style={{ fontSize:"1.8rem" }}>{m.icon}</div>
              </div>
              {/* Agreement */}
              <div onClick={() => set("agreed", !form.agreed)}
                style={{ display:"flex", alignItems:"flex-start", gap:"0.75rem", cursor:"pointer", marginBottom:"1.4rem" }}>
                <div style={{ width:18, height:18, border:`1.5px solid ${form.agreed ? m.color : "var(--border)"}`, background: form.agreed ? m.color : "transparent", borderRadius:2, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", marginTop:2, transition:"all .16s" }}>
                  {form.agreed && <span style={{ color:"#000", fontSize:"0.65rem", fontWeight:900 }}>✓</span>}
                </div>
                <span style={{ fontSize:"0.8rem", color:"var(--t2)", lineHeight:1.6 }}>I agree to the KALCHAKRA Championship Rules, confirm my entry information is accurate, and understand this is a fictional championship registration.</span>
              </div>
              <button className="k-btn-primary"
                style={{ width:"100%", justifyContent:"center", fontSize:"0.88rem", background: canSubmit ? m.color : "var(--surface)", color: canSubmit ? "#000" : "var(--t3)", cursor: canSubmit ? "pointer" : "not-allowed", border: canSubmit ? "none" : "1px solid var(--border)" }}
                onClick={() => { if (canSubmit) setStep("confirm"); }}>
                SUBMIT REGISTRATION →
              </button>
            </div>
          </>
        )}

        {/* ── Step 3: Confirmation ── */}
        {step === "confirm" && (
          <div style={{ padding:"2.5rem 2rem", textAlign:"center", position:"relative" }}>
            <button onClick={onClose} style={{ position:"absolute", top:"1rem", right:"1rem", background:"none", border:"none", color:"var(--t3)", cursor:"pointer", fontFamily:"'JetBrains Mono',monospace", fontSize:"0.6rem" }}>✕</button>
            {/* Accent line */}
            <div style={{ width:56, height:4, background:`linear-gradient(90deg,${m.color},transparent)`, margin:"0 auto 1.75rem", borderRadius:2 }} />
            <div className="k-display" style={{ fontSize:"clamp(3rem,10vw,5.5rem)", fontWeight:900, color:m.color, lineHeight:0.88, marginBottom:"0.4rem" }}>YOU'RE IN.</div>
            <p style={{ fontSize:"0.95rem", color:"var(--t2)", lineHeight:1.72, maxWidth:400, margin:"0 auto 2rem" }}>
              Your participation request for the <strong style={{ color:"var(--t1)" }}>{entry.title}</strong> has been received.
            </p>
            {/* Confirmation card */}
            <div style={{ background:"var(--surface)", border:`1px solid ${m.color}22`, borderTop:`2px solid ${m.color}`, padding:"1.5rem", borderRadius:2, maxWidth:440, margin:"0 auto 1.75rem", textAlign:"left" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1px", background:"var(--border)", marginBottom:"1rem", borderRadius:2, overflow:"hidden" }}>
                {([["RACE CLASS", CLS_META[selectedCls].label],["RACE NAME", entry.title],["PARTICIPANT", form.name || "—"],["REGISTRATION ID", regId],["NEXT RACE", entry.nextRace],["DATE", entry.nextDate]] as [string,string][]).map(([l,v]) => (
                  <div key={l} style={{ background:"var(--bg)", padding:"0.75rem 0.85rem" }}>
                    <div className="k-mono" style={{ fontSize:"0.42rem", color:"var(--t3)", letterSpacing:"0.14em", marginBottom:"0.24rem" }}>{l}</div>
                    <div className="k-display" style={{ fontSize:"0.92rem", fontWeight:900, color: l==="REGISTRATION ID" ? m.color : "var(--t1)", lineHeight:1.1 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ background:`${m.color}08`, border:`1px solid ${m.color}18`, padding:"0.75rem 0.9rem", borderRadius:2, display:"flex", gap:"0.5rem", alignItems:"center" }}>
                <span style={{ fontSize:"1.1rem" }}>{m.icon}</span>
                <span style={{ fontSize:"0.8rem", color:"var(--t2)" }}>A confirmation will be sent to <strong style={{ color:"var(--t1)" }}>{form.email || "your email"}</strong></span>
              </div>
            </div>
            <div style={{ display:"flex", gap:"0.75rem", justifyContent:"center", flexWrap:"wrap" }}>
              <button className="k-btn-primary" style={{ background: m.color, fontSize:"0.82rem", padding:"0.72rem 1.5rem" }} onClick={onClose}>
                ADD TO MY CHAMPIONSHIP →
              </button>
              <button className="k-btn-outline" style={{ fontSize:"0.82rem", padding:"0.72rem 1.5rem" }} onClick={onClose}>CLOSE</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AuthModal({ mode: initMode, onClose, onAuth }: { mode: "login"|"signup"; onClose: () => void; onAuth: (name: string, email: string) => void }) {
  useEscape(onClose);
  const [mode, setMode] = useState<"login"|"signup">(initMode);
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const submit = (e: React.FormEvent) => { e.preventDefault(); onAuth(mode==="signup"?name:"Fan", email); onClose(); };
  return (
    <div style={OVERLAY} onClick={onClose}>
      <div style={{ ...MODAL(), maxWidth:400, width:"100%" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding:"1.75rem" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
            <div>
              <div className="k-mono" style={{ fontSize:"0.5rem", letterSpacing:"0.28em", color:"var(--accent)", marginBottom:"0.3rem", opacity:0.8 }}>KALCHAKRA</div>
              <h3 className="k-display" style={{ fontSize:"1.6rem", fontWeight:900, color:"var(--t1)" }}>{mode==="login"?"SIGN IN":"CREATE ACCOUNT"}</h3>
            </div>
            <button onClick={onClose} style={{ background:"none", border:"none", color:"var(--t3)", cursor:"pointer", fontSize:"0.75rem" }}>✕</button>
          </div>
          <form onSubmit={submit}>
            {mode==="signup" && (
              <div style={{ marginBottom:"0.85rem" }}>
                <label className="k-mono" style={{ display:"block", fontSize:"0.46rem", letterSpacing:"0.2em", color:"var(--t3)", marginBottom:"0.32rem" }}>NAME</label>
                <input style={INP} value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" required onFocus={e=>(e.target.style.borderColor="var(--accent)")} onBlur={e=>(e.target.style.borderColor="var(--border)")} />
              </div>
            )}
            <div style={{ marginBottom:"0.85rem" }}>
              <label className="k-mono" style={{ display:"block", fontSize:"0.46rem", letterSpacing:"0.2em", color:"var(--t3)", marginBottom:"0.32rem" }}>EMAIL</label>
              <input style={INP} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" required onFocus={e=>(e.target.style.borderColor="var(--accent)")} onBlur={e=>(e.target.style.borderColor="var(--border)")} />
            </div>
            <div style={{ marginBottom:"1.5rem" }}>
              <label className="k-mono" style={{ display:"block", fontSize:"0.46rem", letterSpacing:"0.2em", color:"var(--t3)", marginBottom:"0.32rem" }}>PASSWORD</label>
              <input style={INP} type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" required onFocus={e=>(e.target.style.borderColor="var(--accent)")} onBlur={e=>(e.target.style.borderColor="var(--border)")} />
            </div>
            <button type="submit" className="k-btn-primary" style={{ width:"100%", justifyContent:"center" }}>{mode==="login"?"SIGN IN →":"CREATE ACCOUNT →"}</button>
          </form>
          <div style={{ textAlign:"center", marginTop:"1rem" }}>
            <button onClick={() => setMode(m=>m==="login"?"signup":"login")} style={{ background:"none", border:"none", color:"var(--t2)", cursor:"pointer", fontSize:"0.78rem", fontFamily:"Inter,sans-serif" }}>
              {mode==="login"?"Don't have an account? Create one →":"Already have an account? Sign in →"}
            </button>
          </div>
          <div style={{ borderTop:"1px solid var(--border)", marginTop:"1rem", paddingTop:"1rem", textAlign:"center" }}>
            <button onClick={onClose} className="k-mono" style={{ background:"none", border:"1px solid var(--border)", color:"var(--t2)", cursor:"pointer", fontSize:"0.56rem", letterSpacing:"0.18em", padding:"0.52rem 1.2rem", borderRadius:2 }}>CONTINUE AS FAN</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Buy Tickets Modal ───────────────────────────────────────────────────────────

function TicketsModal({ onClose }: { onClose: () => void }) {
  useEscape(onClose);
  const [selected, setSelected] = useState(0);
  const [done, setDone] = useState(false);
  const tiers = [["GRANDSTAND", "₹4,500", "Best race-day atmosphere"],["PREMIUM","₹12,000","Covered seating + hospitality"],["VIP SUITE","₹38,000","Full-race weekend access"]];
  return (
    <div style={OVERLAY} onClick={onClose}>
      <div style={{ ...MODAL(), maxWidth:460, width:"100%" }} onClick={e=>e.stopPropagation()}>
        {done ? (
          <div style={{ padding:"3rem 2rem", textAlign:"center" }}>
            <div style={{ width:54, height:54, borderRadius:"50%", background:"rgba(0,200,255,0.1)", border:"1.5px solid var(--accent)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1.5rem" }}>
              <span style={{ color:"var(--accent)", fontSize:"1.4rem" }}>✓</span>
            </div>
            <h3 className="k-display" style={{ fontSize:"1.75rem", fontWeight:900, color:"var(--t1)", marginBottom:"0.5rem" }}>BOOKING CONFIRMED</h3>
            <p style={{ color:"var(--t2)", fontSize:"0.88rem", lineHeight:1.65, marginBottom:"1.75rem" }}>Ticket confirmation will be sent to your email. Welcome to KALCHAKRA.</p>
            <button className="k-btn-primary" onClick={onClose} style={{ fontSize:"0.78rem", padding:"0.65rem 1.75rem" }}>DONE</button>
          </div>
        ) : (
          <div style={{ padding:"1.75rem" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.4rem" }}>
              <div>
                <div className="k-mono" style={{ fontSize:"0.5rem", letterSpacing:"0.28em", color:"var(--accent)", marginBottom:"0.28rem", opacity:0.8 }}>ROUND 01 · DELHI</div>
                <h3 className="k-display" style={{ fontSize:"1.5rem", fontWeight:900, color:"var(--t1)" }}>BUY TICKETS</h3>
                <div style={{ fontSize:"0.75rem", color:"var(--t2)", marginTop:"0.18rem" }}>Rajpath Circuit · 12 October 2026</div>
              </div>
              <button onClick={onClose} style={{ background:"none", border:"none", color:"var(--t3)", cursor:"pointer" }}>✕</button>
            </div>
            {tiers.map(([tier, price, desc], i) => (
              <div key={tier} onClick={()=>setSelected(i)} style={{ border:`1px solid ${selected===i?"var(--accent)":"var(--border)"}`, background: selected===i?"rgba(0,200,255,0.05)":"var(--surface)", padding:"1rem 1.1rem", marginBottom:"0.6rem", cursor:"pointer", borderRadius:2, transition:"all .18s", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div className="k-display" style={{ fontSize:"1.05rem", fontWeight:900, color:"var(--t1)" }}>{tier}</div>
                  <div style={{ fontSize:"0.75rem", color:"var(--t3)", marginTop:"0.1rem" }}>{desc}</div>
                </div>
                <div className="k-display" style={{ fontSize:"1.4rem", fontWeight:900, color:"var(--accent)" }}>{price}</div>
              </div>
            ))}
            <button className="k-btn-primary" style={{ width:"100%", justifyContent:"center", marginTop:"0.5rem" }} onClick={()=>setDone(true)}>CONFIRM PURCHASE →</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Heritage GP Modal ───────────────────────────────────────────────────────────

function HeritageModal({ onClose }: { onClose: () => void }) {
  useEscape(onClose);
  return (
    <div style={OVERLAY} onClick={onClose}>
      <div style={{ ...MODAL("#ffd700"), maxWidth:680, width:"100%" }} onClick={e=>e.stopPropagation()}>
        <div style={{ height:240, position:"relative", overflow:"hidden" }}>
          <img src={IMG.heritageCart} alt="Heritage Grand Prix" style={{ width:"100%", height:"100%", objectFit:"cover", filter:"brightness(0.6) contrast(1.08) sepia(0.15)" }} />
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(0deg,var(--modal-bg) 0%,rgba(0,0,0,0.25) 100%)" }} />
          <div style={{ position:"absolute", bottom:"1.5rem", left:"1.75rem" }}>
            <div className="k-mono" style={{ fontSize:"0.5rem", letterSpacing:"0.32em", color:"#ffd700", opacity:0.85, marginBottom:"0.4rem" }}>CLASS 01 / HERITAGE · ROUND 06</div>
            <h2 className="k-display" style={{ fontSize:"2.4rem", fontWeight:900, color:"#fff", lineHeight:0.9 }}>HERITAGE<br />GRAND PRIX</h2>
          </div>
          <button onClick={onClose} style={{ position:"absolute", top:"1rem", right:"1rem", background:"rgba(0,0,0,0.5)", border:"1px solid rgba(255,255,255,0.15)", color:"#fff", cursor:"pointer", width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:2, fontFamily:"'JetBrains Mono',monospace", fontSize:"0.62rem" }}>✕</button>
        </div>
        <div style={{ padding:"1.5rem 1.75rem" }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1px", background:"var(--border)", marginBottom:"1.5rem", borderRadius:2, overflow:"hidden" }}>
            {([["VENUE","Hyderabad"],["DATE","21 DEC 2026"],["STATUS","GRAND FINALE"]] as [string,string][]).map(([l,v])=>(
              <div key={l} style={{ background:"var(--modal-bg)", padding:"0.9rem", textAlign:"center" }}>
                <div className="k-display" style={{ fontSize:"1rem", fontWeight:900, color:"#ffd700", lineHeight:1 }}>{v}</div>
                <div className="k-mono" style={{ fontSize:"0.44rem", color:"var(--t3)", letterSpacing:"0.14em", marginTop:"0.2rem" }}>{l}</div>
              </div>
            ))}
          </div>
          <div className="k-mono" style={{ fontSize:"0.5rem", letterSpacing:"0.22em", color:"var(--t3)", marginBottom:"0.55rem" }}>RACE FORMAT</div>
          <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap", marginBottom:"1.4rem" }}>
            {["QUALIFYING","GRID","RACE","CHECKPOINTS","FINISH","PODIUM"].map((s,i,a) => (
              <span key={s} style={{ display:"inline-flex", alignItems:"center", gap:"0.4rem" }}>
                <span className="k-mono" style={{ fontSize:"0.56rem", color:"#ffd700", background:"rgba(255,215,0,0.08)", border:"1px solid rgba(255,215,0,0.2)", padding:"0.28rem 0.6rem", borderRadius:2 }}>{s}</span>
                {i<a.length-1 && <span style={{ color:"var(--t3)", fontSize:"0.65rem" }}>→</span>}
              </span>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.25rem", marginBottom:"1.4rem" }} className="k-grid-2col">
            <div style={{ background:"rgba(255,215,0,0.04)", border:"1px solid rgba(255,215,0,0.12)", padding:"1rem", borderRadius:2 }}>
              <div className="k-mono" style={{ fontSize:"0.48rem", color:"#ffd700", letterSpacing:"0.18em", marginBottom:"0.55rem", opacity:0.8 }}>DRIVER</div>
              <div className="k-display" style={{ fontSize:"1.2rem", fontWeight:900, color:"var(--t1)" }}>DEV SHARMA</div>
              <div style={{ fontSize:"0.78rem", color:"var(--t2)" }}>Parampara Racing · #09</div>
            </div>
            <div style={{ background:"rgba(255,215,0,0.04)", border:"1px solid rgba(255,215,0,0.12)", padding:"1rem", borderRadius:2 }}>
              <div className="k-mono" style={{ fontSize:"0.48rem", color:"#ffd700", letterSpacing:"0.18em", marginBottom:"0.55rem", opacity:0.8 }}>CIRCUIT</div>
              <div className="k-display" style={{ fontSize:"1.2rem", fontWeight:900, color:"var(--t1)" }}>DECCAN SPEEDWAY</div>
              <div style={{ fontSize:"0.78rem", color:"var(--t2)" }}>Hyderabad · Heritage Track</div>
            </div>
          </div>
          <div style={{ background:"rgba(255,215,0,0.04)", border:"1px solid rgba(255,215,0,0.12)", padding:"1rem 1.25rem", borderRadius:2 }}>
            <div className="k-mono" style={{ fontSize:"0.48rem", color:"#ffd700", letterSpacing:"0.18em", marginBottom:"0.65rem", opacity:0.8 }}>HERITAGE WELFARE PROTOCOL</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.38rem" }}>
              {["✓ Veterinary Check","✓ Track Monitoring","✓ Scheduled Rest","✓ Hydration Points","✓ Safety Response","✓ Welfare Monitoring"].map(p=>(
                <div key={p} style={{ fontSize:"0.78rem", color:"var(--t2)" }}>{p}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Driver Modal ────────────────────────────────────────────────────────────────

function DriverModal({ driver, auth, onClose, onFollow, onTeam, onAuthOpen }: {
  driver: Driver; auth: Auth; onClose: () => void;
  onFollow: (id: number) => void; onTeam: (t: Team) => void; onAuthOpen: () => void;
}) {
  useEscape(onClose);
  const m = CLS_META[driver.cls];
  const following = auth.followed.drivers.has(driver.id);

  return (
    <div style={OVERLAY} onClick={onClose}>
      <div style={{ ...MODAL(m.color), maxWidth:700, width:"100%" }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr" }} className="k-grid-2col">
          <div style={{ height:380, position:"relative", overflow:"hidden" }}>
            <img src={driver.img} alt={driver.name} loading="lazy" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top", filter:"brightness(0.82) contrast(1.06)" }} />
            <div style={{ position:"absolute", inset:0, background:`linear-gradient(90deg,transparent 55%,var(--modal-bg) 100%)` }} />
            <div style={{ position:"absolute", bottom:"1rem", left:"1rem" }}>
              <div className="k-display" style={{ fontSize:"4rem", fontWeight:900, color:m.color, opacity:0.15, lineHeight:1 }}>#{driver.num}</div>
            </div>
          </div>
          <div style={{ padding:"1.5rem 1.5rem 1.5rem 1rem", display:"flex", flexDirection:"column", gap:"0.75rem" }}>
            <ClassBadge cls={driver.cls} />
            <div>
              <div className="k-mono" style={{ fontSize:"0.48rem", letterSpacing:"0.22em", color:m.color, opacity:0.75, marginBottom:"0.2rem" }}>{driver.team} · #{driver.num}</div>
              <div className="k-display" style={{ fontSize:"1.9rem", fontWeight:900, color:"var(--t1)", lineHeight:1 }}>{driver.name}</div>
              <div style={{ fontSize:"0.78rem", color:"var(--t3)", marginTop:"0.12rem" }}>{driver.country} · P{driver.pos}</div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1px", background:"var(--border)" }}>
              {([["POINTS",driver.pts],["WINS",driver.wins],["PODIUMS",driver.podiums],["TOP SPEED",driver.topSpeed]] as [string,string|number][]).map(([l,v])=>(
                <div key={l as string} style={{ background:"var(--modal-bg)", padding:"0.72rem 0.6rem", textAlign:"center" }}>
                  <div className="k-display" style={{ fontSize:"1.45rem", fontWeight:900, color:m.color, lineHeight:1 }}>{v}</div>
                  <div className="k-mono" style={{ fontSize:"0.44rem", color:"var(--t3)", marginTop:"0.16rem", letterSpacing:"0.14em" }}>{l}</div>
                </div>
              ))}
            </div>
            {driver.quote && (
              <div style={{ borderLeft:`2px solid ${m.color}`, paddingLeft:"0.75rem" }}>
                <p style={{ fontStyle:"italic", fontSize:"0.8rem", color:"var(--t2)", lineHeight:1.65 }}>&ldquo;{driver.quote}&rdquo;</p>
              </div>
            )}
            <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem", marginTop:"auto" }}>
              <button onClick={() => { auth.loggedIn ? onFollow(driver.id) : onAuthOpen(); }}
                style={{ padding:"0.55rem 1rem", border:`1px solid ${following?"var(--accent)":"var(--border)"}`, background: following?"rgba(0,200,255,0.08)":"var(--surface)", color: following?"var(--accent)":"var(--t2)", fontFamily:"'JetBrains Mono',monospace", fontSize:"0.58rem", letterSpacing:"0.14em", cursor:"pointer", borderRadius:2, transition:"all .18s", textAlign:"left" }}>
                {following?"✓ FOLLOWING":"♡ FOLLOW DRIVER"}
              </button>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <button className="k-btn-outline" style={{ fontSize:"0.65rem", padding:"0.48rem 0.95rem" }} onClick={() => { const t=TEAMS.find(t=>t.name===driver.team); if(t){onTeam(t);onClose();} }}>VIEW TEAM →</button>
                <button onClick={onClose} className="k-mono" style={{ background:"none", border:"none", color:"var(--t3)", cursor:"pointer", fontSize:"0.58rem", letterSpacing:"0.18em" }}>CLOSE ✕</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Team Modal ──────────────────────────────────────────────────────────────────

function TeamModal({ team, auth, onClose, onFollow, onDriver, onAuthOpen }: {
  team: Team; auth: Auth; onClose: () => void;
  onFollow: (name: string) => void; onDriver: (d: Driver) => void; onAuthOpen: () => void;
}) {
  useEscape(onClose);
  const following = auth.followed.teams.has(team.name);
  const tDrivers = DRIVERS.filter(d => d.team === team.name);

  return (
    <div style={OVERLAY} onClick={onClose}>
      <div style={{ ...MODAL(team.color), maxWidth:560, width:"100%" }} onClick={e=>e.stopPropagation()}>
        <div style={{ height:200, position:"relative", overflow:"hidden" }}>
          <img src={team.img} alt={team.name} loading="lazy" style={{ width:"100%", height:"100%", objectFit:"cover", filter:"brightness(0.55) contrast(1.1)" }} />
          <div style={{ position:"absolute", inset:0, background:`linear-gradient(0deg,var(--modal-bg) 0%,rgba(0,0,0,0.15) 100%)` }} />
          <div style={{ position:"absolute", bottom:"1.25rem", left:"1.5rem", display:"flex", alignItems:"center", gap:"0.85rem" }}>
            <TeamLogo abbr={team.abbr} color={team.color} size={38} />
            <div>
              <ClassBadge cls={team.cls} />
              <div className="k-display" style={{ fontSize:"1.6rem", fontWeight:900, color:"#fff", lineHeight:1, marginTop:"0.22rem" }}>{team.name.toUpperCase()}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ position:"absolute", top:"0.85rem", right:"0.85rem", background:"rgba(0,0,0,0.5)", border:"1px solid rgba(255,255,255,0.15)", color:"#fff", cursor:"pointer", width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:2, fontFamily:"'JetBrains Mono',monospace", fontSize:"0.6rem" }}>✕</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1px", background:"var(--border)", margin:"0 1.5rem" }}>
          {([["POINTS",team.pts],["WINS",team.wins],["PODIUMS",team.podiums]] as [string,number][]).map(([l,v])=>(
            <div key={l} style={{ background:"var(--modal-bg)", padding:"1rem", textAlign:"center" }}>
              <div className="k-display" style={{ fontSize:"2rem", fontWeight:900, color:team.color, lineHeight:1 }}>{v}</div>
              <div className="k-mono" style={{ fontSize:"0.46rem", color:"var(--t3)", letterSpacing:"0.14em", marginTop:"0.2rem" }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ padding:"1.25rem 1.5rem 1.75rem" }}>
          <p style={{ fontSize:"0.85rem", color:"var(--t2)", lineHeight:1.72, marginBottom:"1.1rem" }}>{team.desc}</p>
          <div className="k-mono" style={{ fontSize:"0.48rem", color:"var(--t3)", letterSpacing:"0.2em", marginBottom:"0.55rem" }}>DRIVERS</div>
          <div style={{ display:"flex", gap:"0.65rem", flexWrap:"wrap", marginBottom:"1.1rem" }}>
            {tDrivers.map(d=>(
              <div key={d.id} onClick={()=>{onClose();setTimeout(()=>onDriver(d),80);}} style={{ display:"flex", alignItems:"center", gap:"0.65rem", border:`1px solid ${team.color}22`, background:`${team.color}06`, padding:"0.6rem 0.85rem", cursor:"pointer", borderRadius:2, transition:"all .18s" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=team.color;e.currentTarget.style.background=`${team.color}14`;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=`${team.color}22`;e.currentTarget.style.background=`${team.color}06`;}}>
                <img src={d.img} alt={d.name} loading="lazy" style={{ width:36, height:36, objectFit:"cover", objectPosition:"top", borderRadius:2, filter:"brightness(0.82)" }} />
                <div>
                  <div className="k-mono" style={{ fontSize:"0.48rem", color:team.color, marginBottom:"0.1rem" }}>#{d.num}</div>
                  <div className="k-display" style={{ fontSize:"0.9rem", fontWeight:800, color:"var(--t1)" }}>{d.name}</div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={()=>{ auth.loggedIn?onFollow(team.name):onAuthOpen(); }}
            style={{ padding:"0.52rem 1rem", border:`1px solid ${following?"var(--accent)":"var(--border)"}`, background:following?"rgba(0,200,255,0.08)":"var(--surface)", color:following?"var(--accent)":"var(--t2)", fontFamily:"'JetBrains Mono',monospace", fontSize:"0.56rem", letterSpacing:"0.14em", cursor:"pointer", borderRadius:2, transition:"all .18s" }}>
            {following?"✓ FOLLOWING TEAM":"♡ FOLLOW TEAM"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Navigation ──────────────────────────────────────────────────────────────────

function Nav({ page, go, scrolled, theme, toggleTheme, auth, onAuthOpen, onTickets, onLogout }: {
  page: Page; go: (p: Page) => void; scrolled: boolean;
  theme: Theme; toggleTheme: () => void;
  auth: Auth; onAuthOpen: () => void; onTickets: () => void; onLogout: () => void;
}) {
  const [mobile, setMobile] = useState(false);
  const links: {label: string; key: Page}[] = [
    {label:"CHAMPIONSHIP",key:"home"},{label:"RACING",key:"racing"},
    {label:"DRIVERS",key:"drivers"},{label:"TEAMS",key:"teams"},
    {label:"STANDINGS",key:"standings"},{label:"RACE CENTER",key:"race-center"},
  ];
  const nav = (p: Page) => { go(p); setMobile(false); };
  return (
    <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:300, background:scrolled||mobile?"var(--nav-bg)":"transparent", borderBottom:scrolled?"1px solid var(--border)":"1px solid transparent", backdropFilter:scrolled||mobile?"blur(18px)":"none", transition:"all .32s ease" }}>
      <div style={{ maxWidth:1440, margin:"0 auto", padding:"0 2rem", display:"flex", alignItems:"center", height:64, gap:"1rem" }}>
        <button onClick={()=>nav("home")} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:"0.5rem", flexShrink:0, padding:0 }}>
          <svg viewBox="0 0 28 28" fill="none" width="24" height="24">
            <circle cx="14" cy="14" r="12" stroke="var(--accent)" strokeWidth="1.3" />
            <circle cx="14" cy="14" r="3.5" fill="var(--accent)" opacity="0.9" />
            {Array.from({length:8},(_,i)=>i*45).map((a,i)=>(
              <line key={i} x1={14+3.5*Math.cos(a*Math.PI/180)} y1={14+3.5*Math.sin(a*Math.PI/180)} x2={14+10.5*Math.cos(a*Math.PI/180)} y2={14+10.5*Math.sin(a*Math.PI/180)} stroke="var(--accent)" strokeWidth="1.2" opacity="0.6" />
            ))}
          </svg>
          <span className="k-display" style={{ fontSize:"0.9rem", fontWeight:900, letterSpacing:"0.1em", color:"var(--t1)" }}>KALCHAKRA</span>
        </button>
        <div className="k-nav-links" style={{ flex:1, display:"flex", justifyContent:"center", gap:"1.4rem" }}>
          {links.map(({label,key})=>(
            <button key={key} onClick={()=>nav(key)} className="k-mono" style={{ background:"none", border:"none", borderBottom:`1.5px solid ${page===key?"var(--accent)":"transparent"}`, cursor:"pointer", fontSize:"0.56rem", letterSpacing:"0.16em", color:page===key?"var(--accent)":"var(--t2)", transition:"color .18s", padding:"0.16rem 0", whiteSpace:"nowrap" }}>{label}</button>
          ))}
        </div>
        <div className="k-nav-links" style={{ display:"flex", alignItems:"center", gap:"0.65rem" }}>
          <button onClick={toggleTheme} className="k-mono" style={{ background:"none", border:"1px solid var(--border)", color:"var(--t2)", cursor:"pointer", fontSize:"0.56rem", letterSpacing:"0.1em", padding:"0.36rem 0.65rem", borderRadius:2, transition:"all .22s" }}>{theme==="dark"?"☀":"☾"}</button>
          {auth.loggedIn ? (
            <>
              <button onClick={()=>nav("dashboard")} style={{ background:"none", border:"1px solid var(--border)", color:"var(--t2)", cursor:"pointer", fontFamily:"Inter,sans-serif", fontSize:"0.78rem", padding:"0.36rem 0.75rem", borderRadius:2, transition:"all .22s" }}>MY KALCHAKRA</button>
              <button onClick={onLogout} className="k-mono" style={{ background:"none", border:"none", color:"var(--t3)", cursor:"pointer", fontSize:"0.52rem" }}>SIGN OUT</button>
            </>
          ) : (
            <button onClick={onAuthOpen} className="k-mono" style={{ background:"none", border:"1px solid var(--border)", color:"var(--t2)", cursor:"pointer", fontSize:"0.56rem", letterSpacing:"0.1em", padding:"0.36rem 0.75rem", borderRadius:2, transition:"all .22s" }}>SIGN IN</button>
          )}
          <button className="k-btn-primary" style={{ fontSize:"0.66rem", padding:"0.52rem 1.15rem" }} onClick={onTickets}>BUY TICKETS</button>
        </div>
        <button onClick={()=>setMobile(o=>!o)} className="k-hamburger" style={{ background:"none", border:"none", cursor:"pointer", marginLeft:"auto", padding:"6px 0", display:"none", flexDirection:"column", gap:5, flexShrink:0 }}>
          <span style={{ display:"block", width:22, height:1.5, background:"var(--t1)", transition:"transform .28s,opacity .28s", transform:mobile?"rotate(45deg) translate(0,6.5px)":"none" }} />
          <span style={{ display:"block", width:22, height:1.5, background:"var(--t1)", opacity:mobile?0:1, transition:"opacity .28s" }} />
          <span style={{ display:"block", width:22, height:1.5, background:"var(--t1)", transition:"transform .28s", transform:mobile?"rotate(-45deg) translate(0,-6.5px)":"none" }} />
        </button>
      </div>
      {mobile && (
        <div style={{ borderTop:"1px solid var(--border)", padding:"1.2rem 2rem 1.6rem", background:"var(--nav-bg)" }}>
          {links.map(({label,key})=>(
            <button key={key} onClick={()=>nav(key)} className="k-display" style={{ display:"block", width:"100%", textAlign:"left", background:"none", border:"none", borderBottom:"1px solid var(--border)", cursor:"pointer", fontSize:"1.55rem", fontWeight:900, letterSpacing:"0.04em", color:page===key?"var(--accent)":"var(--t1)", padding:"0.65rem 0" }}>{label}</button>
          ))}
          <div style={{ display:"flex", gap:"0.65rem", marginTop:"1rem", flexWrap:"wrap" }}>
            <button className="k-btn-primary" style={{ flex:1, justifyContent:"center", fontSize:"0.88rem" }} onClick={()=>{setMobile(false);onTickets();}}>BUY TICKETS</button>
            {!auth.loggedIn && <button onClick={()=>{setMobile(false);onAuthOpen();}} style={{ flex:1, background:"var(--surface)", border:"1px solid var(--border)", color:"var(--t1)", fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, letterSpacing:"0.12em", fontSize:"0.88rem", cursor:"pointer", borderRadius:2 }}>SIGN IN</button>}
            <button onClick={toggleTheme} className="k-mono" style={{ background:"var(--surface)", border:"1px solid var(--border)", color:"var(--t2)", cursor:"pointer", fontSize:"0.7rem", padding:"0 0.9rem", borderRadius:2 }}>{theme==="dark"?"☀":"☾"}</button>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Driver Card ─────────────────────────────────────────────────────────────────

function DriverCard({ driver, onClick }: { driver: Driver; onClick: () => void }) {
  const m = CLS_META[driver.cls];
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} style={{ background:"var(--surface)", border:`1px solid var(--border)`, borderTop:`2px solid ${hov?m.color:m.color+"44"}`, cursor:"pointer", overflow:"hidden", transition:"all .26s ease", transform:hov?"translateY(-5px)":"none", boxShadow:hov?`0 20px 50px rgba(0,0,0,0.42),0 0 28px ${m.color}0a`:"none" }}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <div style={{ height:200, position:"relative", overflow:"hidden" }}>
        <img src={driver.img} alt={driver.name} loading="lazy" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top", filter:"brightness(0.82) contrast(1.06)", transform:hov?"scale(1.05)":"scale(1)", transition:"transform .52s ease" }} />
        <div style={{ position:"absolute", inset:0, background:`linear-gradient(0deg,var(--bg) 0%,transparent 50%)` }} />
        <div style={{ position:"absolute", top:"0.7rem", right:"0.7rem" }}><ClassBadge cls={driver.cls} /></div>
        <div style={{ position:"absolute", bottom:"-0.4rem", left:"0.5rem" }}>
          <div className="k-display" style={{ fontSize:"4.5rem", fontWeight:900, color:m.color, opacity:0.1, lineHeight:1 }}>{driver.num}</div>
        </div>
        {hov && <div style={{ position:"absolute", bottom:"0.65rem", right:"0.75rem", fontFamily:"'JetBrains Mono',monospace", fontSize:"0.5rem", color:m.color, letterSpacing:"0.14em", animation:"fadeUp 0.18s ease" }}>VIEW PROFILE →</div>}
      </div>
      <div style={{ padding:"0.85rem 1.1rem 1.2rem" }}>
        <div className="k-mono" style={{ fontSize:"0.46rem", letterSpacing:"0.2em", color:m.color, opacity:0.75, marginBottom:"0.16rem" }}>{driver.team}</div>
        <div className="k-display" style={{ fontSize:"1.1rem", fontWeight:900, color:"var(--t1)", lineHeight:1, marginBottom:"0.15rem" }}>{driver.name}</div>
        <div style={{ fontSize:"0.72rem", color:"var(--t3)", marginBottom:"0.85rem" }}>{driver.country} · #{driver.num}</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"0.35rem", borderTop:"1px solid var(--border)", paddingTop:"0.75rem" }}>
          {([["PTS",driver.pts],["WINS",driver.wins],["POD",driver.podiums]] as [string,number][]).map(([l,v])=>(
            <div key={l}>
              <div className="k-display" style={{ fontSize:"1.2rem", fontWeight:900, color:m.color, lineHeight:1 }}>{v}</div>
              <div className="k-mono" style={{ fontSize:"0.44rem", color:"var(--t3)", letterSpacing:"0.14em", marginTop:"0.08rem" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Pages ───────────────────────────────────────────────────────────────────────


// ─── Participate Section ─────────────────────────────────────────────────────────

function ParticipateSection({ onParticipate }: { onParticipate: (cls: RacingClass) => void }) {
  const [selected, setSelected] = useState<RacingClass>("future");
  const entry = RACE_ENTRIES[selected];
  const m = CLS_META[selected];

  return (
    <section style={{ background:"var(--bg)", padding:"6rem 2rem" }}>
      <div style={{ maxWidth:1280, margin:"0 auto" }}>
        <Reveal>
          <div className="k-mono" style={{ fontSize:"0.58rem", letterSpacing:"0.3em", color:"var(--accent)", marginBottom:"0.55rem", opacity:0.7 }}>JOIN THE CHAMPIONSHIP</div>
          <h2 className="k-display" style={{ fontSize:"clamp(2.5rem,7vw,5.5rem)", fontWeight:900, color:"var(--t1)", lineHeight:0.9, marginBottom:"0.4rem" }}>PARTICIPATE IN THE</h2>
          <h2 className="k-display" style={{ fontSize:"clamp(2.5rem,7vw,5.5rem)", fontWeight:900, color:"var(--accent)", lineHeight:0.9, marginBottom:"1rem" }}>CHAMPIONSHIP</h2>
          <p style={{ color:"var(--t2)", fontSize:"0.95rem", marginBottom:"2.75rem", maxWidth:520 }}>Choose your era. Choose your race. Enter the KALCHAKRA Championship — the only motorsport on earth where every age of human transport competes as one.</p>
        </Reveal>

        {/* Race selector tabs */}
        <Reveal delay={0.06}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1px", background:"var(--border)", marginBottom:"1.5rem", borderRadius:"3px 3px 0 0", overflow:"hidden" }}>
            {(["heritage","human","motor","future"] as RacingClass[]).map((cls,i) => {
              const cm = CLS_META[cls];
              const active = selected === cls;
              return (
                <button key={cls} onClick={() => setSelected(cls)}
                  style={{ background: active ? `${cm.color}12` : "var(--bg2)", border:"none", borderTop:`3px solid ${active ? cm.color : "transparent"}`, cursor:"pointer", padding:"1.1rem 0.75rem", textAlign:"left", transition:"all .22s" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"0.22rem" }}>
                    <span style={{ fontSize:"1.2rem" }}>{cm.icon}</span>
                    <span className="k-mono" style={{ fontSize:"0.46rem", color: active ? cm.color : "var(--t3)", letterSpacing:"0.14em" }}>{"0"+String(i+1)}</span>
                  </div>
                  <div className="k-display" style={{ fontSize:"1rem", fontWeight:900, color: active ? "var(--t1)" : "var(--t2)", lineHeight:1, marginBottom:"0.1rem" }}>{cm.label}</div>
                  <div style={{ fontSize:"0.72rem", color: active ? cm.color : "var(--t3)" }}>{cm.sub}</div>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Selected race detail panel */}
        <Reveal delay={0.1}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0", background:"var(--surface)", border:`1px solid ${m.color}22`, borderRadius:"0 0 3px 3px", overflow:"hidden", transition:"all .38s ease" }} className="k-grid-2col">

            {/* Left: image */}
            <div style={{ position:"relative", minHeight:400, overflow:"hidden" }}>
              <img src={entry.img} alt={entry.title} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center", filter:"brightness(0.52) contrast(1.1)", transition:"all .5s ease" }} />
              <div style={{ position:"absolute", inset:0, background:`linear-gradient(90deg,transparent 55%,var(--bg) 100%),linear-gradient(0deg,rgba(0,0,0,0.82) 0%,transparent 50%)` }} />
              <div style={{ position:"absolute", top:"1.25rem", left:"1.25rem" }}>
                <ClassBadge cls={selected} />
              </div>
              <div style={{ position:"absolute", bottom:"1.5rem", left:"1.5rem" }}>
                <div style={{ fontSize:"3.5rem", marginBottom:"0.25rem" }}>{m.icon}</div>
                <div className="k-mono" style={{ fontSize:"0.48rem", color:m.color, letterSpacing:"0.22em", opacity:0.82, marginBottom:"0.2rem" }}>{entry.vehicle}</div>
                <div className="k-display" style={{ fontSize:"1.75rem", fontWeight:900, color:"#fff", lineHeight:0.92 }}>{entry.title}</div>
              </div>
            </div>

            {/* Right: race info + CTA */}
            <div style={{ padding:"2rem 2rem 2rem 1.75rem", display:"flex", flexDirection:"column", gap:"1.1rem" }}>
              <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap", alignItems:"center" }}>
                <span style={{ display:"inline-block", padding:"0.2rem 0.6rem", background:"rgba(0,200,100,0.08)", border:"1px solid rgba(0,200,100,0.22)", borderRadius:2, fontFamily:"'JetBrains Mono',monospace", fontSize:"0.46rem", color:"#7fff9a", letterSpacing:"0.1em" }}>● {entry.status}</span>
              </div>

              <p style={{ fontSize:"0.88rem", color:"var(--t2)", lineHeight:1.76 }}>{entry.desc}</p>

              {/* Race stats */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1px", background:"var(--border)", borderRadius:2, overflow:"hidden" }}>
                {([["DISTANCE", entry.distance],["LAPS", String(entry.laps)],["NEXT RACE", entry.nextDate]] as [string,string][]).map(([l,v]) => (
                  <div key={l} style={{ background:"var(--bg)", padding:"0.75rem 0.7rem" }}>
                    <div className="k-display" style={{ fontSize:"1.15rem", fontWeight:900, color:m.color, lineHeight:1 }}>{v}</div>
                    <div className="k-mono" style={{ fontSize:"0.42rem", color:"var(--t3)", letterSpacing:"0.12em", marginTop:"0.14rem" }}>{l}</div>
                  </div>
                ))}
              </div>

              {/* Venue */}
              <div style={{ borderLeft:`2px solid ${m.color}44`, paddingLeft:"0.9rem" }}>
                <div className="k-mono" style={{ fontSize:"0.44rem", color:"var(--t3)", letterSpacing:"0.16em", marginBottom:"0.2rem" }}>NEXT AVAILABLE RACE</div>
                <div className="k-display" style={{ fontSize:"1.1rem", fontWeight:900, color:"var(--t1)" }}>{entry.nextRace}</div>
                <div style={{ fontSize:"0.78rem", color:m.color }}>{entry.nextDate}</div>
              </div>

              {/* Requirements */}
              <div style={{ background:`${m.color}06`, border:`1px solid ${m.color}16`, padding:"0.9rem 1rem", borderRadius:2 }}>
                <div className="k-mono" style={{ fontSize:"0.44rem", color:m.color, letterSpacing:"0.16em", marginBottom:"0.3rem", opacity:0.8 }}>ENTRY REQUIREMENTS</div>
                <div style={{ fontSize:"0.8rem", color:"var(--t2)" }}>{entry.requirements}</div>
              </div>

              {/* CTA */}
              <button className="k-btn-primary"
                style={{ marginTop:"auto", justifyContent:"space-between", background:m.color, fontSize:"0.88rem", padding:"0.9rem 1.5rem" }}
                onClick={() => onParticipate(selected)}>
                <span>PARTICIPATE NOW</span>
                <span>→</span>
              </button>
              <div style={{ fontSize:"0.7rem", color:"var(--t3)", textAlign:"center" }}>Fictional championship registration · No real competition implied</div>
            </div>
          </div>
        </Reveal>

        {/* Quick-enter row */}
        <Reveal delay={0.16}>
          <div style={{ display:"flex", gap:"0.65rem", marginTop:"1.5rem", flexWrap:"wrap" }}>
            {(["heritage","human","motor","future"] as RacingClass[]).map(cls => {
              const cm = CLS_META[cls];
              const re = RACE_ENTRIES[cls];
              return (
                <button key={cls} onClick={() => onParticipate(cls)}
                  style={{ flex:1, minWidth:160, background:"var(--surface)", border:`1px solid ${cm.color}22`, padding:"0.85rem 1rem", cursor:"pointer", borderRadius:2, textAlign:"left", transition:"all .22s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = cm.color; e.currentTarget.style.background = `${cm.color}08`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = `${cm.color}22`; e.currentTarget.style.background = "var(--surface)"; }}>
                  <div style={{ fontSize:"1.4rem", marginBottom:"0.28rem" }}>{cm.icon}</div>
                  <div className="k-display" style={{ fontSize:"0.92rem", fontWeight:900, color:"var(--t1)", lineHeight:1, marginBottom:"0.12rem" }}>{re.cta}</div>
                  <div style={{ fontSize:"0.7rem", color:cm.color }}>{re.nextRace}</div>
                </button>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function HomePage({ go, auth, onAuthOpen, onDriver, onTeam, onHeritage, onTickets, onParticipate }: {
  go: (p: Page) => void; auth: Auth; onAuthOpen: () => void;
  onDriver: (d: Driver) => void; onTeam: (t: Team) => void;
  onHeritage: () => void; onTickets: () => void; onParticipate: (cls: RacingClass) => void;
}) {
  const [scrollY, setScrollY] = useState(0);
  const [hoverCls, setHoverCls] = useState<RacingClass|null>(null);
  const [selectedRound, setSelectedRound] = useState<Round|null>(null);

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn, { passive:true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const devSharma = DRIVERS.find(d=>d.id===2)!;

  return (
    <>
      {/* ── Hero ── */}
      <section style={{ minHeight:"100svh", position:"relative", display:"flex", alignItems:"center", overflow:"hidden", background:"#020208" }}>
        <div style={{ position:"absolute", inset:"-10% 0", overflow:"hidden" }}>
          <img src={IMG.hero} alt="KALCHAKRA Racing" style={{ width:"100%", height:"120%", objectFit:"cover", objectPosition:"center", transform:`translateY(${scrollY*0.28}px)`, filter:"brightness(0.55) contrast(1.12) saturate(0.88)", willChange:"transform" }} />
        </div>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(90deg,rgba(2,2,12,0.92) 40%,rgba(2,2,12,0.28) 100%)" }} />
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(0deg,rgba(2,2,12,0.95) 0%,transparent 55%)" }} />
        <div className="k-grid-bg" style={{ position:"absolute", inset:0, opacity:0.3 }} />
        <div style={{ position:"relative", zIndex:2, maxWidth:1280, margin:"0 auto", padding:"8rem 2rem 5rem", width:"100%" }}>
          <div style={{ animation:"fadeUp 0.7s ease 0.1s both" }}>
            <div style={{ display:"flex", gap:"0.65rem", flexWrap:"wrap", marginBottom:"1.5rem" }}>
              {(["heritage","human","motor","future"] as RacingClass[]).map(cls=>(
                <div key={cls} style={{ display:"inline-flex", alignItems:"center", gap:"0.28rem", padding:"0.22rem 0.6rem", border:`1px solid ${CLS_META[cls].color}30`, background:`${CLS_META[cls].color}0c`, fontSize:"0.5rem", fontFamily:"'JetBrains Mono',monospace", letterSpacing:"0.1em", color:CLS_META[cls].color }}>
                  {CLS_META[cls].icon} {CLS_META[cls].sub}
                </div>
              ))}
            </div>
            <div className="k-mono" style={{ fontSize:"0.56rem", letterSpacing:"0.36em", color:"var(--accent)", marginBottom:"1.2rem", opacity:0.75 }}>KALCHAKRA MULTINATIONAL CHAMPIONSHIP · 2026</div>
          </div>
          <div style={{ animation:"fadeUp 0.7s ease 0.22s both" }}>
            <h1 className="k-display" style={{ fontSize:"clamp(3rem,10vw,9rem)", fontWeight:900, lineHeight:0.88, color:"#fff", letterSpacing:"-0.01em", marginBottom:"0.2rem" }}>EVERY ERA.</h1>
            <h1 className="k-display" style={{ fontSize:"clamp(3rem,10vw,9rem)", fontWeight:900, lineHeight:0.88, color:"var(--accent)", letterSpacing:"-0.01em", marginBottom:"1.5rem" }}>ONE TRACK.</h1>
          </div>
          <div style={{ animation:"fadeUp 0.7s ease 0.38s both" }}>
            <p style={{ fontSize:"1rem", color:"rgba(255,255,255,0.44)", maxWidth:420, lineHeight:1.76, marginBottom:"2.5rem" }}>Where heritage, human power, machine and future meet on one track.</p>
            <div style={{ display:"flex", gap:"0.85rem", flexWrap:"wrap", marginBottom:"3.5rem" }}>
              <button className="k-btn-primary" onClick={onTickets}>BUY TICKETS →</button>
              <button className="k-btn-outline" onClick={()=>go("racing")}>EXPLORE CHAMPIONSHIP</button>
            </div>
          </div>
          {/* Next race panel */}
          <div style={{ animation:"fadeUp 0.7s ease 0.52s both" }}>
            <div style={{ display:"inline-block", background:"rgba(0,0,0,0.58)", border:"1px solid rgba(0,200,255,0.16)", borderLeft:"3px solid var(--accent)", padding:"1.5rem 1.9rem", backdropFilter:"blur(10px)" }}>
              <div className="k-mono" style={{ fontSize:"0.5rem", letterSpacing:"0.32em", color:"var(--accent)", marginBottom:"0.7rem", opacity:0.75 }}>NEXT RACE</div>
              <div style={{ display:"flex", gap:"2rem", flexWrap:"wrap", alignItems:"flex-start" }}>
                <div>
                  <div className="k-display" style={{ fontSize:"1.4rem", fontWeight:900, color:"#fff", lineHeight:1, marginBottom:"0.18rem" }}>ROUND 01 · DELHI</div>
                  <div className="k-display" style={{ fontSize:"0.9rem", fontWeight:700, color:"var(--accent)", letterSpacing:"0.06em", marginBottom:"0.16rem" }}>RAJPATH CIRCUIT · INDIA</div>
                  <div style={{ fontSize:"0.73rem", color:"rgba(255,255,255,0.36)", marginBottom:"1.1rem" }}>12 October 2026 · 18:00 IST</div>
                  <Countdown compact />
                </div>
              </div>
              <div style={{ display:"flex", gap:"0.65rem", marginTop:"1.1rem", flexWrap:"wrap" }}>
                <button className="k-btn-outline" style={{ fontSize:"0.66rem", padding:"0.48rem 1rem" }} onClick={()=>go("race-center")}>RACE CENTER →</button>
                <button className="k-btn-primary" style={{ fontSize:"0.66rem", padding:"0.48rem 1rem" }} onClick={onTickets}>BUY TICKETS</button>
              </div>
            </div>
          </div>
        </div>
        <div style={{ position:"absolute", bottom:"2rem", left:"50%", transform:"translateX(-50%)", textAlign:"center" }}>
          <div className="k-mono" style={{ fontSize:"0.5rem", letterSpacing:"0.22em", color:"rgba(255,255,255,0.3)" }}>SCROLL TO DISCOVER ↓</div>
        </div>
      </section>

      {/* ── What Are They Racing ── */}
      <section style={{ background:"var(--bg2)", padding:"6rem 2rem" }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <Reveal>
            <div className="k-mono" style={{ fontSize:"0.58rem", letterSpacing:"0.32em", color:"var(--accent)", marginBottom:"0.75rem", opacity:0.7 }}>THE CHAMPIONSHIP</div>
            <h2 className="k-display" style={{ fontSize:"clamp(2rem,5vw,3.8rem)", fontWeight:900, color:"var(--t1)", lineHeight:0.9, marginBottom:"0.5rem" }}>WHAT ARE THEY RACING?</h2>
            <p style={{ color:"var(--t2)", marginBottom:"2.75rem", fontSize:"0.95rem" }}>FOUR ERAS. FOUR MACHINES. ONE CHAMPIONSHIP.</p>
          </Reveal>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1px", background:"var(--border)" }} className="k-grid-2col">
            {(["heritage","human","motor","future"] as RacingClass[]).map((cls,i)=>{
              const m = CLS_META[cls];
              const hov = hoverCls===cls;
              return (
                <Reveal key={cls} delay={i*0.08}>
                  <div onClick={()=>go("racing")} style={{ position:"relative", height:340, overflow:"hidden", cursor:"pointer", background:"var(--bg)" }}
                    onMouseEnter={()=>setHoverCls(cls)} onMouseLeave={()=>setHoverCls(null)}>
                    <img src={m.img} alt={m.label} loading="lazy" style={{ width:"100%", height:"100%", objectFit:"cover", filter:`brightness(${hov?"0.55":"0.38"}) contrast(1.1)`, transform:hov?"scale(1.07)":"scale(1)", transition:"all .55s ease" }} />
                    <div style={{ position:"absolute", inset:0, background:`linear-gradient(0deg,rgba(0,0,0,0.88) 0%,rgba(0,0,0,0.1) 100%)` }} />
                    <div style={{ position:"absolute", inset:0, border:`2px solid ${hov?m.color:"transparent"}`, transition:"border-color .3s" }} />
                    <div style={{ position:"absolute", bottom:"1.4rem", left:"1.25rem" }}>
                      <div style={{ fontSize:"2rem", marginBottom:"0.3rem" }}>{m.icon}</div>
                      <div className="k-mono" style={{ fontSize:"0.46rem", letterSpacing:"0.22em", color:m.color, marginBottom:"0.2rem" }}>CLASS {String(i+1).padStart(2,"0")}</div>
                      <div className="k-display" style={{ fontSize:"1.25rem", fontWeight:900, color:"#fff", lineHeight:1 }}>{m.label}</div>
                      <div className="k-display" style={{ fontSize:"0.9rem", fontWeight:700, color:m.color, marginBottom:"0.3rem" }}>{m.sub}</div>
                      <div style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.5)" }}>{["Where the journey began.","Speed powered by people.","Man meets machine.","Engineering beyond tomorrow."][i]}</div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Heritage Grand Prix (Signature) ── */}
      <section style={{ position:"relative", overflow:"hidden", minHeight:"80vh", display:"flex", alignItems:"center", background:"#000" }}>
        <div style={{ position:"absolute", inset:0 }}>
          <img src={IMG.heritageOx} alt="Heritage Grand Prix" style={{ width:"100%", height:"100%", objectFit:"cover", filter:"brightness(0.32) contrast(1.1) sepia(0.25)" }} />
        </div>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(90deg,rgba(0,0,0,0.92) 50%,rgba(0,0,0,0.35) 100%)" }} />
        <div style={{ position:"absolute", top:0, bottom:0, left:0, width:4, background:"linear-gradient(180deg,transparent,#ffd700,transparent)" }} />
        <div style={{ position:"relative", zIndex:2, maxWidth:1280, margin:"0 auto", padding:"5rem 2rem" }}>
          <Reveal>
            <div className="k-mono" style={{ fontSize:"0.54rem", letterSpacing:"0.36em", color:"#ffd700", marginBottom:"1rem", opacity:0.85 }}>CLASS 01 / HERITAGE</div>
            <h2 className="k-display" style={{ fontSize:"clamp(3rem,9vw,8rem)", fontWeight:900, lineHeight:0.88, color:"#fff", marginBottom:"0.2rem" }}>HERITAGE</h2>
            <h2 className="k-display" style={{ fontSize:"clamp(3rem,9vw,8rem)", fontWeight:900, lineHeight:0.88, color:"#ffd700", marginBottom:"1.5rem" }}>GRAND PRIX</h2>
            <div className="k-display" style={{ fontSize:"clamp(1.2rem,3vw,2rem)", fontWeight:700, color:"rgba(255,255,255,0.5)", lineHeight:1.2, marginBottom:"0.3rem" }}>THE OLDEST MACHINE.</div>
            <div className="k-display" style={{ fontSize:"clamp(1.2rem,3vw,2rem)", fontWeight:700, color:"rgba(255,255,255,0.5)", lineHeight:1.2, marginBottom:"2rem" }}>THE NEWEST CHALLENGE.</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,auto)", gap:"2.5rem", marginBottom:"2.5rem" }} className="k-grid-2col">
              {([["DRIVER","DEV SHARMA"],["TEAM","PARAMPARA RACING"],["RACE","ROUND 06 · HYDERABAD"]] as [string,string][]).map(([l,v])=>(
                <div key={l} style={{ borderTop:"1px solid rgba(255,215,0,0.22)", paddingTop:"0.75rem" }}>
                  <div className="k-mono" style={{ fontSize:"0.46rem", letterSpacing:"0.22em", color:"rgba(255,215,0,0.55)", marginBottom:"0.3rem" }}>{l}</div>
                  <div className="k-display" style={{ fontSize:"1.05rem", fontWeight:900, color:"#fff" }}>{v}</div>
                </div>
              ))}
            </div>
            <button className="k-btn-primary" style={{ background:"#ffd700", fontSize:"0.9rem", padding:"0.9rem 2rem" }} onClick={onHeritage}>ENTER HERITAGE GRAND PRIX →</button>
          </Reveal>
        </div>
      </section>

      {/* ── Heritage Driver Dev Sharma ── */}
      <section style={{ background:"var(--bg3)", padding:"5rem 2rem" }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4rem", alignItems:"center" }} className="k-grid-2col">
            <Reveal>
              <div style={{ position:"relative", height:440, overflow:"hidden", borderRadius:2 }}>
                <img src={devSharma.img} alt="Dev Sharma" loading="lazy" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top", filter:"brightness(0.8) contrast(1.06) sepia(0.08)" }} />
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(90deg,transparent 55%,var(--bg3) 100%),linear-gradient(0deg,var(--bg3) 0%,transparent 40%)" }} />
                <div style={{ position:"absolute", bottom:"1.25rem", left:"1.25rem" }}>
                  <div className="k-mono" style={{ fontSize:"0.48rem", color:"#ffd700", letterSpacing:"0.2em", opacity:0.8 }}>PARAMPARA RACING · #09</div>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.14}>
              <div className="k-mono" style={{ fontSize:"0.54rem", letterSpacing:"0.28em", color:"#ffd700", marginBottom:"0.8rem", opacity:0.8 }}>HERITAGE DRIVER</div>
              <h3 className="k-display" style={{ fontSize:"clamp(2rem,5vw,3.5rem)", fontWeight:900, color:"var(--t1)", lineHeight:0.9, marginBottom:"0.8rem" }}>DEV SHARMA</h3>
              <div className="k-display" style={{ fontSize:"4.5rem", fontWeight:900, color:"#ffd700", opacity:0.12, lineHeight:1, marginBottom:"1rem", marginTop:"-0.5rem" }}>#09</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem", marginBottom:"1.5rem" }}>
                {([["03","HERITAGE WINS"],["09","RACE NUMBER"],["01","HERITAGE CUP"]] as [string,string][]).map(([v,l])=>(
                  <div key={l} style={{ borderTop:"1px solid rgba(255,215,0,0.2)", paddingTop:"0.7rem" }}>
                    <div className="k-display" style={{ fontSize:"2.2rem", fontWeight:900, color:"#ffd700", lineHeight:1 }}>{v}</div>
                    <div className="k-mono" style={{ fontSize:"0.44rem", color:"var(--t3)", letterSpacing:"0.14em", marginTop:"0.16rem" }}>{l}</div>
                  </div>
                ))}
              </div>
              <blockquote style={{ borderLeft:"2px solid #ffd700", paddingLeft:"1rem", margin:"0 0 1.75rem" }}>
                <p style={{ fontStyle:"italic", fontSize:"0.95rem", color:"var(--t2)", lineHeight:1.72 }}>&ldquo;I don&apos;t race against the future. I carry the past into it.&rdquo;</p>
              </blockquote>
              <button className="k-btn-outline" style={{ fontSize:"0.7rem", borderColor:"#ffd70044", color:"#ffd700" }} onClick={()=>onDriver(devSharma)}>VIEW DRIVER PROFILE →</button>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Animal Welfare Protocol ── */}
      <section style={{ background:"var(--bg)", padding:"5rem 2rem" }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <Reveal>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4rem", alignItems:"center" }} className="k-grid-2col">
              <div>
                <div className="k-mono" style={{ fontSize:"0.54rem", letterSpacing:"0.28em", color:"#ffd700", marginBottom:"0.75rem", opacity:0.8 }}>HERITAGE CLASS PROTOCOL</div>
                <h3 className="k-display" style={{ fontSize:"clamp(2rem,5vw,3.5rem)", fontWeight:900, color:"var(--t1)", lineHeight:0.9, marginBottom:"1.1rem" }}>THE ANIMAL<br />COMES FIRST.</h3>
                <p style={{ color:"var(--t2)", lineHeight:1.8, fontSize:"0.9rem", maxWidth:400 }}>The KALCHAKRA Heritage Class operates under strict fictional championship protocols designed to ensure the health, safety and wellbeing of every animal at every moment.</p>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1px", background:"var(--border)", borderRadius:2, overflow:"hidden" }}>
                {[["PRE-RACE","Veterinary Check"],["TRACK","Condition Monitoring"],["REST","Scheduled Recovery"],["HYDRATION","Checkpoint System"],["SAFETY","Emergency Response"],["WELFARE","Continuous Monitoring"]].map(([stage,desc])=>(
                  <div key={stage} style={{ background:"var(--bg)", padding:"1.1rem", borderLeft:`2px solid rgba(255,215,0,0.22)` }}>
                    <div className="k-mono" style={{ fontSize:"0.46rem", color:"#ffd700", letterSpacing:"0.18em", marginBottom:"0.28rem", opacity:0.75 }}>{stage}</div>
                    <div style={{ fontSize:"0.82rem", color:"var(--t1)", fontWeight:500 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Evolution of the Wheel ── */}
      <section style={{ background:"var(--bg2)", padding:"5rem 2rem" }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <Reveal>
            <div className="k-mono" style={{ fontSize:"0.58rem", letterSpacing:"0.3em", color:"var(--accent)", marginBottom:"0.75rem", opacity:0.7 }}>THE KALCHAKRA STORY</div>
            <h2 className="k-display" style={{ fontSize:"clamp(2rem,5vw,4rem)", fontWeight:900, color:"var(--t1)", lineHeight:0.9, marginBottom:"2.75rem" }}>ONE WHEEL.<br />THOUSANDS OF YEARS.</h2>
            <div style={{ display:"flex", alignItems:"flex-start", gap:"0", overflowX:"auto", paddingBottom:"0.5rem" }}>
              {(["heritage","human","motor","future"] as RacingClass[]).map((cls,i)=>{
                const m = CLS_META[cls];
                return (
                  <div key={cls} style={{ flex:1, minWidth:160, position:"relative" }}>
                    <div style={{ padding:"1.4rem 1.25rem", borderTop:`3px solid ${m.color}`, background:"var(--surface)" }}>
                      <div style={{ fontSize:"2.2rem", marginBottom:"0.6rem" }}>{m.icon}</div>
                      <div className="k-mono" style={{ fontSize:"0.5rem", color:m.color, letterSpacing:"0.18em", marginBottom:"0.3rem" }}>ERA {String(i+1).padStart(2,"0")}</div>
                      <div className="k-display" style={{ fontSize:"1.15rem", fontWeight:900, color:"var(--t1)", lineHeight:1, marginBottom:"0.18rem" }}>{m.sub}</div>
                      <div style={{ fontSize:"0.78rem", color:"var(--t2)" }}>{["Wooden Wheel","Human Power","Motor Power","Future Mobility"][i]}</div>
                    </div>
                    {i < 3 && <div style={{ position:"absolute", right:-18, top:"2.5rem", zIndex:1, color:"var(--t3)", fontSize:"1rem" }}>→</div>}
                  </div>
                );
              })}
            </div>
            <div style={{ textAlign:"center", marginTop:"1.75rem" }}>
              <div className="k-display" style={{ fontSize:"clamp(1.2rem,3vw,2.2rem)", fontWeight:900, letterSpacing:"0.12em", color:"var(--t2)" }}>PAST → PRESENT → FUTURE</div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Hero Driver Arjun Rao ── */}
      <section style={{ background:"var(--bg)", padding:"5rem 2rem" }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <Reveal>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4rem", alignItems:"center" }} className="k-grid-2col">
              <div>
                <div className="k-mono" style={{ fontSize:"0.54rem", letterSpacing:"0.28em", color:"var(--accent)", marginBottom:"0.75rem", opacity:0.8 }}>MEET THE CHAMPION</div>
                <div className="k-display" style={{ fontSize:"5rem", fontWeight:900, color:"var(--accent)", opacity:0.1, lineHeight:1, marginBottom:"-1.2rem" }}>#07</div>
                <h3 className="k-display" style={{ fontSize:"clamp(2rem,5vw,3.8rem)", fontWeight:900, color:"var(--t1)", lineHeight:0.9, marginBottom:"0.6rem" }}>ARJUN RAO</h3>
                <div style={{ fontSize:"0.82rem", color:"var(--accent)", marginBottom:"1.5rem" }}>Kalchakra Velocity · Future Class</div>
                <div style={{ display:"flex", gap:"2rem", marginBottom:"2rem" }}>
                  {([["312 KM/H","TOP SPEED"],["07","WINS"],["01","TITLE"]] as [string,string][]).map(([v,l])=>(
                    <div key={l}>
                      <div className="k-display" style={{ fontSize:"2rem", fontWeight:900, color:"var(--accent)", lineHeight:1 }}>{v}</div>
                      <div className="k-mono" style={{ fontSize:"0.46rem", color:"var(--t3)", letterSpacing:"0.14em", marginTop:"0.12rem" }}>{l}</div>
                    </div>
                  ))}
                </div>
                <button className="k-btn-outline" style={{ fontSize:"0.7rem" }} onClick={()=>onDriver(DRIVERS[0])}>VIEW FULL PROFILE →</button>
              </div>
              <div style={{ position:"relative", height:420, overflow:"hidden", borderRadius:2 }}>
                <img src={DRIVER_IMGS[0]} alt="Arjun Rao" loading="lazy" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top", filter:"brightness(0.82) contrast(1.06)" }} />
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(270deg,transparent 55%,var(--bg) 100%),linear-gradient(0deg,var(--bg) 0%,transparent 40%)" }} />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Drivers preview ── */}
      <section style={{ background:"var(--bg2)", padding:"5rem 2rem" }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <Reveal>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:"2.5rem", flexWrap:"wrap", gap:"1rem" }}>
              <div>
                <div className="k-mono" style={{ fontSize:"0.58rem", letterSpacing:"0.3em", color:"var(--accent)", marginBottom:"0.55rem", opacity:0.7 }}>2026 SEASON</div>
                <h2 className="k-display" style={{ fontSize:"clamp(2rem,4.5vw,3.5rem)", fontWeight:900, color:"var(--t1)", lineHeight:1 }}>THE DRIVERS</h2>
              </div>
              <button className="k-btn-outline" style={{ fontSize:"0.68rem", padding:"0.52rem 1.1rem" }} onClick={()=>go("drivers")}>ALL DRIVERS →</button>
            </div>
          </Reveal>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.1rem" }} className="k-grid-3col">
            {DRIVERS.map((d,i)=><Reveal key={d.id} delay={i*0.06}><DriverCard driver={d} onClick={()=>onDriver(d)} /></Reveal>)}
          </div>
        </div>
      </section>

      {/* ── World Race Schedule ── */}
      <section style={{ background:"var(--bg)", padding:"5rem 2rem" }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <Reveal>
            <div className="k-mono" style={{ fontSize:"0.58rem", letterSpacing:"0.3em", color:"var(--accent)", marginBottom:"0.75rem", opacity:0.7 }}>2026 SEASON</div>
            <h2 className="k-display" style={{ fontSize:"clamp(2rem,5vw,4rem)", fontWeight:900, color:"var(--t1)", lineHeight:0.9, marginBottom:"0.5rem" }}>THE WORLD IS THE TRACK.</h2>
            <p style={{ color:"var(--t2)", marginBottom:"2.5rem", fontSize:"0.9rem" }}>Six rounds. Six cities. One championship.</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1px", background:"var(--border)", marginBottom:"2rem", borderRadius:2, overflow:"hidden" }} className="k-grid-3col">
              {ROUNDS.map((r,i)=>{
                const sel = selectedRound?.num===r.num;
                return (
                  <div key={r.num} onClick={()=>setSelectedRound(sel?null:r)} style={{ background: sel?"rgba(0,200,255,0.04)":"var(--bg)", padding:"1.25rem", cursor:"pointer", borderTop:`2px solid ${sel?"var(--accent)":r.finale?"#ffd70033":"var(--border)"}`, transition:"all .2s" }}>
                    <div className="k-mono" style={{ fontSize:"0.46rem", color:r.finale?"#ffd700":"var(--t3)", letterSpacing:"0.18em", marginBottom:"0.35rem" }}>ROUND {String(r.num).padStart(2,"0")}{r.finale?" · GRAND FINALE":""}</div>
                    <div className="k-display" style={{ fontSize:"1.3rem", fontWeight:900, color:"var(--t1)", lineHeight:1 }}>{r.city}</div>
                    <div style={{ fontSize:"0.74rem", color:"var(--t2)", marginTop:"0.15rem" }}>{r.country} · {r.date}</div>
                    <div style={{ fontSize:"0.72rem", color:"var(--t3)", marginTop:"0.1rem" }}>{r.circuit}</div>
                  </div>
                );
              })}
            </div>
            {selectedRound && (
              <div style={{ background:"rgba(0,200,255,0.04)", border:"1px solid rgba(0,200,255,0.18)", borderLeft:"3px solid var(--accent)", padding:"1.25rem 1.5rem", animation:"fadeUp 0.2s ease", borderRadius:"0 2px 2px 0", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"1rem" }}>
                <div>
                  <div className="k-display" style={{ fontSize:"1.4rem", fontWeight:900, color:"var(--t1)" }}>{selectedRound.city} GRAND PRIX</div>
                  <div style={{ fontSize:"0.8rem", color:"var(--t2)" }}>{selectedRound.circuit} · {selectedRound.date}</div>
                </div>
                <div style={{ display:"flex", gap:"0.65rem" }}>
                  <button className="k-btn-primary" style={{ fontSize:"0.7rem", padding:"0.52rem 1.1rem" }} onClick={onTickets}>BUY TICKETS →</button>
                  <button className="k-btn-outline" style={{ fontSize:"0.7rem", padding:"0.52rem 1.1rem" }} onClick={()=>go("race-center")}>RACE CENTER</button>
                </div>
              </div>
            )}
          </Reveal>
        </div>
      </section>

      {/* ── Heritage Cup ── */}
      <section style={{ background:"var(--bg3)", padding:"5rem 2rem" }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4rem", alignItems:"center" }} className="k-grid-2col">
            <Reveal>
              <div className="k-mono" style={{ fontSize:"0.54rem", letterSpacing:"0.28em", color:"#ffd700", marginBottom:"0.75rem", opacity:0.8 }}>CLASS 01 · HERITAGE</div>
              <h2 className="k-display" style={{ fontSize:"clamp(2rem,6vw,4.5rem)", fontWeight:900, color:"var(--t1)", lineHeight:0.9, marginBottom:"0.4rem" }}>THE HERITAGE CUP</h2>
              <div className="k-display" style={{ fontSize:"clamp(1rem,2.5vw,1.6rem)", fontWeight:700, color:"var(--t2)", marginBottom:"1.5rem", lineHeight:1.3 }}>"Preserving the journey.<br />Reimagining the race."</div>
              <p style={{ color:"var(--t2)", lineHeight:1.8, fontSize:"0.9rem", maxWidth:440, marginBottom:"1.75rem" }}>Awarded at the Heritage Grand Prix Grand Finale, Hyderabad. The most culturally significant trophy in the KALCHAKRA Championship — earned not through speed alone, but through mastery, tradition and precision.</p>
              <div style={{ display:"flex", gap:"1.5rem", flexWrap:"wrap" }}>
                {([["03","CURRENT WINS"],["01","HERITAGE CUPS"],["2026","SEASON"]] as [string,string][]).map(([v,l])=>(
                  <div key={l} style={{ borderTop:"1px solid rgba(255,215,0,0.22)", paddingTop:"0.65rem" }}>
                    <div className="k-display" style={{ fontSize:"2.2rem", fontWeight:900, color:"#ffd700", lineHeight:1 }}>{v}</div>
                    <div className="k-mono" style={{ fontSize:"0.44rem", color:"var(--t3)", letterSpacing:"0.14em", marginTop:"0.12rem" }}>{l}</div>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.14}>
              {/* Trophy SVG */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg width="260" height="340" viewBox="0 0 260 340" fill="none">
                  <defs>
                    <linearGradient id="tg" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffd700" />
                      <stop offset="50%" stopColor="#fff8b0" />
                      <stop offset="100%" stopColor="#b8860b" />
                    </linearGradient>
                    <linearGradient id="tg2" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ffd700" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#ffd700" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  {/* Glow */}
                  <ellipse cx="130" cy="170" rx="100" ry="90" fill="url(#tg2)" />
                  {/* Base */}
                  <rect x="90" y="295" width="80" height="12" rx="2" fill="url(#tg)" opacity="0.9" />
                  <rect x="105" y="278" width="50" height="18" rx="1" fill="url(#tg)" opacity="0.85" />
                  {/* Stem */}
                  <rect x="120" y="220" width="20" height="60" rx="2" fill="url(#tg)" opacity="0.8" />
                  {/* Cup body */}
                  <path d="M80 120 Q75 195 120 220 L140 220 Q185 195 180 120 Z" fill="url(#tg)" opacity="0.92" />
                  {/* Cup inner shadow */}
                  <path d="M90 125 Q87 188 125 214 L135 214 Q173 188 170 125 Z" fill="#b8860b" opacity="0.3" />
                  {/* Handles — horn-inspired */}
                  <path d="M80 130 Q48 125 45 155 Q43 180 75 185 Q82 186 88 178" stroke="url(#tg)" strokeWidth="10" strokeLinecap="round" fill="none" />
                  <path d="M180 130 Q212 125 215 155 Q217 180 185 185 Q178 186 172 178" stroke="url(#tg)" strokeWidth="10" strokeLinecap="round" fill="none" />
                  {/* Wheel motif on cup */}
                  <circle cx="130" cy="160" r="28" stroke="#fff8b0" strokeWidth="1.5" fill="none" opacity="0.35" />
                  <circle cx="130" cy="160" r="6" fill="#fff8b0" opacity="0.35" />
                  {[0,45,90,135,180,225,270,315].map((a,i)=>(
                    <line key={i} x1={130+6*Math.cos(a*Math.PI/180)} y1={160+6*Math.sin(a*Math.PI/180)} x2={130+26*Math.cos(a*Math.PI/180)} y2={160+26*Math.sin(a*Math.PI/180)} stroke="#fff8b0" strokeWidth="1" opacity="0.28" />
                  ))}
                  {/* Crown spires */}
                  {[-25,-12.5,0,12.5,25].map((x,i)=>(
                    <polygon key={i} points={`${130+x},80 ${130+x-6},105 ${130+x+6},105`} fill="url(#tg)" opacity={i===2?0.95:0.75} />
                  ))}
                  {/* Top rim */}
                  <rect x="76" y="105" width="108" height="18" rx="2" fill="url(#tg)" opacity="0.88" />
                  {/* Label */}
                  <text x="130" y="252" fill="#ffd700" fontSize="7" fontFamily="'Barlow Condensed',sans-serif" fontWeight="900" letterSpacing="3" textAnchor="middle" opacity="0.75">HERITAGE CUP</text>
                </svg>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Tradition × Technology ── */}
      <section style={{ background:"var(--bg)", padding:"5rem 2rem" }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <Reveal>
            <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:"2rem", alignItems:"center", marginBottom:"3rem" }} className="k-grid-2col">
              <div style={{ textAlign:"center" }}>
                <div className="k-display" style={{ fontSize:"clamp(2.5rem,6vw,5rem)", fontWeight:900, color:"#ffd700", opacity:0.25, lineHeight:1 }}>TRADITION</div>
                <div style={{ position:"relative", height:200, overflow:"hidden", borderRadius:2, marginTop:"0.75rem", border:"1px solid rgba(255,215,0,0.15)" }}>
                  <img src={IMG.heritageCart} alt="Heritage" loading="lazy" style={{ width:"100%", height:"100%", objectFit:"cover", filter:"brightness(0.65) sepia(0.18) contrast(1.08)" }} />
                  <div style={{ position:"absolute", inset:0, background:"linear-gradient(0deg,rgba(0,0,0,0.7) 0%,transparent 60%)" }} />
                  <div style={{ position:"absolute", bottom:"0.75rem", left:"0.85rem" }}>
                    <div className="k-display" style={{ fontSize:"1.1rem", fontWeight:900, color:"#ffd700" }}>TRADITION</div>
                    <div style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.5)" }}>Heritage Grand Prix</div>
                  </div>
                </div>
              </div>
              <div style={{ textAlign:"center", flexShrink:0, padding:"0 1rem" }}>
                <div className="k-display" style={{ fontSize:"clamp(1.8rem,4vw,3rem)", fontWeight:900, color:"var(--t1)", lineHeight:1 }}>×</div>
              </div>
              <div style={{ textAlign:"center" }}>
                <div className="k-display" style={{ fontSize:"clamp(2.5rem,6vw,5rem)", fontWeight:900, color:"var(--accent)", opacity:0.25, lineHeight:1 }}>TECHNOLOGY</div>
                <div style={{ position:"relative", height:200, overflow:"hidden", borderRadius:2, marginTop:"0.75rem", border:"1px solid rgba(0,200,255,0.15)" }}>
                  <img src={IMG.hero} alt="Technology" loading="lazy" style={{ width:"100%", height:"100%", objectFit:"cover", filter:"brightness(0.55) contrast(1.1)" }} />
                  <div style={{ position:"absolute", inset:0, background:"linear-gradient(0deg,rgba(0,0,0,0.7) 0%,transparent 60%)" }} />
                  <div style={{ position:"absolute", bottom:"0.75rem", left:"0.85rem" }}>
                    <div className="k-display" style={{ fontSize:"1.1rem", fontWeight:900, color:"var(--accent)" }}>TECHNOLOGY</div>
                    <div style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.5)" }}>KALCHAKRA Environment</div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ background:"var(--surface)", border:"1px solid var(--border)", padding:"1.75rem 2rem", borderRadius:2 }}>
              <div className="k-mono" style={{ fontSize:"0.52rem", letterSpacing:"0.26em", color:"var(--t3)", marginBottom:"1rem" }}>FICTIONAL KALCHAKRA CHAMPIONSHIP PROTOCOLS</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1px", background:"var(--border)", borderRadius:2, overflow:"hidden" }} className="k-grid-2col">
                {["✓ Digital Timing","✓ Track Monitoring","✓ Weather Monitoring","✓ Safety Monitoring","✓ Welfare Monitoring","✓ Qualified Handlers","✓ Rest Checkpoints","✓ Veterinary Check"].map(p=>(
                  <div key={p} style={{ background:"var(--bg)", padding:"0.8rem 0.9rem" }}>
                    <span style={{ fontSize:"0.82rem", color:"var(--t2)" }}>{p}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize:"0.72rem", color:"var(--t3)", marginTop:"0.75rem", fontStyle:"italic" }}>These are fictional KALCHAKRA championship protocols. They do not imply real-world certifications or endorsements.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Which Era Is Yours ── */}
      <section style={{ background:"var(--bg2)", padding:"5rem 2rem" }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <Reveal>
            <div className="k-mono" style={{ fontSize:"0.58rem", letterSpacing:"0.3em", color:"var(--accent)", marginBottom:"0.75rem", opacity:0.7 }}>CHOOSE YOUR ERA</div>
            <h2 className="k-display" style={{ fontSize:"clamp(2rem,6vw,4.5rem)", fontWeight:900, color:"var(--t1)", lineHeight:0.9, marginBottom:"2.5rem" }}>WHICH ERA IS YOURS?</h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"0" }} className="k-grid-2col">
              {(["heritage","human","motor","future"] as RacingClass[]).map((cls,i)=>{
                const m = CLS_META[cls];
                const isHov = hoverCls===cls;
                const eraLabels = ["FEEL THE TRADITION","FEEL THE EFFORT","FEEL THE MACHINE","FEEL TOMORROW"];
                return (
                  <div key={cls} onClick={()=>go("racing")}
                    onMouseEnter={()=>setHoverCls(cls)} onMouseLeave={()=>setHoverCls(null)}
                    style={{ position:"relative", height:360, overflow:"hidden", cursor:"pointer", borderRight:i<3?"1px solid var(--border)":"none", borderTop:`3px solid ${isHov?m.color:"transparent"}`, transition:"border-color .3s" }}>
                    <img src={m.img} alt={m.label} loading="lazy" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", filter:`brightness(${isHov?"0.55":"0.3"}) contrast(1.1)`, transform:isHov?"scale(1.07)":"scale(1)", transition:"all .55s ease" }} />
                    <div style={{ position:"absolute", inset:0, background:"linear-gradient(0deg,rgba(0,0,0,0.92) 0%,rgba(0,0,0,0.1) 100%)" }} />
                    <div style={{ position:"absolute", inset:"1.25rem", display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
                      <div style={{ fontSize:isHov?"2.8rem":"2.2rem", transition:"font-size .38s ease", marginBottom:"0.4rem" }}>{m.icon}</div>
                      <div className="k-mono" style={{ fontSize:"0.46rem", color:m.color, letterSpacing:"0.2em", marginBottom:"0.2rem", opacity:0.8 }}>CLASS {String(i+1).padStart(2,"0")}</div>
                      <div className="k-display" style={{ fontSize:isHov?"1.55rem":"1.25rem", fontWeight:900, color:"#fff", lineHeight:1, transition:"font-size .35s ease", marginBottom:"0.18rem" }}>{m.label}</div>
                      <div className="k-display" style={{ fontSize:isHov?"1rem":"0.82rem", fontWeight:700, color:m.color, transition:"font-size .35s ease", marginBottom:"0.35rem" }}>{m.sub}</div>
                      <div style={{ fontSize:"0.74rem", color:isHov?"rgba(255,255,255,0.62)":"rgba(255,255,255,0)", transition:"color .32s ease" }}>{eraLabels[i]}</div>
                      {isHov && <div className="k-mono" style={{ marginTop:"0.55rem", fontSize:"0.5rem", color:m.color, letterSpacing:"0.18em", animation:"fadeUp 0.18s ease" }}>ENTER CLASS →</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Live Race HUD ── */}
      <section style={{ background:"var(--bg3)", padding:"5rem 2rem" }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <Reveal>
            <div style={{ display:"flex", alignItems:"center", gap:"0.7rem", marginBottom:"1.25rem" }}>
              <div className="dot-blink" style={{ width:8, height:8, borderRadius:"50%", background:"#f00" }} />
              <div className="k-mono" style={{ fontSize:"0.58rem", letterSpacing:"0.32em", color:"#f00" }}>SIMULATED RACE DATA</div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.5rem" }} className="k-grid-2col">
              {/* Future class HUD */}
              <div style={{ background:"var(--bg)", border:"1px solid var(--border)", borderTop:"2px solid #00c8ff", padding:"1.5rem" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"1rem" }}>
                  <div className="k-mono" style={{ fontSize:"0.52rem", letterSpacing:"0.22em", color:"#00c8ff" }}>FUTURE CLASS</div>
                  <div className="k-mono" style={{ fontSize:"0.52rem", color:"var(--t3)" }}>KALCHAKRA GRAND PRIX</div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1px", background:"var(--border)", marginBottom:"1rem" }}>
                  {([["LAP","18/32"],["POSITION","P1"],["SPEED","312 KM/H"],["GAP","+02.41"],["ETA","04:18"],["DRIVER","ARJUN RAO"]] as [string,string][]).map(([l,v])=>(
                    <div key={l} style={{ background:"var(--bg)", padding:"0.75rem 0.6rem", textAlign:"center" }}>
                      <div className="k-display hud-flicker" style={{ fontSize:"1.1rem", fontWeight:900, color:"#00c8ff", lineHeight:1 }}>{v}</div>
                      <div className="k-mono" style={{ fontSize:"0.42rem", color:"var(--t3)", marginTop:"0.16rem", letterSpacing:"0.12em" }}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background:"rgba(0,200,255,0.04)", border:"1px solid rgba(0,200,255,0.12)", padding:"0.75rem 1rem" }}>
                  {[["P1","ARJUN RAO","—"],["P2","KIRAN DEV","+02.41"],["P3","MAYA SEN","+05.88"],["P4","ADITYA VARMA","+09.14"]].map(([p,n,g])=>(
                    <div key={p} style={{ display:"flex", alignItems:"center", gap:"0.85rem", padding:"0.35rem 0", borderBottom:"1px solid var(--border)" }}>
                      <span className="k-display" style={{ fontSize:"0.88rem", fontWeight:900, color: p==="P1"?"#ffd700":p==="P2"?"#b4b4b4":p==="P3"?"#cd7f32":"var(--t3)", minWidth:22 }}>{p}</span>
                      <span style={{ flex:1, fontFamily:"Inter,sans-serif", fontSize:"0.8rem", color:"var(--t1)" }}>{n}</span>
                      <span className="k-mono" style={{ fontSize:"0.52rem", color:"var(--t3)" }}>{g}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Heritage class HUD */}
              <div style={{ background:"var(--bg)", border:"1px solid var(--border)", borderTop:"2px solid #ffd700", padding:"1.5rem" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"1rem" }}>
                  <div className="k-mono" style={{ fontSize:"0.52rem", letterSpacing:"0.22em", color:"#ffd700" }}>HERITAGE CLASS</div>
                  <div className="k-mono" style={{ fontSize:"0.52rem", color:"var(--t3)" }}>HERITAGE GRAND PRIX</div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"1px", background:"var(--border)", marginBottom:"1rem" }}>
                  {([["TRACK","OPTIMAL"],["WELFARE","● CLEAR"],["LAP","08/12"],["POSITION","P1"]] as [string,string][]).map(([l,v])=>(
                    <div key={l} style={{ background:"var(--bg)", padding:"0.9rem 0.75rem", textAlign:"center" }}>
                      <div className="k-display hud-flicker" style={{ fontSize:"1.25rem", fontWeight:900, color: l==="WELFARE"?"#7fff9a":"#ffd700", lineHeight:1 }}>{v}</div>
                      <div className="k-mono" style={{ fontSize:"0.42rem", color:"var(--t3)", marginTop:"0.16rem", letterSpacing:"0.12em" }}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background:"rgba(255,215,0,0.04)", border:"1px solid rgba(255,215,0,0.14)", padding:"1rem" }}>
                  <div className="k-mono" style={{ fontSize:"0.48rem", color:"#ffd700", letterSpacing:"0.18em", marginBottom:"0.5rem", opacity:0.8 }}>DEV SHARMA · #09</div>
                  <div className="k-display" style={{ fontSize:"1.5rem", fontWeight:900, color:"#fff" }}>PARAMPARA RACING</div>
                  <div style={{ fontSize:"0.8rem", color:"var(--t2)", marginTop:"0.18rem" }}>Heritage Cup Leader · 3 Wins</div>
                  <div style={{ marginTop:"0.6rem", display:"flex", gap:"0.5rem" }}>
                    <div style={{ padding:"0.28rem 0.55rem", background:"rgba(127,255,154,0.1)", border:"1px solid rgba(127,255,154,0.25)", borderRadius:2 }}>
                      <span className="k-mono" style={{ fontSize:"0.5rem", color:"#7fff9a" }}>✓ WELFARE CLEAR</span>
                    </div>
                    <div style={{ padding:"0.28rem 0.55rem", background:"rgba(255,215,0,0.08)", border:"1px solid rgba(255,215,0,0.22)", borderRadius:2 }}>
                      <span className="k-mono" style={{ fontSize:"0.5rem", color:"#ffd700" }}>✓ TRACK OPTIMAL</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Championship Statement ── */}
      <section style={{ position:"relative", overflow:"hidden", padding:"6rem 2rem", background:"#000", textAlign:"center" }}>
        <div style={{ position:"absolute", inset:0 }}>
          <img src={IMG.night} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", filter:"brightness(0.2) contrast(1.1) saturate(0.55)" }} />
        </div>
        <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.68)" }} />
        <div style={{ position:"relative", zIndex:1, maxWidth:1280, margin:"0 auto" }}>
          <Reveal>
            {["PAST.","PRESENT.","FUTURE."].map((w,i)=>(
              <div key={w} className="k-display" style={{ fontSize:"clamp(3.5rem,12vw,10rem)", fontWeight:900, lineHeight:0.88, color: i===2?"var(--accent)":"rgba(255,255,255,0.7)", letterSpacing:"-0.01em" }}>{w}</div>
            ))}
            <div className="k-display" style={{ fontSize:"clamp(1.5rem,5vw,4rem)", fontWeight:900, color:"rgba(255,255,255,0.3)", letterSpacing:"0.08em", marginTop:"0.6rem" }}>ONE FINISH LINE.</div>
          </Reveal>
        </div>
      </section>

      <ParticipateSection onParticipate={onParticipate} />

      {/* ── Emotional statement ── */}
      <section style={{ position:"relative", overflow:"hidden", minHeight:"60vh", display:"flex", alignItems:"center", background:"#000" }}>
        <div style={{ position:"absolute", inset:0 }}>
          <img src={IMG.heritageField} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", filter:"brightness(0.22) contrast(1.1)" }} />
        </div>
        <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.62)" }} />
        <div style={{ position:"relative", zIndex:1, maxWidth:1280, margin:"0 auto", padding:"5rem 2rem", textAlign:"center" }}>
          <Reveal>
            <h2 className="k-display" style={{ fontSize:"clamp(2.5rem,8vw,7rem)", fontWeight:900, lineHeight:0.9, color:"#fff", marginBottom:"0.3rem" }}>NOT EVERYTHING</h2>
            <h2 className="k-display" style={{ fontSize:"clamp(2.5rem,8vw,7rem)", fontWeight:900, lineHeight:0.9, color:"#fff", marginBottom:"0.3rem" }}>FROM THE PAST</h2>
            <h2 className="k-display" style={{ fontSize:"clamp(2.5rem,8vw,7rem)", fontWeight:900, lineHeight:0.9, color:"#ffd700", marginBottom:"2rem" }}>SHOULD DISAPPEAR.</h2>
            <p style={{ fontSize:"1.05rem", color:"rgba(255,255,255,0.45)", maxWidth:520, margin:"0 auto" }}>KALCHAKRA brings generations of movement together on one global stage.</p>
          </Reveal>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ background:"var(--bg)", padding:"6rem 2rem", textAlign:"center" }}>
        <div style={{ maxWidth:800, margin:"0 auto" }}>
          <Reveal>
            <div className="k-mono" style={{ fontSize:"0.58rem", letterSpacing:"0.3em", color:"var(--accent)", marginBottom:"0.75rem", opacity:0.7 }}>JOIN THE CHAMPIONSHIP</div>
            <h2 className="k-display" style={{ fontSize:"clamp(2.5rem,7vw,6rem)", fontWeight:900, lineHeight:0.9, color:"var(--t1)", marginBottom:"0.3rem" }}>READY FOR</h2>
            <h2 className="k-display" style={{ fontSize:"clamp(2.5rem,7vw,6rem)", fontWeight:900, lineHeight:0.9, color:"var(--accent)", marginBottom:"1.5rem" }}>THE NEXT ERA?</h2>
            <p style={{ color:"var(--t2)", lineHeight:1.72, marginBottom:"2.5rem", fontSize:"1rem" }}>Experience KALCHAKRA — the multinational championship where every era races together.</p>
            <div style={{ display:"flex", gap:"0.85rem", justifyContent:"center", flexWrap:"wrap" }}>
              <button className="k-btn-primary" style={{ fontSize:"1rem" }} onClick={onTickets}>BUY TICKETS →</button>
              <button className="k-btn-outline" style={{ fontSize:"1rem" }} onClick={onAuthOpen}>JOIN KALCHAKRA</button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function RacingPage({ go }: { go: (p: Page) => void }) {
  const [active, setActive] = useState<RacingClass|null>(null);
  const aInfo = active ? CLS_META[active] : null;
  const aDrivers = active ? DRIVERS.filter(d=>d.cls===active) : [];
  return (
    <div style={{ background:"var(--bg)", minHeight:"100vh", padding:"7rem 2rem 5rem" }}>
      <div style={{ maxWidth:1280, margin:"0 auto" }}>
        <Reveal>
          <div className="k-mono" style={{ fontSize:"0.58rem", letterSpacing:"0.3em", color:"var(--accent)", marginBottom:"0.55rem", opacity:0.7 }}>CHAMPIONSHIP</div>
          <h1 className="k-display" style={{ fontSize:"clamp(2.5rem,7vw,5rem)", fontWeight:900, color:"var(--t1)", lineHeight:0.92, marginBottom:"0.35rem" }}>RACING CLASSES</h1>
          <p style={{ color:"var(--t2)", marginBottom:"2.75rem", fontSize:"0.9rem" }}>FOUR ERAS. FOUR MACHINES. ONE CHAMPIONSHIP.</p>
        </Reveal>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"1.25rem", marginBottom:"2.5rem" }} className="k-grid-2col">
          {(["heritage","human","motor","future"] as RacingClass[]).map((cls,i)=>{
            const m = CLS_META[cls];
            const isActive = active===cls;
            return (
              <div key={cls} onClick={()=>setActive(isActive?null:cls)} style={{ position:"relative", height:280, overflow:"hidden", cursor:"pointer", border:`2px solid ${isActive?m.color:"var(--border)"}`, transition:"all .28s" }}>
                <img src={m.img} alt={m.label} loading="lazy" style={{ width:"100%", height:"100%", objectFit:"cover", filter:`brightness(${isActive?0.5:0.35}) contrast(1.1)`, transform:isActive?"scale(1.04)":"scale(1)", transition:"all .55s ease" }} />
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(0deg,rgba(0,0,0,0.88) 0%,rgba(0,0,0,0.08) 100%)" }} />
                <div style={{ position:"absolute", bottom:"1.4rem", left:"1.4rem" }}>
                  <div style={{ fontSize:"2.5rem", marginBottom:"0.35rem" }}>{m.icon}</div>
                  <div className="k-mono" style={{ fontSize:"0.5rem", letterSpacing:"0.2em", color:m.color, marginBottom:"0.2rem" }}>CLASS {String(i+1).padStart(2,"0")}</div>
                  <div className="k-display" style={{ fontSize:"1.8rem", fontWeight:900, color:"#fff", lineHeight:1 }}>{m.label}</div>
                  <div className="k-display" style={{ fontSize:"1.1rem", fontWeight:700, color:m.color }}>{m.sub}</div>
                </div>
                {isActive && <div className="k-mono" style={{ position:"absolute", top:"1rem", right:"1rem", fontSize:"0.56rem", color:m.color, background:`${m.color}14`, border:`1px solid ${m.color}30`, padding:"0.28rem 0.6rem", borderRadius:2 }}>SELECTED ✓</div>}
              </div>
            );
          })}
        </div>
        {active && aInfo && (
          <div style={{ background:"var(--surface)", border:`1px solid ${aInfo.color}22`, borderLeft:`3px solid ${aInfo.color}`, padding:"2rem", animation:"fadeUp 0.22s ease", borderRadius:2, marginBottom:"2rem" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"2rem", alignItems:"start" }} className="k-grid-2col">
              <div>
                <div className="k-mono" style={{ fontSize:"0.52rem", letterSpacing:"0.24em", color:aInfo.color, marginBottom:"0.5rem", opacity:0.8 }}>CLASS PROFILE</div>
                <h3 className="k-display" style={{ fontSize:"2rem", fontWeight:900, color:"var(--t1)", marginBottom:"0.5rem" }}>{aInfo.icon} {aInfo.label}</h3>
                <p style={{ color:"var(--t2)", lineHeight:1.72, fontSize:"0.88rem", marginBottom:"1rem" }}>{"heritage"===active?"The Heritage class celebrates the oldest form of transportation — the bullock cart — brought into a modern international racing format with respect, dignity and cultural pride.":"human"===active?"The Human Power class tests pure athletic endurance and cycling speed, with riders from across the world competing on a global stage.":"motor"===active?"The Motor class brings the roar of motorcycles to the championship — raw mechanical power, precision handling and high-speed competition.":"The Future class represents the pinnacle of racing technology — advanced vehicles pushing the limits of speed, aerodynamics and performance."}</p>
                <button className="k-btn-outline" style={{ fontSize:"0.7rem", padding:"0.52rem 1.1rem" }} onClick={()=>go("drivers")}>SEE CLASS DRIVERS →</button>
              </div>
              <div>
                <div className="k-mono" style={{ fontSize:"0.5rem", letterSpacing:"0.2em", color:"var(--t3)", marginBottom:"0.75rem" }}>COMPETING DRIVERS</div>
                {aDrivers.map(d=>(
                  <div key={d.id} style={{ display:"flex", alignItems:"center", gap:"0.9rem", padding:"0.65rem 0", borderBottom:"1px solid var(--border)" }}>
                    <img src={d.img} alt={d.name} loading="lazy" style={{ width:38, height:38, objectFit:"cover", objectPosition:"top", borderRadius:2, filter:"brightness(0.85)" }} />
                    <div style={{ flex:1 }}>
                      <div className="k-display" style={{ fontSize:"0.95rem", fontWeight:800, color:"var(--t1)" }}>{d.name}</div>
                      <div style={{ fontSize:"0.72rem", color:aInfo.color }}>{d.team} · #{d.num}</div>
                    </div>
                    <div className="k-display" style={{ fontSize:"1.25rem", fontWeight:900, color:"var(--t1)" }}>P{d.pos}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DriversPage({ auth, onDriver, onAuthOpen }: { auth: Auth; onDriver: (d: Driver) => void; onAuthOpen: () => void; }) {
  const [cls,  setCls]  = useState<RacingClass|"all">("all");
  const [team, setTeam] = useState("All Teams");
  const [nat,  setNat]  = useState("All");
  const [sort, setSort] = useState<"pos"|"pts"|"wins">("pos");
  const teams = ["All Teams", ...Array.from(new Set(DRIVERS.map(d=>d.team)))];
  const nats  = ["All",       ...Array.from(new Set(DRIVERS.map(d=>d.country)))];
  const visible = DRIVERS
    .filter(d => cls==="all"||d.cls===cls)
    .filter(d => team==="All Teams"||d.team===team)
    .filter(d => nat==="All"||d.country===nat)
    .sort((a,b)=>sort==="pos"?a.pos-b.pos:b[sort]-a[sort]);
  const SEL: React.CSSProperties = { background:"var(--surface)", border:"1px solid var(--border)", color:"var(--t1)", fontFamily:"'JetBrains Mono',monospace", fontSize:"0.58rem", letterSpacing:"0.08em", padding:"0.5rem 0.85rem", cursor:"pointer", outline:"none", borderRadius:2 };
  return (
    <div style={{ background:"var(--bg)", minHeight:"100vh", padding:"7rem 2rem 5rem" }}>
      <div style={{ maxWidth:1280, margin:"0 auto" }}>
        <Reveal>
          <div className="k-mono" style={{ fontSize:"0.58rem", letterSpacing:"0.3em", color:"var(--accent)", marginBottom:"0.55rem", opacity:0.7 }}>2026 SEASON</div>
          <h1 className="k-display" style={{ fontSize:"clamp(2.5rem,7vw,5rem)", fontWeight:900, color:"var(--t1)", lineHeight:0.92, marginBottom:"2.75rem" }}>DRIVERS</h1>
        </Reveal>
        <div style={{ display:"flex", gap:"0.85rem", marginBottom:"2rem", flexWrap:"wrap", alignItems:"flex-end", padding:"1rem 1.25rem", background:"var(--surface)", border:"1px solid var(--border)", borderRadius:2 }}>
          <div>
            <div className="k-mono" style={{ fontSize:"0.44rem", letterSpacing:"0.2em", color:"var(--t3)", marginBottom:"0.3rem" }}>CLASS</div>
            <div style={{ display:"flex", gap:"0.32rem" }}>
              <button onClick={()=>setCls("all")} style={filterBtn(cls==="all")}>ALL</button>
              {(["heritage","human","motor","future"] as RacingClass[]).map(c=>(
                <button key={c} onClick={()=>setCls(c)} style={filterBtn(cls===c)}>{CLS_META[c].icon}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="k-mono" style={{ fontSize:"0.44rem", letterSpacing:"0.2em", color:"var(--t3)", marginBottom:"0.3rem" }}>TEAM</div>
            <select style={SEL} value={team} onChange={e=>setTeam(e.target.value)}>{teams.map(t=><option key={t}>{t}</option>)}</select>
          </div>
          <div>
            <div className="k-mono" style={{ fontSize:"0.44rem", letterSpacing:"0.2em", color:"var(--t3)", marginBottom:"0.3rem" }}>NATIONALITY</div>
            <select style={SEL} value={nat} onChange={e=>setNat(e.target.value)}>{nats.map(n=><option key={n}>{n}</option>)}</select>
          </div>
          <div style={{ marginLeft:"auto" }}>
            <div className="k-mono" style={{ fontSize:"0.44rem", letterSpacing:"0.2em", color:"var(--t3)", marginBottom:"0.3rem" }}>SORT</div>
            <div style={{ display:"flex", gap:"0.32rem" }}>
              {(["pos","pts","wins"] as const).map(s=><button key={s} onClick={()=>setSort(s)} style={filterBtn(sort===s)}>{s==="pos"?"POS":s.toUpperCase()}</button>)}
            </div>
          </div>
        </div>
        {visible.length===0
          ? <div style={{ textAlign:"center", padding:"5rem", color:"var(--t3)" }}>No drivers match the selected filters.</div>
          : <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.1rem" }} className="k-grid-3col">
              {visible.map((d,i)=><Reveal key={d.id} delay={i*0.05}><DriverCard driver={d} onClick={()=>onDriver(d)} /></Reveal>)}
            </div>
        }
      </div>
    </div>
  );
}

function StandingsPage({ onDriver }: { onDriver: (d: Driver) => void }) {
  const [sort, setSort] = useState<"pts"|"wins"|"pos">("pts");
  const sorted = DRIVERS.slice().sort((a,b)=>sort==="pos"?a.pos-b.pos:b[sort as "pts"|"wins"]-a[sort as "pts"|"wins"]);
  const PODIUM: Record<number,string> = {1:"#ffd700",2:"#b4b4b4",3:"#cd7f32"};
  return (
    <div style={{ background:"var(--bg)", minHeight:"100vh", padding:"7rem 2rem 5rem" }}>
      <div style={{ maxWidth:1280, margin:"0 auto" }}>
        <Reveal>
          <div className="k-mono" style={{ fontSize:"0.58rem", letterSpacing:"0.3em", color:"var(--accent)", marginBottom:"0.55rem", opacity:0.7 }}>2026 SEASON</div>
          <h1 className="k-display" style={{ fontSize:"clamp(2.5rem,7vw,5rem)", fontWeight:900, color:"var(--t1)", lineHeight:0.92, marginBottom:"0.35rem" }}>CHAMPIONSHIP<br />STANDINGS</h1>
          <p style={{ color:"var(--t2)", marginBottom:"2.75rem", fontSize:"0.9rem" }}>Every point matters. Every race counts.</p>
        </Reveal>
        <div style={{ display:"flex", gap:"0.4rem", marginBottom:"1.5rem", flexWrap:"wrap" }}>
          {(["pts","wins","pos"] as const).map(s=><button key={s} onClick={()=>setSort(s)} style={filterBtn(sort===s)}>{s==="pts"?"POINTS":s==="wins"?"WINS":"POSITION"}</button>)}
        </div>
        <div style={{ border:"1px solid var(--border)", borderRadius:2, overflow:"hidden" }}>
          <div style={{ display:"grid", gridTemplateColumns:"52px 1fr 55px 90px 62px 70px", padding:"0.6rem 1.25rem", background:"var(--surface)", borderBottom:"1px solid var(--border)" }}>
            {["POS","DRIVER","CLASS","POINTS","WINS","TEAM"].map(h=><span key={h} className="k-mono" style={{ fontSize:"0.44rem", letterSpacing:"0.18em", color:"var(--t3)" }}>{h}</span>)}
          </div>
          {sorted.map((d,i)=>{
            const m = CLS_META[d.cls];
            const pc = PODIUM[i+1];
            return (
              <div key={d.id} onClick={()=>onDriver(d)} style={{ display:"grid", gridTemplateColumns:"52px 1fr 55px 90px 62px 70px", padding:"0.85rem 1.25rem", borderBottom:"1px solid var(--border)", cursor:"pointer", alignItems:"center", background:pc?`${pc}04`:"transparent", transition:"background .16s" }}
                onMouseEnter={e=>(e.currentTarget.style.background="var(--surface-h)")}
                onMouseLeave={e=>(e.currentTarget.style.background=pc?`${pc}04`:"transparent")}>
                <span className="k-display" style={{ fontSize:"1.5rem", fontWeight:900, color:pc||"var(--t3)", lineHeight:1 }}>{String(i+1).padStart(2,"0")}</span>
                <div style={{ display:"flex", alignItems:"center", gap:"0.6rem" }}>
                  <div style={{ width:2.5, height:26, background:m.color, borderRadius:2, flexShrink:0 }} />
                  <div>
                    <div className="k-display" style={{ fontSize:"1rem", fontWeight:900, color:"var(--t1)", letterSpacing:"0.04em" }}>{d.name}</div>
                    <div className="k-mono" style={{ fontSize:"0.46rem", color:"var(--t3)", letterSpacing:"0.1em" }}>{d.country} · #{d.num}</div>
                  </div>
                </div>
                <span style={{ fontSize:"1.2rem" }}>{m.icon}</span>
                <span className="k-display" style={{ fontSize:"1.45rem", fontWeight:900, color:"var(--t1)" }}>{d.pts}</span>
                <span className="k-display" style={{ fontSize:"1.15rem", fontWeight:700, color:"var(--t2)" }}>{d.wins}</span>
                <span style={{ fontSize:"0.72rem", color:m.color, fontFamily:"Inter,sans-serif" }}>{d.team}</span>
              </div>
            );
          })}
        </div>
        {/* Constructors */}
        <div style={{ marginTop:"3.5rem" }}>
          <Reveal>
            <div className="k-mono" style={{ fontSize:"0.58rem", letterSpacing:"0.3em", color:"var(--accent)", marginBottom:"1.25rem", opacity:0.7 }}>CONSTRUCTOR STANDINGS</div>
            <div style={{ display:"flex", gap:"1px", background:"var(--border)", borderRadius:2, overflow:"hidden" }}>
              {TEAMS.slice().sort((a,b)=>b.pts-a.pts).map((t,i)=>(
                <div key={t.name} style={{ flex:1, background:"var(--bg)", padding:"1.25rem", textAlign:"center", position:"relative", overflow:"hidden" }}>
                  <img src={t.img} alt={t.name} loading="lazy" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", filter:"brightness(0.14) contrast(1.1)", opacity:0.7 }} />
                  <div style={{ position:"relative", zIndex:1 }}>
                    <div className="k-mono" style={{ fontSize:"0.46rem", color:"var(--t3)", marginBottom:"0.4rem" }}>P{i+1}</div>
                    <TeamLogo abbr={t.abbr} color={t.color} size={32} />
                    <div style={{ fontSize:"0.72rem", color:"var(--t2)", margin:"0.35rem 0 0.18rem" }}>{t.name}</div>
                    <div className="k-display" style={{ fontSize:"1.65rem", fontWeight:900, color:t.color }}>{t.pts}</div>
                    <div style={{ fontSize:"0.65rem" }}>{CLS_META[t.cls].icon}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

function RaceCenterPage({ auth, onTickets, onAuthOpen, onToggleReminder }: { auth: Auth; onTickets: () => void; onAuthOpen: () => void; onToggleReminder: (round: string) => void }) {
  const [sector, setSector] = useState<string|null>(null);
  const info = CIRCUIT_TURNS.find(s=>s.id===sector);
  const hasReminder = auth.reminders.has("R01");
  const [prediction, setPrediction] = useState<string|null>(auth.prediction);
  const [predDone, setPredDone] = useState(!!auth.prediction);

  return (
    <div style={{ background:"var(--bg)", minHeight:"100vh" }}>
      <div style={{ height:"50vh", position:"relative", overflow:"hidden" }}>
        <img src={IMG.circuit} alt="Kondapalli Circuit" style={{ width:"100%", height:"100%", objectFit:"cover", filter:"brightness(0.5) contrast(1.1)" }} />
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(0deg,var(--bg) 0%,rgba(0,0,0,0.15) 100%)" }} />
        <div style={{ position:"absolute", bottom:"2.5rem", left:0, right:0, maxWidth:1280, margin:"0 auto", padding:"0 2rem" }}>
          <div className="k-mono" style={{ fontSize:"0.55rem", letterSpacing:"0.35em", color:"var(--accent)", marginBottom:"0.55rem", opacity:0.75 }}>ROUND 01 · 2026 SEASON</div>
          <h1 className="k-display" style={{ fontSize:"clamp(2.5rem,7vw,5.5rem)", fontWeight:900, color:"#fff", lineHeight:0.9 }}>RACE CENTER</h1>
        </div>
      </div>
      <div style={{ maxWidth:1280, margin:"0 auto", padding:"3rem 2rem 5rem" }}>
        {/* Next event */}
        <Reveal>
          <div style={{ background:"rgba(0,200,255,0.03)", border:"1px solid rgba(0,200,255,0.14)", borderLeft:"3px solid var(--accent)", padding:"1.75rem 2rem", marginBottom:"3rem", borderRadius:2 }}>
            <div className="k-mono" style={{ fontSize:"0.5rem", letterSpacing:"0.32em", color:"var(--accent)", marginBottom:"0.85rem", opacity:0.72 }}>NEXT EVENT</div>
            <div style={{ display:"flex", gap:"3rem", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <div className="k-display" style={{ fontSize:"1.75rem", fontWeight:900, color:"var(--t1)", lineHeight:1, marginBottom:"0.2rem" }}>KALCHAKRA GRAND PRIX</div>
                <div className="k-display" style={{ fontSize:"1.05rem", fontWeight:700, color:"var(--accent)" }}>RAJPATH CIRCUIT · DELHI · INDIA</div>
                <div style={{ fontSize:"0.74rem", color:"var(--t3)", marginTop:"0.18rem" }}>12 October 2026 · 18:00 IST</div>
              </div>
              <Countdown compact />
            </div>
            <div style={{ display:"flex", gap:"0.65rem", marginTop:"1.25rem", flexWrap:"wrap" }}>
              <button className="k-btn-primary" style={{ fontSize:"0.72rem", padding:"0.55rem 1.15rem" }} onClick={onTickets}>BUY TICKETS →</button>
              <button onClick={()=>{ auth.loggedIn ? onToggleReminder("R01") : onAuthOpen(); }} style={{ padding:"0.55rem 1.15rem", border:`1px solid ${hasReminder?"var(--accent)":"var(--border)"}`, background:hasReminder?"rgba(0,200,255,0.08)":"var(--surface)", color:hasReminder?"var(--accent)":"var(--t2)", fontFamily:"'JetBrains Mono',monospace", fontSize:"0.58rem", letterSpacing:"0.12em", cursor:"pointer", borderRadius:2, transition:"all .18s" }}>
                {hasReminder?"✓ REMINDER SET":"🔔 REMIND ME"}
              </button>
            </div>
          </div>
        </Reveal>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"3rem" }} className="k-grid-2col">
          {/* Circuit */}
          <Reveal>
            <div className="k-mono" style={{ fontSize:"0.58rem", letterSpacing:"0.3em", color:"var(--accent)", marginBottom:"1.25rem", opacity:0.7 }}>RAJPATH CIRCUIT</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"1px", background:"var(--border)", marginBottom:"1.25rem", borderRadius:2, overflow:"hidden" }}>
              {([["4.82 KM","CIRCUIT LENGTH"],["14","TURNS"],["32","LAPS"],["154.24 KM","RACE DISTANCE"]] as [string,string][]).map(([v,l])=>(
                <div key={l} style={{ background:"var(--bg)", padding:"0.9rem", textAlign:"center" }}>
                  <div className="k-display" style={{ fontSize:"1.45rem", fontWeight:900, color:"var(--accent)", lineHeight:1 }}>{v}</div>
                  <div className="k-mono" style={{ fontSize:"0.44rem", letterSpacing:"0.14em", color:"var(--t3)", marginTop:"0.2rem" }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ border:"1px solid var(--border)", padding:"1rem", background:"var(--surface)", marginBottom:"0.55rem", borderRadius:2 }}>
              <CircuitSVG selected={sector} onSelect={id=>setSector(id||null)} />
            </div>
            <div className="k-mono" style={{ fontSize:"0.44rem", color:"var(--accent)", opacity:0.5, marginBottom:"0.55rem" }}>↑ SELECT A TURN TO EXPLORE THE CIRCUIT</div>
            <div style={{ minHeight:76 }}>
              {info ? (
                <div style={{ background:"rgba(0,200,255,0.04)", border:"1px solid rgba(0,200,255,0.18)", borderLeft:"2px solid var(--accent)", padding:"0.9rem 1.1rem", animation:"fadeUp 0.2s ease", borderRadius:"0 2px 2px 0" }}>
                  <div className="k-display" style={{ fontSize:"1.05rem", fontWeight:900, color:"var(--accent)", marginBottom:"0.32rem" }}>{info.label}</div>
                  <p style={{ fontSize:"0.8rem", color:"var(--t2)", lineHeight:1.65 }}>{info.detail}</p>
                </div>
              ) : <div style={{ background:"var(--surface)", border:"1px solid var(--border)", padding:"1rem", borderRadius:2, textAlign:"center" }}><p style={{ fontSize:"0.78rem", color:"var(--t3)" }}>Click a turn marker to explore the circuit.</p></div>}
            </div>
          </Reveal>
          {/* Schedule + Prediction */}
          <Reveal delay={0.12}>
            <div className="k-mono" style={{ fontSize:"0.58rem", letterSpacing:"0.3em", color:"var(--accent)", marginBottom:"1.25rem", opacity:0.7 }}>RACE WEEKEND SCHEDULE</div>
            {SCHEDULE.map(({day,sessions})=>(
              <div key={day} style={{ marginBottom:"1.35rem" }}>
                <div className="k-mono" style={{ fontSize:"0.5rem", letterSpacing:"0.26em", color:"var(--t3)", marginBottom:"0.5rem", paddingBottom:"0.38rem", borderBottom:"1px solid var(--border)" }}>{day}</div>
                {sessions.map(({name,time,done,next})=>(
                  <div key={name} style={{ display:"flex", alignItems:"center", gap:"1rem", padding:"0.82rem 1.05rem", marginBottom:"0.38rem", background:next?"rgba(0,200,255,0.05)":"var(--surface)", border:`1px solid ${next?"rgba(0,200,255,0.2)":"var(--border)"}`, borderLeft:`2.5px solid ${next?"var(--accent)":done?"var(--border-s)":"var(--border)"}`, borderRadius:"0 2px 2px 0" }}>
                    <div style={{ flex:1 }}>
                      <div className="k-display" style={{ fontSize:"0.92rem", fontWeight:800, color:done?"var(--t3)":"var(--t1)", letterSpacing:"0.04em" }}>{name}</div>
                      <div className="k-mono" style={{ fontSize:"0.5rem", color:next?"var(--accent)":"var(--t3)", marginTop:"0.13rem" }}>{time} IST</div>
                    </div>
                    {next && <div className="k-mono" style={{ fontSize:"0.44rem", letterSpacing:"0.18em", color:"var(--accent)", background:"rgba(0,200,255,0.08)", padding:"0.24rem 0.48rem", border:"1px solid rgba(0,200,255,0.2)", borderRadius:2 }}>UPCOMING</div>}
                    {done && <div className="k-mono" style={{ fontSize:"0.44rem", color:"var(--t3)" }}>DONE</div>}
                  </div>
                ))}
              </div>
            ))}
            {/* Prediction */}
            <div style={{ background:"var(--surface)", border:"1px solid var(--border)", padding:"1.25rem", borderRadius:2, marginTop:"1rem" }}>
              <div className="k-mono" style={{ fontSize:"0.52rem", letterSpacing:"0.22em", color:"var(--accent)", marginBottom:"0.85rem", opacity:0.8 }}>PREDICT THE PODIUM</div>
              {predDone ? (
                <div style={{ textAlign:"center", padding:"0.5rem" }}>
                  <div className="k-display" style={{ fontSize:"1.2rem", fontWeight:900, color:"var(--accent)" }}>PREDICTION LOCKED</div>
                  <div style={{ fontSize:"0.8rem", color:"var(--t2)", marginTop:"0.35rem" }}>P1: {prediction}</div>
                  <div style={{ fontSize:"0.72rem", color:"var(--t3)", marginTop:"0.2rem" }}>We&apos;ll reveal your result after the race.</div>
                </div>
              ) : (
                <>
                  <div className="k-mono" style={{ fontSize:"0.5rem", color:"var(--t3)", marginBottom:"0.55rem" }}>Who will finish first?</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:"0.38rem", marginBottom:"0.85rem" }}>
                    {DRIVERS.filter(d=>d.cls==="future").map(d=>(
                      <div key={d.id} onClick={()=>setPrediction(d.name)} style={{ padding:"0.55rem 0.85rem", border:`1px solid ${prediction===d.name?"var(--accent)":"var(--border)"}`, background:prediction===d.name?"rgba(0,200,255,0.08)":"var(--surface)", cursor:"pointer", borderRadius:2, fontSize:"0.82rem", color:"var(--t1)", transition:"all .16s" }}>
                        {prediction===d.name?"🥇 ":""}{d.name} <span style={{ color:"var(--t3)" }}>#{d.num}</span>
                      </div>
                    ))}
                  </div>
                  <button className="k-btn-primary" style={{ width:"100%", justifyContent:"center", fontSize:"0.8rem" }} onClick={()=>{ if(!auth.loggedIn){onAuthOpen();return;} if(prediction)setPredDone(true); }}>SUBMIT PREDICTION →</button>
                </>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

function TeamsPage({ auth, onTeam, onAuthOpen }: { auth: Auth; onTeam: (t: Team) => void; onAuthOpen: () => void }) {
  return (
    <div style={{ background:"var(--bg)", minHeight:"100vh", padding:"7rem 2rem 5rem" }}>
      <div style={{ maxWidth:1280, margin:"0 auto" }}>
        <Reveal>
          <div className="k-mono" style={{ fontSize:"0.58rem", letterSpacing:"0.3em", color:"var(--accent)", marginBottom:"0.55rem", opacity:0.7 }}>2026 SEASON</div>
          <h1 className="k-display" style={{ fontSize:"clamp(2.5rem,7vw,5rem)", fontWeight:900, color:"var(--t1)", lineHeight:0.92, marginBottom:"2.75rem" }}>THE TEAMS</h1>
        </Reveal>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"1.5rem" }} className="k-grid-2col">
          {TEAMS.map((team,i)=>{
            const tDrivers = DRIVERS.filter(d=>d.team===team.name);
            const following = auth.followed.teams.has(team.name);
            return (
              <Reveal key={team.name} delay={i*0.08}>
                <div className="k-team-card" style={{ borderTop:`2px solid ${team.color}38`, cursor:"pointer" }}
                  onMouseEnter={e=>{Object.assign(e.currentTarget.style,{borderTopColor:team.color,background:`${team.color}05`,transform:"translateY(-4px)",boxShadow:`0 16px 44px rgba(0,0,0,0.38)`});}}
                  onMouseLeave={e=>{Object.assign(e.currentTarget.style,{borderTopColor:`${team.color}38`,background:"var(--surface)",transform:"none",boxShadow:"none"});}}>
                  <div style={{ height:180, position:"relative", overflow:"hidden" }} onClick={()=>onTeam(team)}>
                    <img src={team.img} alt={team.name} loading="lazy" style={{ width:"100%", height:"100%", objectFit:"cover", filter:"brightness(0.55) contrast(1.1)", transition:"transform .55s ease" }}
                      onMouseEnter={e=>(e.currentTarget.style.transform="scale(1.06)")}
                      onMouseLeave={e=>(e.currentTarget.style.transform="scale(1)")} />
                    <div style={{ position:"absolute", inset:0, background:`linear-gradient(0deg,var(--bg) 0%,transparent 50%)` }} />
                    <div style={{ position:"absolute", top:"1rem", right:"1rem" }}><TeamLogo abbr={team.abbr} color={team.color} size={36} /></div>
                    <div style={{ position:"absolute", top:"1rem", left:"1rem" }}><ClassBadge cls={team.cls} /></div>
                  </div>
                  <div style={{ padding:"1rem 1.25rem 1.4rem" }} onClick={()=>onTeam(team)}>
                    <div className="k-display" style={{ fontSize:"1.3rem", fontWeight:900, color:"var(--t1)", lineHeight:1, marginBottom:"0.45rem" }}>{team.name.toUpperCase()}</div>
                    <p style={{ fontSize:"0.8rem", color:"var(--t2)", lineHeight:1.65, marginBottom:"0.9rem" }}>{team.desc}</p>
                    <div className="k-mono" style={{ fontSize:"0.44rem", color:"var(--t3)", marginBottom:"0.4rem" }}>DRIVERS</div>
                    {tDrivers.map(d=><div key={d.id} style={{ fontSize:"0.8rem", color:"var(--t1)", marginBottom:"0.15rem" }}>#{d.num} {d.name}</div>)}
                    <div style={{ display:"flex", gap:"1.25rem", marginTop:"1rem", borderTop:"1px solid var(--border)", paddingTop:"0.8rem" }}>
                      {([["PTS",team.pts],["WINS",team.wins],["POD",team.podiums]] as [string,number][]).map(([l,v])=>(
                        <div key={l}>
                          <div className="k-display" style={{ fontSize:"1.45rem", fontWeight:900, color:team.color, lineHeight:1 }}>{v}</div>
                          <div className="k-mono" style={{ fontSize:"0.42rem", color:"var(--t3)", letterSpacing:"0.14em", marginTop:"0.08rem" }}>{l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ padding:"0 1.25rem 1.25rem", display:"flex", gap:"0.6rem" }}>
                    <button onClick={()=>onTeam(team)} className="k-btn-outline" style={{ flex:1, justifyContent:"center", fontSize:"0.66rem", padding:"0.48rem 0.85rem" }}>EXPLORE TEAM →</button>
                    <button onClick={e=>{e.stopPropagation();auth.loggedIn?onTeam(team):onAuthOpen();}} style={{ padding:"0.48rem 0.75rem", border:`1px solid ${following?"var(--accent)":"var(--border)"}`, background:following?"rgba(0,200,255,0.08)":"var(--surface)", color:following?"var(--accent)":"var(--t2)", fontFamily:"'JetBrains Mono',monospace", fontSize:"0.54rem", cursor:"pointer", borderRadius:2, transition:"all .18s" }}>{following?"✓":"♡"}</button>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DashboardPage({ auth, go, onDriver, onTickets }: { auth: Auth; go: (p: Page) => void; onDriver: (d: Driver) => void; onTickets: () => void }) {
  if (!auth.loggedIn) return null;
  const followedDrivers = DRIVERS.filter(d=>auth.followed.drivers.has(d.id));
  const followedTeams   = TEAMS.filter(t=>auth.followed.teams.has(t.name));
  return (
    <div style={{ background:"var(--bg)", minHeight:"100vh", padding:"7rem 2rem 5rem" }}>
      <div style={{ maxWidth:1280, margin:"0 auto" }}>
        <div className="k-mono" style={{ fontSize:"0.58rem", letterSpacing:"0.3em", color:"var(--accent)", marginBottom:"0.55rem", opacity:0.7 }}>PERSONAL</div>
        <h1 className="k-display" style={{ fontSize:"clamp(2rem,6vw,4.5rem)", fontWeight:900, color:"var(--t1)", lineHeight:0.92, marginBottom:"0.4rem" }}>MY KALCHAKRA</h1>
        <p style={{ color:"var(--t2)", marginBottom:"3rem", fontSize:"0.9rem" }}>WELCOME BACK, {auth.user?.name?.toUpperCase() || "FAN"}</p>
        {/* Next race card */}
        <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderTop:"2px solid var(--accent)", padding:"1.75rem", marginBottom:"2rem", borderRadius:2 }}>
          <div className="k-mono" style={{ fontSize:"0.5rem", letterSpacing:"0.28em", color:"var(--accent)", marginBottom:"0.75rem", opacity:0.75 }}>NEXT RACE</div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"1.25rem" }}>
            <div>
              <div className="k-display" style={{ fontSize:"1.55rem", fontWeight:900, color:"var(--t1)" }}>KALCHAKRA GRAND PRIX</div>
              <div style={{ fontSize:"0.8rem", color:"var(--t2)" }}>Rajpath Circuit · Delhi · 12 Oct 2026</div>
            </div>
            <Countdown compact />
          </div>
          <div style={{ display:"flex", gap:"0.65rem", marginTop:"1.1rem" }}>
            <button className="k-btn-primary" style={{ fontSize:"0.72rem", padding:"0.52rem 1.1rem" }} onClick={onTickets}>WATCH RACE →</button>
            <button className="k-btn-outline" style={{ fontSize:"0.72rem", padding:"0.52rem 1.1rem" }} onClick={()=>go("race-center")}>RACE CENTER</button>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.5rem", marginBottom:"2rem" }} className="k-grid-2col">
          {/* Followed drivers */}
          <div style={{ background:"var(--surface)", border:"1px solid var(--border)", padding:"1.4rem", borderRadius:2 }}>
            <div className="k-mono" style={{ fontSize:"0.5rem", letterSpacing:"0.22em", color:"var(--t3)", marginBottom:"1rem" }}>FOLLOWED DRIVERS ({followedDrivers.length})</div>
            {followedDrivers.length===0
              ? <div style={{ fontSize:"0.82rem", color:"var(--t3)" }}>Follow drivers to see them here.</div>
              : followedDrivers.map(d=>(
                  <div key={d.id} onClick={()=>onDriver(d)} style={{ display:"flex", alignItems:"center", gap:"0.75rem", padding:"0.6rem 0", borderBottom:"1px solid var(--border)", cursor:"pointer" }}>
                    <img src={d.img} alt={d.name} loading="lazy" style={{ width:36, height:36, objectFit:"cover", objectPosition:"top", borderRadius:2, filter:"brightness(0.82)" }} />
                    <div style={{ flex:1 }}>
                      <div className="k-display" style={{ fontSize:"0.9rem", fontWeight:800, color:"var(--t1)" }}>{d.name}</div>
                      <div style={{ fontSize:"0.72rem", color:CLS_META[d.cls].color }}>{d.team}</div>
                    </div>
                    <div className="k-display" style={{ fontSize:"1.1rem", fontWeight:900, color:"var(--t1)" }}>P{d.pos}</div>
                  </div>
                ))
            }
          </div>
          {/* Followed teams */}
          <div style={{ background:"var(--surface)", border:"1px solid var(--border)", padding:"1.4rem", borderRadius:2 }}>
            <div className="k-mono" style={{ fontSize:"0.5rem", letterSpacing:"0.22em", color:"var(--t3)", marginBottom:"1rem" }}>FOLLOWED TEAMS ({followedTeams.length})</div>
            {followedTeams.length===0
              ? <div style={{ fontSize:"0.82rem", color:"var(--t3)" }}>Follow teams to see them here.</div>
              : followedTeams.map(t=>(
                  <div key={t.name} style={{ display:"flex", alignItems:"center", gap:"0.75rem", padding:"0.6rem 0", borderBottom:"1px solid var(--border)" }}>
                    <TeamLogo abbr={t.abbr} color={t.color} size={34} />
                    <div style={{ flex:1 }}>
                      <div className="k-display" style={{ fontSize:"0.9rem", fontWeight:800, color:"var(--t1)" }}>{t.name}</div>
                      <div style={{ fontSize:"0.72rem", color:t.color }}>{CLS_META[t.cls].label}</div>
                    </div>
                    <div className="k-display" style={{ fontSize:"1.1rem", fontWeight:900, color:t.color }}>{t.pts}p</div>
                  </div>
                ))
            }
          </div>
        </div>
        {/* Activity summary */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1px", background:"var(--border)", borderRadius:2, overflow:"hidden" }}>
          {([["FOLLOWING",`${followedDrivers.length} Drivers`],["TEAMS",`${followedTeams.length} Teams`],["PREDICTIONS",auth.prediction?"1":"0"],["REMINDERS",auth.reminders.size.toString()]] as [string,string][]).map(([l,v])=>(
            <div key={l} style={{ background:"var(--bg)", padding:"1.25rem", textAlign:"center" }}>
              <div className="k-display" style={{ fontSize:"2rem", fontWeight:900, color:"var(--accent)", lineHeight:1 }}>{v}</div>
              <div className="k-mono" style={{ fontSize:"0.46rem", color:"var(--t3)", letterSpacing:"0.14em", marginTop:"0.2rem" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────────

function Footer({ go, onTickets }: { go: (p: Page) => void; onTickets: () => void }) {
  const links: {label:string;key:Page}[] = [{label:"CHAMPIONSHIP",key:"home"},{label:"RACING",key:"racing"},{label:"DRIVERS",key:"drivers"},{label:"TEAMS",key:"teams"},{label:"STANDINGS",key:"standings"},{label:"RACE CENTER",key:"race-center"}];
  return (
    <footer style={{ background:"var(--bg2)", borderTop:"1px solid var(--border)", padding:"2.5rem 2rem" }}>
      <div style={{ maxWidth:1280, margin:"0 auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"1.25rem", marginBottom:"1.5rem" }}>
          <div>
            <div className="k-display" style={{ fontSize:"1rem", fontWeight:900, letterSpacing:"0.1em", color:"var(--t1)" }}>KALCHAKRA</div>
            <div className="k-mono" style={{ fontSize:"0.48rem", color:"var(--t3)", letterSpacing:"0.22em" }}>MULTINATIONAL CHAMPIONSHIP · EVERY ERA. ONE TRACK.</div>
          </div>
          <div style={{ display:"flex", gap:"1.4rem", flexWrap:"wrap" }}>
            {links.map(({label,key})=>(
              <button key={key} onClick={()=>{go(key);window.scrollTo(0,0);}} className="k-mono" style={{ background:"none", border:"none", cursor:"pointer", fontSize:"0.54rem", letterSpacing:"0.16em", color:"var(--t3)", transition:"color .18s" }}
                onMouseEnter={e=>(e.currentTarget.style.color="var(--t1)")}
                onMouseLeave={e=>(e.currentTarget.style.color="var(--t3)")}>{label}</button>
            ))}
          </div>
          <button className="k-btn-primary" style={{ fontSize:"0.66rem", padding:"0.52rem 1.1rem" }} onClick={onTickets}>BUY TICKETS</button>
        </div>
        <div style={{ display:"flex", gap:"1.5rem", borderTop:"1px solid var(--border)", paddingTop:"1rem", alignItems:"center", flexWrap:"wrap" }}>
          <div className="k-mono" style={{ fontSize:"0.46rem", color:"var(--t3)", letterSpacing:"0.14em" }}>© 2026 KALCHAKRA CHAMPIONSHIP</div>
          <div style={{ display:"flex", gap:"0.5rem" }}>
            {(["heritage","human","motor","future"] as RacingClass[]).map(cls=>(
              <span key={cls} style={{ fontSize:"1rem" }} title={CLS_META[cls].label}>{CLS_META[cls].icon}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── App Root ────────────────────────────────────────────────────────────────────

export default function App() {
  const [introPlayed, setIntroPlayed] = useState(false);
  const [page,    setPage]    = useState<Page>("home");
  const [scrolled,setScrolled]= useState(false);
  const [theme,   setTheme]   = useState<Theme>("dark");
  const [driver,  setDriver]  = useState<Driver|null>(null);
  const [team,    setTeam]    = useState<Team|null>(null);
  const [heritage,setHeritage]= useState(false);
  const [tickets, setTickets] = useState(false);
  const [authOpen,setAuthOpen]= useState(false);
  const [authMode,setAuthMode]= useState<"login"|"signup">("login");
  const [participateCls, setParticipateCls] = useState<RacingClass|null>(null);
  const [auth, setAuth] = useState<Auth>({
    loggedIn:false, user:null,
    followed:{ drivers:new Set<number>(), teams:new Set<string>() },
    reminders: new Set<string>(),
    prediction: null,
  });

  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, [theme]);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 36);
    window.addEventListener("scroll", fn, { passive:true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const go = useCallback((p: Page) => { setPage(p); window.scrollTo(0,0); }, []);
  const openDriver = useCallback((d: Driver) => setDriver(d), []);
  const openTeam   = useCallback((t: Team)   => setTeam(t),   []);
  const toggleTheme= useCallback(() => setTheme(t=>t==="dark"?"light":"dark"), []);
  const openAuth   = useCallback((mode: "login"|"signup" = "login") => { setAuthMode(mode); setAuthOpen(true); }, []);

  const handleAuth = useCallback((name: string, email: string) => {
    setAuth(a => ({ ...a, loggedIn:true, user:{ name, email } }));
    setPage("dashboard");
  }, []);

  const toggleReminder = useCallback((round: string) => {
    setAuth(a => {
      const s = new Set(a.reminders);
      s.has(round) ? s.delete(round) : s.add(round);
      return { ...a, reminders: s };
    });
  }, []);

  const handleLogout = useCallback(() => {
    setAuth({ loggedIn:false, user:null, followed:{ drivers:new Set(), teams:new Set() }, reminders:new Set(), prediction:null });
    setPage("home");
  }, []);

  const toggleFollowDriver = useCallback((id: number) => {
    setAuth(a => {
      const s = new Set(a.followed.drivers);
      s.has(id) ? s.delete(id) : s.add(id);
      return { ...a, followed: { ...a.followed, drivers: s } };
    });
  }, []);

  const toggleFollowTeam = useCallback((name: string) => {
    setAuth(a => {
      const s = new Set(a.followed.teams);
      s.has(name) ? s.delete(name) : s.add(name);
      return { ...a, followed: { ...a.followed, teams: s } };
    });
  }, []);

  return (
    <div style={{ background:"var(--bg)", minHeight:"100%", transition:"background .45s ease" }}>
      {!introPlayed && <IntroScreen onDone={()=>setIntroPlayed(true)} />}

      <Nav page={page} go={go} scrolled={scrolled} theme={theme} toggleTheme={toggleTheme}
        auth={auth} onAuthOpen={()=>openAuth()} onTickets={()=>setTickets(true)} onLogout={handleLogout} />

      <main>
        {page==="home"        && <HomePage go={go} auth={auth} onAuthOpen={()=>openAuth("signup")} onDriver={openDriver} onTeam={openTeam} onHeritage={()=>setHeritage(true)} onTickets={()=>setTickets(true)} onParticipate={cls=>setParticipateCls(cls)} />}
        {page==="racing"      && <RacingPage go={go} />}
        {page==="drivers"     && <DriversPage auth={auth} onDriver={openDriver} onAuthOpen={()=>openAuth()} />}
        {page==="standings"   && <StandingsPage onDriver={openDriver} />}
        {page==="race-center" && <RaceCenterPage auth={auth} onTickets={()=>setTickets(true)} onAuthOpen={()=>openAuth()} onToggleReminder={toggleReminder} />}
        {page==="teams"       && <TeamsPage auth={auth} onTeam={openTeam} onAuthOpen={()=>openAuth()} />}
        {page==="dashboard"   && <DashboardPage auth={auth} go={go} onDriver={openDriver} onTickets={()=>setTickets(true)} />}
      </main>

      <Footer go={go} onTickets={()=>setTickets(true)} />

      {driver && <DriverModal driver={driver} auth={auth} onClose={()=>setDriver(null)} onFollow={toggleFollowDriver} onTeam={t=>{setDriver(null);openTeam(t);}} onAuthOpen={()=>{setDriver(null);openAuth();}} />}
      {team   && <TeamModal   team={team}     auth={auth} onClose={()=>setTeam(null)}   onFollow={toggleFollowTeam}   onDriver={openDriver} onAuthOpen={()=>{setTeam(null);openAuth();}} />}
      {heritage && <HeritageModal onClose={()=>setHeritage(false)} />}
      {tickets  && <TicketsModal  onClose={()=>setTickets(false)}  />}
      {authOpen && <AuthModal mode={authMode} onClose={()=>setAuthOpen(false)} onAuth={handleAuth} />}
      {participateCls && <ParticipationModal initial={participateCls} onClose={()=>setParticipateCls(null)} />}
    </div>
  );
}
