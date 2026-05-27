import { useState, useMemo } from "react";
import schemesData from "./data/schemes.json";
import OnboardingModal from "./components/OnboardingModal.jsx";

// ── Design tokens ─────────────────────────────────────────────────
const C = {
  primary:      "#0d6e4f",
  primaryLight: "#e6f4ef",
  primaryMid:   "#1a8a63",
  amber:        "#d97706",
  amberLight:   "#fef3c7",
  amberBorder:  "#fcd34d",
  red:          "#dc2626",
  redLight:     "#fef2f2",
  redBorder:    "#fecaca",
  text:         "#1a1a2e",
  textSub:      "#6b7280",
  textMuted:    "#9ca3af",
  border:       "#e5e7eb",
  borderMid:    "#d1d5db",
  bg:           "#f8fafc",
  white:        "#ffffff",
  card:         "#ffffff",
  surface:      "#f1f5f9",
};

const DEPT_THEMES = {
  "Social Welfare":             { bg:"#fdf4ff", color:"#7e22ce", border:"#e9d5ff", icon:"🤝" },
  "Agriculture":                { bg:"#f0fdf4", color:"#166534", border:"#bbf7d0", icon:"🌾" },
  "Education":                  { bg:"#eff6ff", color:"#1e40af", border:"#bfdbfe", icon:"📚" },
  "Health":                     { bg:"#fff1f2", color:"#be123c", border:"#fecdd3", icon:"🏥" },
  "Housing":                    { bg:"#fff7ed", color:"#c2410c", border:"#fed7aa", icon:"🏠" },
  "Labour and Employment":      { bg:"#f0f9ff", color:"#0369a1", border:"#bae6fd", icon:"💼" },
  "Adi Dravidar and Tribal Welfare": { bg:"#fefce8", color:"#854d0e", border:"#fef08a", icon:"🌿" },
  "Backward Classes Welfare":   { bg:"#fdf4ff", color:"#86198f", border:"#f0abfc", icon:"⭐" },
};
const deptTheme = (dept) => DEPT_THEMES[dept] ?? { bg:"#f8fafc", color:"#374151", border:"#e5e7eb", icon:"📋" };

// ── Translations ──────────────────────────────────────────────────
const T = {
  title:        ["Tamil Nadu Government Scheme Portal", "தமிழ்நாடு அரசின் திட்டங்கள் இணையதளம்"],
  subtitle:     ["Find welfare schemes you qualify for", "உங்களுக்கு தகுதியான நலத்திட்டங்களை கண்டறியுங்கள்"],
  offline:      ["Works offline", "இணையம் இல்லாமல் பயன்படுத்தலாம்"],
  search:       ["Search schemes…", "திட்டங்களை தேடுங்கள்…"],
  department:   ["Department", "துறை"],
  gender:       ["Gender", "பாலினம்"],
  status:       ["Status", "நிலை"],
  all:          ["All", "அனைத்தும்"],
  female:       ["Female", "பெண்"],
  male:         ["Male", "ஆண்"],
  open:         ["Open", "திறந்திருக்கிறது"],
  recurring:    ["Recurring", "தொடர்ச்சியான"],
  match:        ["Find my schemes", "என் திட்டங்களை காண்"],
  showing:      ["Showing", "காட்டுகிறது"],
  schemes:      ["schemes", "திட்டங்கள்"],
  age:          ["Your age", "உங்கள் வயது"],
  income:       ["Annual income (₹)", "ஆண்டு வருமானம் (₹)"],
  find:         ["Show matching schemes →", "பொருந்தும் திட்டங்களை காட்டு →"],
  ongoing:      ["Ongoing", "தொடர்ச்சியான"],
  filters:      ["Filter", "வடிகட்டு"],
  clearAll:     ["Clear all", "அனைத்தையும் நீக்கு"],
  noResults:    ["No schemes found", "திட்டங்கள் எதுவும் இல்லை"],
  noResultsSub: ["Try adjusting your filters", "வேறு வடிகட்டிகளை முயற்சிக்கவும்"],
  totalSchemes: ["Schemes", "திட்டங்கள்"],
  openNow:      ["Open Now", "திறந்திருக்கிறது"],
  departments:  ["Departments", "துறைகள்"],
  urgentClose:  ["Closing Soon", "விரைவில் முடிகிறது"],
  langToggle:   ["தமிழ்", "EN"],
  hideDetails:  ["Hide details ↑", "மூடு ↑"],
  seeDetails:   ["View details ↓", "விவரங்கள் ↓"],
  eligibility:  ["Who can apply", "யார் விண்ணப்பிக்கலாம்"],
  documents:    ["Documents needed", "தேவையான ஆவணங்கள்"],
  howToApply:   ["How to apply", "விண்ணப்பிக்கும் முறை"],
  closes:       ["Closes", "கடைசி நாள்"],
  resetMatch:   ["Clear", "நீக்கு"],
  matched:      ["schemes match your profile", "திட்டங்கள் உங்களுக்கு பொருந்துகின்றன"],
  applyNow:     ["Apply Now ↗", "இப்போது விண்ணப்பிக்க ↗"],
  changeProfile:["Change profile", "சுயவிவரம் மாற்று"],
  filteredFor:  ["Showing schemes for your profile", "உங்கள் சுயவிவரத்திற்கான திட்டங்கள்"],
};

