import { useState } from "react";

const COMMUNITIES = [
  "General", "OBC", "MBC", "BC", "SC", "ST", "Minority", "Other"
];

export default function OnboardingModal({ onDone, lang }) {
  const [step, setStep]       = useState(0);
  const [profile, setProfile] = useState({ age:"", gender:"", income:"", community:"" });

  function set(k, v) { setProfile(p => ({ ...p, [k]: v })); }

  function finish() {
    localStorage.setItem("userProfile", JSON.stringify(profile));
    onDone(profile);
  }

  function skip() {
    localStorage.setItem("userProfile", JSON.stringify({}));
    onDone({});
  }

  const isTamil = lang === 1;

  const steps = [
    {
      title:    isTamil ? "உங்கள் வயது என்ன?"              : "How old are you?",
      subtitle: isTamil ? "உங்களுக்கு பொருந்தும் திட்டங்களை காட்ட" : "So we can show schemes that match your age",
      field: (
        <input
          type="number" placeholder={isTamil ? "உ.ம். 25" : "e.g. 25"}
          value={profile.age}
          onChange={e => set("age", e.target.value)}
          style={inputS}
          autoFocus
        />
      ),
      canNext: true,
    },
    {
      title:    isTamil ? "பாலினம்?"    : "Your gender?",
      subtitle: isTamil ? "சில திட்டங்கள் பாலினம் அடிப்படையில் வழங்கப்படுகின்றன" : "Some schemes are gender-specific",
      field: (
        <div style={{display:"flex", flexDirection:"column", gap:"10px"}}>
          {[["Female", isTamil ? "பெண்" : "Female"], ["Male", isTamil ? "ஆண்" : "Male"], ["", isTamil ? "விருப்பமில்லை" : "Prefer not to say"]].map(([val, label]) => (
            <button key={label} onClick={() => set("gender", val)}
              style={{...optionS, background: profile.gender === val ? "#f0fdf4" : "white", borderColor: profile.gender === val ? "#4ade80" : "#e5e7eb", color: profile.gender === val ? "#166534" : "#374151"}}>
              {label}
            </button>
          ))}
        </div>
      ),
      canNext: true,
    },
    {
      title:    isTamil ? "ஆண்டு வருமானம்?"         : "Annual household income?",
      subtitle: isTamil ? "வருமான வரம்பு கொண்ட திட்டங்களை வடிகட்ட" : "To filter income-limited schemes",
      field: (
        <div style={{display:"flex", flexDirection:"column", gap:"10px"}}>
          {[
            ["50000",  isTamil ? "₹50,000க்கும் குறைவாக"       : "Below ₹50,000"],
            ["100000", isTamil ? "₹50,000 – ₹1,00,000"         : "₹50,000 – ₹1,00,000"],
            ["200000", isTamil ? "₹1,00,000 – ₹2,00,000"       : "₹1,00,000 – ₹2,00,000"],
            ["500000", isTamil ? "₹2,00,000க்கும் அதிகமாக"     : "Above ₹2,00,000"],
          ].map(([val, label]) => (
            <button key={val} onClick={() => set("income", val)}
              style={{...optionS, background: profile.income === val ? "#f0fdf4" : "white", borderColor: profile.income === val ? "#4ade80" : "#e5e7eb", color: profile.income === val ? "#166534" : "#374151"}}>
              {label}
            </button>
          ))}
        </div>
      ),
      canNext: true,
    },
    {
      title:    isTamil ? "சமூகம்?"         : "Community?",
      subtitle: isTamil ? "சமூக அடிப்படையிலான திட்டங்களை காட்ட" : "To surface community-specific schemes",
      field: (
        <div style={{display:"flex", flexWrap:"wrap", gap:"8px"}}>
          {COMMUNITIES.map(c => (
            <button key={c} onClick={() => set("community", c)}
              style={{...chipS, background: profile.community === c ? "#f0fdf4" : "white", borderColor: profile.community === c ? "#4ade80" : "#e5e7eb", color: profile.community === c ? "#166534" : "#374151"}}>
              {c}
            </button>
          ))}
        </div>
      ),
      canNext: true,
    },
  ];

  const current = steps[step];
  const isLast  = step === steps.length - 1;

  return (
    <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px"}}>
      <div style={{background:"white", borderRadius:"20px", padding:"28px 24px", maxWidth:"420px", width:"100%", boxShadow:"0 20px 60px rgba(0,0,0,0.15)"}}>

        {/* Progress dots */}
        <div style={{display:"flex", gap:"6px", marginBottom:"24px", justifyContent:"center"}}>
          {steps.map((_, i) => (
            <div key={i} style={{width: i === step ? "20px" : "6px", height:"6px", borderRadius:"999px", background: i <= step ? "#15803d" : "#e5e7eb", transition:"all 0.2s"}} />
          ))}
        </div>

        {/* Content */}
        <p style={{fontSize:"18px", fontWeight:"600", margin:"0 0 6px", color:"#111827", textAlign:"center"}}>{current.title}</p>
        <p style={{fontSize:"13px", color:"#9ca3af", margin:"0 0 20px", textAlign:"center"}}>{current.subtitle}</p>
        {current.field}

        {/* Nav buttons */}
        <div style={{display:"flex", gap:"8px", marginTop:"20px"}}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)}
              style={{flex:1, border:"1px solid #e5e7eb", borderRadius:"10px", padding:"10px", fontSize:"13px", color:"#6b7280", background:"white", cursor:"pointer"}}>
              {isTamil ? "பின்செல்" : "Back"}
            </button>
          )}
          <button
            onClick={() => isLast ? finish() : setStep(s => s + 1)}
            style={{flex:2, background:"#15803d", color:"white", border:"none", borderRadius:"10px", padding:"10px", fontSize:"13px", fontWeight:"500", cursor:"pointer"}}>
            {isLast
              ? (isTamil ? "திட்டங்களை காண்க →" : "Show my schemes →")
              : (isTamil ? "அடுத்து →" : "Next →")}
          </button>
        </div>

        {/* Skip */}
        <button onClick={skip}
          style={{width:"100%", background:"none", border:"none", fontSize:"12px", color:"#9ca3af", marginTop:"12px", cursor:"pointer", textDecoration:"underline"}}>
          {isTamil ? "இதை தவிர்க்கவும்" : "Skip — show all schemes"}
        </button>
      </div>
    </div>
  );
}

const inputS = {
  width:"100%", border:"1px solid #d1d5db", borderRadius:"10px",
  padding:"12px", fontSize:"15px", boxSizing:"border-box", outline:"none",
};
const optionS = {
  width:"100%", border:"1px solid #e5e7eb", borderRadius:"10px",
  padding:"12px 16px", fontSize:"14px", cursor:"pointer", textAlign:"left",
  fontWeight:"500", transition:"all 0.1s",
};
const chipS = {
  border:"1px solid #e5e7eb", borderRadius:"999px",
  padding:"8px 14px", fontSize:"13px", cursor:"pointer", fontWeight:"500",
};