function tx(key, lang) { return T[key]?.[lang] ?? T[key]?.[0]; }

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useState(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  });
  return isMobile;
}

// ── Deadline badge ────────────────────────────────────────────────
function DeadlineBadge({ scheme, lang }) {
  const days = daysUntil(scheme.timeline?.closing_date);
  if (!scheme.timeline?.closing_date)
    return (
      <span style={{fontSize:"11px", color:C.textMuted, background:C.surface, padding:"3px 8px", borderRadius:"6px"}}>
        ∞ {tx("ongoing", lang)}
      </span>
    );
  if (days < 0)
    return (
      <span style={{fontSize:"11px", color:C.red, background:C.redLight, padding:"3px 8px", borderRadius:"6px", fontWeight:"500"}}>
        ✕ {lang === 1 ? "காலாவதியானது" : "Expired"}
      </span>
    );
  if (days <= 14)
    return (
      <span style={{fontSize:"11px", color:C.red, background:C.redLight, border:`1px solid ${C.redBorder}`, padding:"3px 10px", borderRadius:"6px", fontWeight:"600"}}>
        ⚠ {lang === 1 ? `${days} நாட்கள் மட்டுமே` : `${days} days left!`}
      </span>
    );
  if (days <= 60)
    return (
      <span style={{fontSize:"11px", color:C.amber, background:C.amberLight, border:`1px solid ${C.amberBorder}`, padding:"3px 10px", borderRadius:"6px", fontWeight:"500"}}>
        ◷ {lang === 1 ? `${days} நாட்களில் முடிகிறது` : `${days} days left`}
      </span>
    );
  return (
    <span style={{fontSize:"11px", color:C.textMuted, background:C.surface, padding:"3px 8px", borderRadius:"6px"}}>
      📅 {tx("closes", lang)} {scheme.timeline.closing_date}
    </span>
  );
}

// ── Hero stat card ────────────────────────────────────────────────
function StatCard({ value, label, icon, bg, color }) {
  return (
    <div style={{background:bg, borderRadius:"16px", padding:"16px 12px", textAlign:"center", flex:1}}>
      <div style={{fontSize:"22px", marginBottom:"4px"}}>{icon}</div>
      <p style={{fontSize:"24px", fontWeight:"700", color, margin:"0", lineHeight:"1"}}>{value}</p>
      <p style={{fontSize:"11px", color, margin:"6px 0 0", opacity:"0.75", lineHeight:"1.3", fontWeight:"500"}}>{label}</p>
    </div>
  );
}

function StatBar({ data, lang }) {
  const total   = data.length;
  const openNow = data.filter(s => { const d = daysUntil(s.timeline?.closing_date); return d === null || d > 0; }).length;
  const depts   = new Set(data.map(s => s.department)).size;
  const urgent  = data.filter(s => { const d = daysUntil(s.timeline?.closing_date); return d !== null && d <= 14 && d > 0; }).length;

  return (
    <div style={{display:"flex", gap:"10px", marginBottom:"20px", overflowX:"auto", paddingBottom:"4px"}}>
      <StatCard value={total}   label={tx("totalSchemes", lang)} icon="📋" bg="#e6f4ef" color={C.primary} />
      <StatCard value={openNow} label={tx("openNow",      lang)} icon="✅" bg="#ecfdf5" color="#059669" />
      <StatCard value={depts}   label={tx("departments",  lang)} icon="🏛" bg="#eff6ff" color="#1d4ed8" />
      <StatCard value={urgent}  label={tx("urgentClose",  lang)} icon="⏰" bg={C.redLight} color={C.red} />
    </div>
  );
}

// ── Filter chip ───────────────────────────────────────────────────
function Chip({ label, active, onClick, icon }) {
  return (
    <button onClick={onClick} style={{
      display:"inline-flex", alignItems:"center", gap:"4px",
      fontSize:"12px", padding:"6px 12px", borderRadius:"999px", cursor:"pointer",
      border:     active ? `1.5px solid ${C.primary}` : `1px solid ${C.border}`,
      background: active ? C.primaryLight : C.white,
      color:      active ? C.primary : C.textSub,
      fontWeight: active ? "600" : "400",
      whiteSpace: "nowrap",
      transition: "all 0.15s",
    }}>
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );
}

// ── Empty state ───────────────────────────────────────────────────
function EmptyState({ lang, onClear }) {
  return (
    <div style={{textAlign:"center", padding:"60px 20px", background:C.white, borderRadius:"20px", border:`1px solid ${C.border}`}}>
      <div style={{fontSize:"48px", marginBottom:"12px"}}>🔍</div>
      <p style={{fontSize:"16px", fontWeight:"600", color:C.text, marginBottom:"6px"}}>{tx("noResults", lang)}</p>
      <p style={{fontSize:"13px", color:C.textMuted, marginBottom:"20px"}}>{tx("noResultsSub", lang)}</p>
      <button onClick={onClear} style={{background:C.primary, color:C.white, border:"none", borderRadius:"10px", padding:"10px 24px", fontSize:"13px", fontWeight:"500", cursor:"pointer"}}>
        {tx("clearAll", lang)}
      </button>
    </div>
  );
}

// ── Scheme card ───────────────────────────────────────────────────
function SchemeCard({ scheme, lang, expanded, onToggle }) {
  const s  = scheme;
  const dt = deptTheme(s.department);
  const name    = lang === 1 ? s.name_regional : s.name_english;
  const subname = lang === 1 ? s.name_english  : s.name_regional;
  const benefit = lang === 1 && s.benefits_tamil ? s.benefits_tamil : s.benefits;

  return (
    <div style={{
      background: C.card, borderRadius:"20px", marginBottom:"14px",
      border:`1px solid ${C.border}`, overflow:"hidden",
      boxShadow:"0 1px 4px rgba(0,0,0,0.06)",
      transition:"box-shadow 0.2s",
    }}>
      {/* Color accent bar */}
      <div style={{height:"4px", background:`linear-gradient(90deg, ${dt.color}, ${dt.color}88)`}} />

      <div style={{padding:"16px"}}>
        {/* Top row */}
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"10px", marginBottom:"10px"}}>
          <div style={{flex:1, minWidth:0}}>
            {/* Dept pill */}
            <div style={{display:"inline-flex", alignItems:"center", gap:"4px", background:dt.bg, border:`1px solid ${dt.border}`, borderRadius:"6px", padding:"2px 8px", marginBottom:"6px"}}>
              <span style={{fontSize:"12px"}}>{dt.icon}</span>
              <span style={{fontSize:"11px", color:dt.color, fontWeight:"600"}}>{s.department}</span>
            </div>
            <p style={{fontWeight:"700", fontSize:"15px", margin:"0", lineHeight:"1.3", color:C.text}}>{name}</p>
            <p style={{fontSize:"12px", color:C.textMuted, margin:"3px 0 0"}}>{subname}</p>
          </div>
        </div>

        {/* Benefit highlight box */}
        <div style={{background:C.surface, borderRadius:"12px", padding:"12px 14px", marginBottom:"12px", borderLeft:`3px solid ${C.primary}`}}>
          <p style={{fontSize:"13px", color:C.text, margin:"0", lineHeight:"1.6", fontWeight:"500"}}>{benefit}</p>
        </div>

        {/* Footer row */}
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"8px"}}>
          <div style={{display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap"}}>
            <DeadlineBadge scheme={s} lang={lang} />
            <button onClick={onToggle} style={{fontSize:"12px", color:C.primary, background:"none", border:"none", cursor:"pointer", padding:"0", fontWeight:"500", textDecoration:"underline", textUnderlineOffset:"2px"}}>
              {expanded ? tx("hideDetails", lang) : tx("seeDetails", lang)}
            </button>
          </div>
          <a href={s.official_application_url} target="_blank" rel="noopener noreferrer"
            style={{
              display:"inline-flex", alignItems:"center", gap:"4px",
              background:C.primary, color:C.white, borderRadius:"10px",
              padding:"8px 16px", fontSize:"12px", fontWeight:"600",
              textDecoration:"none", boxShadow:"0 2px 6px rgba(13,110,79,0.3)",
            }}>
            {tx("applyNow", lang)}
          </a>
        </div>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div style={{borderTop:`1px solid ${C.border}`, background:C.surface, padding:"16px"}}>

          {/* Eligibility */}
          <p style={{fontSize:"11px", fontWeight:"700", color:C.textSub, marginBottom:"8px", textTransform:"uppercase", letterSpacing:"0.08em"}}>
            {tx("eligibility", lang)}
          </p>
          <div style={{display:"flex", flexWrap:"wrap", gap:"6px", marginBottom:"16px"}}>
            {s.eligibility_rules.gender && (
              <span style={{fontSize:"12px", background:C.white, border:`1px solid ${C.border}`, borderRadius:"8px", padding:"5px 12px", fontWeight:"500"}}>
                {s.eligibility_rules.gender === "Female" ? "👩 " : "👨 "}
                {lang === 1 ? (s.eligibility_rules.gender === "Female" ? "பெண்" : "ஆண்") : s.eligibility_rules.gender}
              </span>
            )}
            {s.eligibility_rules.age_range && (
              <span style={{fontSize:"12px", background:C.white, border:`1px solid ${C.border}`, borderRadius:"8px", padding:"5px 12px", fontWeight:"500"}}>
                🎂 {lang === 1 ? `வயது ${s.eligibility_rules.age_range[0]}–${s.eligibility_rules.age_range[1]}` : `Age ${s.eligibility_rules.age_range[0]}–${s.eligibility_rules.age_range[1]}`}
              </span>
            )}
            {s.eligibility_rules.income_limit_annual && (
              <span style={{fontSize:"12px", background:C.white, border:`1px solid ${C.border}`, borderRadius:"8px", padding:"5px 12px", fontWeight:"500"}}>
                💰 {lang === 1 ? `வருமானம் ≤₹${s.eligibility_rules.income_limit_annual.toLocaleString("en-IN")}` : `Income ≤₹${s.eligibility_rules.income_limit_annual.toLocaleString("en-IN")}`}
              </span>
            )}
            {!s.eligibility_rules.gender && !s.eligibility_rules.age_range && !s.eligibility_rules.income_limit_annual && (
              <span style={{fontSize:"12px", color:C.primary, background:C.primaryLight, borderRadius:"8px", padding:"5px 12px", fontWeight:"500"}}>
                ✓ {lang === 1 ? "அனைவருக்கும் பொருந்தும்" : "Open to everyone"}
              </span>
            )}
          </div>

          {/* Documents */}
          <p style={{fontSize:"11px", fontWeight:"700", color:C.textSub, marginBottom:"10px", textTransform:"uppercase", letterSpacing:"0.08em"}}>
            {tx("documents", lang)}
          </p>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px", marginBottom:"16px"}}>
            {s.documents_required.map((d, i) => (
              <div key={i} style={{display:"flex", alignItems:"center", gap:"8px", background:C.white, border:`1px solid ${C.border}`, borderRadius:"8px", padding:"8px 10px"}}>
                <span style={{width:"20px", height:"20px", borderRadius:"6px", background:C.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", flexShrink:0}}>📄</span>
                <span style={{fontSize:"12px", color:C.text, lineHeight:"1.3"}}>
                  {lang === 1 && s.documents_tamil?.[i] ? s.documents_tamil[i] : d}
                </span>
              </div>
            ))}
          </div>

          {/* How to apply */}
          <p style={{fontSize:"11px", fontWeight:"700", color:C.textSub, marginBottom:"6px", textTransform:"uppercase", letterSpacing:"0.08em"}}>
            {tx("howToApply", lang)}
          </p>
          <div style={{background:C.white, border:`1px solid ${C.border}`, borderRadius:"10px", padding:"12px 14px"}}>
            <p style={{fontSize:"13px", color:C.text, margin:"0", lineHeight:"1.6"}}>
              🗺 {lang === 1 && s.application_modality_tamil ? s.application_modality_tamil : s.application_modality}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Eligibility calculator ────────────────────────────────────────
function EligibilityCalc({ lang, onMatch, onClose }) {
  const [profile, setProfile] = useState({ age:"", gender:"", income:"" });

  function run() {
    const age    = parseInt(profile.age);
    const income = parseInt(profile.income);
    const ids = schemesData.filter(s => {
      const r = s.eligibility_rules;
      if (age    && r.age_range           && (age  < r.age_range[0] || age > r.age_range[1])) return false;
      if (profile.gender && r.gender      && r.gender !== profile.gender)                      return false;
      if (income && r.income_limit_annual && income  > r.income_limit_annual)                  return false;
      return true;
    }).map(s => s.scheme_id);
    onMatch(ids);
  }

  const iS = {
    width:"100%", border:`1px solid ${C.borderMid}`, borderRadius:"10px",
    padding:"10px 14px", fontSize:"14px", marginBottom:"10px",
    background:C.white, boxSizing:"border-box", display:"block", outline:"none",
    color: C.text,
  };

  return (
    <div style={{background:"linear-gradient(135deg, #e6f4ef, #f0fdf4)", border:`1px solid #a7f3d0`, borderRadius:"20px", padding:"20px", marginBottom:"16px"}}>
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px"}}>
        <div>
          <p style={{fontSize:"15px", fontWeight:"700", color:C.primary, margin:"0"}}>
            🎯 {tx("match", lang)}
          </p>
          <p style={{fontSize:"12px", color:C.textSub, margin:"4px 0 0"}}>
            {lang === 1 ? "உங்கள் விவரங்களை பதிவிடுங்கள்" : "Tell us about yourself"}
          </p>
        </div>
        <button onClick={onClose} style={{background:C.white, border:`1px solid ${C.border}`, borderRadius:"8px", width:"32px", height:"32px", cursor:"pointer", fontSize:"16px", display:"flex", alignItems:"center", justifyContent:"center", color:C.textSub}}>✕</button>
      </div>
      <input type="number" placeholder={tx("age", lang)} value={profile.age}
        onChange={e => setProfile({...profile, age:e.target.value})} style={iS} />
      <select value={profile.gender} onChange={e => setProfile({...profile, gender:e.target.value})} style={iS}>
        <option value="">{lang === 1 ? "பாலினம் தேர்ந்தெடுக்கவும்" : "Select gender"}</option>
        <option value="Female">{tx("female", lang)}</option>
        <option value="Male">{tx("male", lang)}</option>
      </select>
      <input type="number" placeholder={tx("income", lang)} value={profile.income}
        onChange={e => setProfile({...profile, income:e.target.value})} style={{...iS, marginBottom:"14px"}} />
      <button onClick={run} style={{
        width:"100%", background:C.primary, color:C.white, border:"none",
        borderRadius:"12px", padding:"12px", fontSize:"14px", fontWeight:"600",
        cursor:"pointer", boxShadow:"0 2px 8px rgba(13,110,79,0.3)",
      }}>
        {tx("find", lang)}
      </button>
    </div>
  );
}

// ── Filter panel ──────────────────────────────────────────────────
function FilterPanel({ lang, filters, setFilters, setMatchedIds, deptOptions, setShowCalc }) {
  const label = (text) => (
    <p style={{fontSize:"11px", fontWeight:"700", color:C.textSub, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"8px", marginTop:0}}>
      {text}
    </p>
  );

  function setDept(v)   { setFilters(f => ({...f, dept:   v})); setMatchedIds(null); }
  function setGender(v) { setFilters(f => ({...f, gender: v})); setMatchedIds(null); }
  function setStatus(v) { setFilters(f => ({...f, status: v})); setMatchedIds(null); }

  return (
    <div>
      <div style={{marginBottom:"20px"}}>
        {label(tx("department", lang))}
        <div style={{display:"flex", flexWrap:"wrap", gap:"6px"}}>
          {deptOptions.map(o => {
            const dt = o === "All" ? null : deptTheme(o);
            return (
              <Chip key={o}
                label={o === "All" ? tx("all", lang) : o}
                icon={dt?.icon}
                active={filters.dept === o}
                onClick={() => setDept(o)}
              />
            );
          })}
        </div>
      </div>

      <div style={{marginBottom:"20px"}}>
        {label(tx("gender", lang))}
        <div style={{display:"flex", flexWrap:"wrap", gap:"6px"}}>
          {[["All","",tx("all",lang)],["Female","👩",tx("female",lang)],["Male","👨",tx("male",lang)]].map(([val,icon,lbl]) => (
            <Chip key={val} label={lbl} icon={icon} active={filters.gender === val} onClick={() => setGender(val)} />
          ))}
        </div>
      </div>

      <div style={{marginBottom:"20px"}}>
        {label(tx("status", lang))}
        <div style={{display:"flex", flexWrap:"wrap", gap:"6px"}}>
          {[["All","",tx("all",lang)],["open","✅",tx("open",lang)],["recurring","🔄",tx("recurring",lang)]].map(([val,icon,lbl]) => (
            <Chip key={val} label={lbl} icon={icon} active={filters.status === val} onClick={() => setStatus(val)} />
          ))}
        </div>
      </div>

      <div style={{borderTop:`1px solid ${C.border}`, paddingTop:"16px"}}>
        <button onClick={() => setShowCalc(v => !v)} style={{
          width:"100%", background:"linear-gradient(135deg, #0d6e4f, #1a8a63)",
          color:C.white, border:"none", borderRadius:"12px", padding:"11px",
          fontSize:"13px", fontWeight:"600", cursor:"pointer",
          boxShadow:"0 2px 8px rgba(13,110,79,0.25)",
          display:"flex", alignItems:"center", justifyContent:"center", gap:"6px",
        }}>
          🎯 {tx("match", lang)}
        </button>
      </div>
    </div>
  );
}

// ── Root component ────────────────────────────────────────────────
export default function App() {
  const isMobile = useIsMobile();

  const [lang, setLang] = useState(() => {
    const s = localStorage.getItem("pref_lang");
    return s !== null ? Number(s) : 1;
  });

  const [showOnboarding, setShowOnboarding] = useState(() => {
    try { return localStorage.getItem("userProfile") === null; } catch { return true; }
  });
  const [userProfile, setUserProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem("userProfile")) ?? {}; } catch { return {}; }
  });

  const [search, setSearch]                       = useState("");
  const [filters, setFilters]                     = useState({ dept:"All", gender:"All", status:"All" });
  const [matchedIds, setMatchedIds]               = useState(null);
  const [showCalc, setShowCalc]                   = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expanded, setExpanded]                   = useState(null);

  const deptOptions = ["All", ...new Set(schemesData.map(s => s.department))];
  
  function handleLangToggle() {
    setLang(p => { const n = p === 0 ? 1 : 0; localStorage.setItem("pref_lang", n); return n; });
  }

  function handleOnboardingDone(profile) {
    setUserProfile(profile);
    setShowOnboarding(false);
    if (profile.gender) setFilters(f => ({...f, gender: profile.gender}));
  }

  function clearAll() {
    setSearch(""); setFilters({ dept:"All", gender:"All", status:"All" });
    setMatchedIds(null); setShowCalc(false); setShowMobileFilters(false);
  }

  const filtered = useMemo(() => {
    return schemesData.filter(s => {
      const r = s.eligibility_rules;
      if (userProfile.age) {
        const age = parseInt(userProfile.age);
        if (r.age_range && (age < r.age_range[0] || age > r.age_range[1])) return false;
      }
      if (userProfile.income) {
        const income = parseInt(userProfile.income);
        if (r.income_limit_annual && income > r.income_limit_annual) return false;
      }
      if (matchedIds && !matchedIds.includes(s.scheme_id)) return false;
      if (!matchedIds) {
        if (filters.dept   !== "All" && s.department !== filters.dept) return false;
        if (filters.gender !== "All" && r.gender && r.gender !== filters.gender) return false;
        if (filters.status === "recurring" && !s.timeline?.is_recurring) return false;
        if (filters.status === "open") {
          const d = daysUntil(s.timeline?.closing_date);
          if (d !== null && d <= 0) return false;
        }
      }
      const q = search.toLowerCase();
      if (q && ![s.name_english, s.name_regional, s.benefits, s.benefits_tamil, s.department]
        .some(f => f?.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [search, filters, matchedIds, userProfile]);

  const hasProfile = Object.values(userProfile).some(v => v);

  return (
    <div style={{minHeight:"100vh", background:C.bg}}>

      {/* ── Top nav ── */}
      <div style={{background:C.white, borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}>
        <div style={{maxWidth:"1000px", margin:"0 auto", padding: isMobile ? "12px 16px" : "14px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px"}}>
          <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
            <div style={{width:"36px", height:"36px", background:`linear-gradient(135deg, ${C.primary}, ${C.primaryMid})`, borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px", flexShrink:0}}>
              🏛
            </div>
            <div>
              <p style={{fontSize: isMobile ? "13px" : "15px", fontWeight:"700", margin:"0", color:C.text, lineHeight:"1.2"}}>
                {tx("title", lang)}
              </p>
              {!isMobile && (
                <p style={{fontSize:"11px", color:C.textMuted, margin:"1px 0 0"}}>{tx("subtitle", lang)}</p>
              )}
            </div>
          </div>
          <div style={{display:"flex", alignItems:"center", gap:"8px", flexShrink:0}}>
            {!isMobile && (
              <span style={{fontSize:"11px", color:C.primary, background:C.primaryLight, border:`1px solid #a7f3d0`, padding:"4px 10px", borderRadius:"999px", fontWeight:"500"}}>
                ✓ {tx("offline", lang)}
              </span>
            )}
            <button onClick={() => { localStorage.removeItem("userProfile"); setUserProfile({}); setShowOnboarding(true); }}
  style={{
    fontSize:"12px", border:`1.5px solid ${C.border}`, borderRadius:"8px",
    padding:"6px 10px", color:C.textSub, background:C.white, cursor:"pointer",
    fontWeight:"500",
  }}
  title="Reset profile"
>
  👤
</button>
            <button onClick={handleLangToggle} style={{
              fontSize:"12px", border:`1.5px solid ${C.border}`, borderRadius:"8px",
              padding:"6px 12px", color:C.text, background:C.white, cursor:"pointer",
              fontWeight:"600", minWidth:"52px",
            }}>
              {tx("langToggle", lang)}
            </button>
          </div>
        </div>
      </div>

      <div style={{maxWidth:"1000px", margin:"0 auto", padding: isMobile ? "16px 12px" : "24px 24px"}}>

        {/* Stats */}
        <StatBar data={schemesData} lang={lang} />

        {/* Profile banner */}
        {hasProfile && (
          <div style={{background:"linear-gradient(135deg, #e6f4ef, #f0fdf4)", border:`1px solid #a7f3d0`, borderRadius:"14px", padding:"12px 16px", marginBottom:"16px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"8px"}}>
            <p style={{fontSize:"13px", color:C.primary, margin:"0", fontWeight:"500"}}>
              👤 {tx("filteredFor", lang)}
              {userProfile.age       && <span style={{background:C.white, borderRadius:"6px", padding:"1px 6px", marginLeft:"6px", fontSize:"12px"}}>🎂 {userProfile.age}</span>}
              {userProfile.gender    && <span style={{background:C.white, borderRadius:"6px", padding:"1px 6px", marginLeft:"4px", fontSize:"12px"}}>{userProfile.gender === "Female" ? "👩" : "👨"} {userProfile.gender}</span>}
              {userProfile.community && <span style={{background:C.white, borderRadius:"6px", padding:"1px 6px", marginLeft:"4px", fontSize:"12px"}}>⭐ {userProfile.community}</span>}
            </p>
            <button onClick={() => { localStorage.removeItem("userProfile"); setUserProfile({}); setShowOnboarding(true); }}
              style={{fontSize:"12px", color:C.primary, background:C.white, border:`1px solid #a7f3d0`, borderRadius:"8px", padding:"5px 12px", cursor:"pointer", fontWeight:"500"}}>
              ✏ {tx("changeProfile", lang)}
            </button>
          </div>
        )}

        {/* Search bar */}
        <div style={{position:"relative", marginBottom:"16px"}}>
          <span style={{position:"absolute", left:"14px", top:"50%", transform:"translateY(-50%)", fontSize:"16px", pointerEvents:"none"}}>🔍</span>
          <input
            style={{
              width:"100%", border:`1.5px solid ${C.border}`, borderRadius:"14px",
              padding:"12px 14px 12px 42px", fontSize:"14px", background:C.white,
              outline:"none", boxSizing:"border-box", color:C.text,
              boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
            }}
            placeholder={tx("search", lang)}
            value={search}
            onChange={e => { setSearch(e.target.value); setMatchedIds(null); }}
          />
          {isMobile && (
            <button onClick={() => setShowMobileFilters(v => !v)} style={{
              position:"absolute", right:"8px", top:"50%", transform:"translateY(-50%)",
              background: showMobileFilters ? C.primary : C.surface,
              color: showMobileFilters ? C.white : C.textSub,
              border:"none", borderRadius:"10px", padding:"6px 12px",
              fontSize:"12px", fontWeight:"600", cursor:"pointer",
            }}>
              ⚙ {tx("filters", lang)}
            </button>
          )}
        </div>

        {/* Mobile filter drawer */}
        {isMobile && showMobileFilters && (
          <div style={{background:C.white, border:`1px solid ${C.border}`, borderRadius:"16px", padding:"16px", marginBottom:"16px", boxShadow:"0 4px 16px rgba(0,0,0,0.08)"}}>
            <FilterPanel lang={lang} filters={filters} setFilters={setFilters}
              setMatchedIds={setMatchedIds} deptOptions={deptOptions}
              setShowCalc={setShowCalc} isMobile={isMobile} />
          </div>
        )}

        {/* Eligibility calc */}
        {showCalc && (
          <EligibilityCalc lang={lang}
            onMatch={ids => { setMatchedIds(ids); setShowCalc(false); setShowMobileFilters(false); }}
            onClose={() => setShowCalc(false)} />
        )}

        {/* Match banner */}
        {matchedIds && (
          <div style={{background:"linear-gradient(135deg, #e6f4ef, #ecfdf5)", border:`1px solid #a7f3d0`, borderRadius:"14px", padding:"12px 16px", marginBottom:"16px", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
            <p style={{fontSize:"13px", color:C.primary, fontWeight:"600", margin:"0"}}>
              🎯 {matchedIds.length} {tx("matched", lang)}
            </p>
            <button onClick={() => setMatchedIds(null)} style={{fontSize:"12px", color:C.primary, background:C.white, border:`1px solid #a7f3d0`, borderRadius:"8px", padding:"4px 12px", cursor:"pointer", fontWeight:"500"}}>
              ✕ {tx("resetMatch", lang)}
            </button>
          </div>
        )}

        {/* Main layout */}
        <div style={{display:"grid", gridTemplateColumns: isMobile ? "1fr" : "240px 1fr", gap:"20px", alignItems:"start"}}>

          {/* Desktop sidebar */}
          {!isMobile && (
            <div style={{background:C.white, border:`1px solid ${C.border}`, borderRadius:"20px", padding:"20px", position:"sticky", top:"80px", boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
              <FilterPanel lang={lang} filters={filters} setFilters={setFilters}
                setMatchedIds={setMatchedIds} deptOptions={deptOptions}
                setShowCalc={setShowCalc} isMobile={false} />
            </div>
          )}

          {/* Cards area */}
          <div>
            <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"14px"}}>
              <p style={{fontSize:"13px", color:C.textMuted, margin:"0", fontWeight:"500"}}>
                {tx("showing", lang)} <span style={{color:C.text, fontWeight:"700"}}>{filtered.length}</span> {tx("schemes", lang)}
              </p>
            </div>

            {filtered.length === 0
              ? <EmptyState lang={lang} onClear={clearAll} />
              : filtered.map(s => (
                  <SchemeCard key={s.scheme_id} scheme={s} lang={lang}
                    expanded={expanded === s.scheme_id}
                    onToggle={() => setExpanded(p => p === s.scheme_id ? null : s.scheme_id)} />
                ))
            }
          </div>
        </div>
      </div>

      {/* Onboarding */}
      {showOnboarding && (
        <OnboardingModal lang={lang} onDone={handleOnboardingDone} />
      )}
    </div>
  );
}