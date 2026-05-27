import { useState, useRef, useCallback, useEffect } from "react";

const EMPTY = {
  scheme_id:        "",
  name_english:     "",
  name_regional:    "",
  department:       "",
  state:            "Tamil Nadu",
  eligibility_rules: {
    gender:              "",
    age_min:             "",
    age_max:             "",
    income_limit_annual: "",
  },
  benefits:                  "",
  benefits_tamil:            "",
  documents_required:        "",
  documents_tamil:           "",
  timeline: {
    closing_date: "",
    is_recurring: false,
  },
  official_application_url:   "",
  application_modality:       "",
  application_modality_tamil: "",
};

const DEPARTMENTS = [
  "Social Welfare", "Agriculture", "Education", "Health", "Housing",
  "Labour and Employment", "Adi Dravidar and Tribal Welfare",
  "Backward Classes Welfare", "Other",
];

// ── Scheme Manager ────────────────────────────────────────────────
export function SchemeManager() {
  const [schemes, setSchemes]   = useState([]);
  const [search, setSearch]     = useState("");
  const [deleted, setDeleted]   = useState([]);
  const [exported, setExported] = useState(false);

  useEffect(() => {
    fetch("/schemes.json")
      .then(r => r.json())
      .then(data => setSchemes(data))
      .catch(() => setSchemes([]));
  }, []);

  const visible = schemes.filter(s =>
    s.name_english.toLowerCase().includes(search.toLowerCase()) ||
    s.department.toLowerCase().includes(search.toLowerCase())
  );

  function remove(id) {
    setDeleted(d => [...d, id]);
    setSchemes(s => s.filter(x => x.scheme_id !== id));
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(schemes, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "schemes.json"; a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  }

  return (
    <div style={{minHeight:"100vh", background:"#f9fafb"}}>
      <div style={{maxWidth:"800px", margin:"0 auto", padding:"24px 16px"}}>

        {/* Header */}
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"24px", paddingBottom:"16px", borderBottom:"1px solid #e5e7eb"}}>
          <div>
            <h1 style={{fontSize:"17px", fontWeight:"600", margin:"0"}}>Manage Schemes</h1>
            <p style={{fontSize:"12px", color:"#9ca3af", margin:"4px 0 0"}}>
              Remove ended or unavailable schemes · {schemes.length} total
            </p>
          </div>
          <div style={{display:"flex", gap:"8px"}}>
            <a href="/admin" style={{fontSize:"12px", border:"1px solid #d1d5db", borderRadius:"8px", padding:"6px 12px", color:"#4b5563", textDecoration:"none", background:"white"}}>
              ← Editor
            </a>
            <a href="/" style={{fontSize:"12px", border:"1px solid #d1d5db", borderRadius:"8px", padding:"6px 12px", color:"#4b5563", textDecoration:"none", background:"white"}}>
              Portal
            </a>
          </div>
        </div>

        {/* Removed count banner */}
        {deleted.length > 0 && (
          <div style={{background:"#fef2f2", border:"1px solid #fecaca", borderRadius:"10px", padding:"10px 14px", marginBottom:"16px"}}>
            <p style={{fontSize:"12px", color:"#b91c1c", margin:"0"}}>
              ⚠ {deleted.length} scheme{deleted.length > 1 ? "s" : ""} removed. Download the updated file below to save changes.
            </p>
          </div>
        )}

        {/* Search */}
        <input
          style={{width:"100%", border:"1px solid #e5e7eb", borderRadius:"10px", padding:"10px 12px", fontSize:"13px", background:"white", boxSizing:"border-box", marginBottom:"16px", outline:"none"}}
          placeholder="Search schemes…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {/* List */}
        {visible.length === 0 && (
          <p style={{textAlign:"center", color:"#9ca3af", fontSize:"13px", padding:"40px 0"}}>
            {schemes.length === 0 ? "Loading…" : "No schemes match your search"}
          </p>
        )}

        {visible.map(s => {
          const days      = s.timeline?.closing_date
            ? Math.ceil((new Date(s.timeline.closing_date) - new Date()) / 86400000)
            : null;
          const isExpired = days !== null && days < 0;
          const isUrgent  = days !== null && days >= 0 && days <= 14;

          return (
            <div key={s.scheme_id} style={{
              border:`1px solid ${isExpired ? "#fecaca" : "#e5e7eb"}`,
              borderRadius:"12px", padding:"14px 16px", marginBottom:"10px",
              background: isExpired ? "#fff5f5" : "white",
              display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px"
            }}>
              <div style={{flex:1, minWidth:0}}>
                <div style={{display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap"}}>
                  <p style={{fontSize:"13px", fontWeight:"500", margin:"0"}}>{s.name_english}</p>
                  {isExpired && (
                    <span style={{fontSize:"10px", background:"#fee2e2", color:"#b91c1c", padding:"1px 6px", borderRadius:"999px", fontWeight:"500"}}>
                      Expired
                    </span>
                  )}
                  {isUrgent && !isExpired && (
                    <span style={{fontSize:"10px", background:"#fffbeb", color:"#b45309", padding:"1px 6px", borderRadius:"999px", fontWeight:"500"}}>
                      {days}d left
                    </span>
                  )}
                </div>
                <p style={{fontSize:"11px", color:"#9ca3af", margin:"3px 0 0"}}>
                  {s.scheme_id} · {s.department}
                  {s.timeline?.closing_date ? ` · Closes ${s.timeline.closing_date}` : " · Ongoing"}
                </p>
              </div>
              <button
                onClick={() => remove(s.scheme_id)}
                style={{fontSize:"12px", background:"#fef2f2", border:"1px solid #fecaca", color:"#b91c1c", borderRadius:"8px", padding:"6px 12px", cursor:"pointer", whiteSpace:"nowrap"}}
              >
                Remove
              </button>
            </div>
          );
        })}

        {/* Export */}
        {schemes.length > 0 && (
          <div style={{marginTop:"20px", background:"white", border:"1px solid #e5e7eb", borderRadius:"12px", padding:"16px"}}>
            <p style={{fontSize:"13px", fontWeight:"500", margin:"0 0 4px"}}>Save changes</p>
            <p style={{fontSize:"12px", color:"#6b7280", margin:"0 0 12px"}}>
              Download the updated file, then replace{" "}
              <code style={{background:"#f3f4f6", padding:"1px 5px", borderRadius:"4px"}}>src/data/schemes.json</code> with it.
            </p>
            <button
              onClick={exportJSON}
              style={{background:"#15803d", color:"white", border:"none", borderRadius:"8px", padding:"8px 18px", fontSize:"13px", fontWeight:"500", cursor:"pointer"}}
            >
              {exported ? "✓ Downloaded!" : `Download schemes.json (${schemes.length} schemes)`}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Translation ───────────────────────────────────────────────────
async function translateToTamil(text) {
  if (!text.trim()) return "";
  const url  = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ta`;
  const res  = await fetch(url);
  const data = await res.json();
  if (data.responseStatus === 200) return data.responseData.translatedText;
  throw new Error("Translation failed");
}

// ── Debounce hook ─────────────────────────────────────────────────
function useDebounce(fn, delay) {
  const timer = useRef(null);
  return useCallback((...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
}

// ── Shared styles ─────────────────────────────────────────────────
const inputStyle = {
  width:"100%", border:"1px solid #d1d5db", borderRadius:"8px",
  padding:"8px 10px", fontSize:"13px", background:"white",
  boxSizing:"border-box", outline:"none", display:"block",
};
const sectionStyle = {
  border:"1px solid #e5e7eb", borderRadius:"12px",
  padding:"16px", marginBottom:"16px", background:"white",
};
const errStyle = { fontSize:"11px", color:"#ef4444", marginTop:"3px" };

function Label({ text, required, translating }) {
  return (
    <div style={{display:"flex", alignItems:"center", gap:"6px", marginBottom:"4px"}}>
      <p style={{fontSize:"11px", fontWeight:"500", color:"#6b7280", margin:"0", textTransform:"uppercase", letterSpacing:"0.05em"}}>
        {text} {required && <span style={{color:"#ef4444"}}>*</span>}
      </p>
      {translating && (
        <span style={{fontSize:"10px", color:"#6366f1", background:"#eef2ff", padding:"1px 6px", borderRadius:"999px"}}>
          translating…
        </span>
      )}
    </div>
  );
}

// ── Translated field pair ─────────────────────────────────────────
function TranslatedPair({ labelEn, labelTa, valueEn, valueTa, onChangeEn, onChangeTa,
  placeholderEn, placeholderTa, multiline, required, errorEn, errorTa }) {

  const [translating, setTranslating] = useState(false);

  const doTranslate = useCallback(async (text) => {
    if (!text.trim()) { onChangeTa(""); return; }
    setTranslating(true);
    try {
      const result = await translateToTamil(text);
      onChangeTa(result);
    } catch {
      // keep existing value
    } finally {
      setTranslating(false);
    }
  }, [onChangeTa]);

  const debouncedTranslate = useDebounce(doTranslate, 800);

  function handleEnChange(val) {
    onChangeEn(val);
    debouncedTranslate(val);
  }

  const Tag = multiline ? "textarea" : "input";

  return (
    <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px"}}>
      <div>
        <Label text={labelEn} required={required} />
        <Tag
          style={{...inputStyle, borderColor: errorEn ? "#ef4444" : "#d1d5db", ...(multiline ? {resize:"vertical"} : {})}}
          rows={multiline ? 3 : undefined}
          placeholder={placeholderEn}
          value={valueEn}
          onChange={e => handleEnChange(e.target.value)}
        />
        {errorEn && <p style={errStyle}>{errorEn}</p>}
      </div>
      <div>
        <Label text={labelTa} translating={translating} />
        <Tag
          style={{...inputStyle, borderColor: errorTa ? "#ef4444" : "#d1d5db", background: translating ? "#f5f3ff" : "white", ...(multiline ? {resize:"vertical"} : {})}}
          rows={multiline ? 3 : undefined}
          placeholder={translating ? "Translating…" : placeholderTa}
          value={valueTa}
          onChange={e => onChangeTa(e.target.value)}
        />
        {errorTa && <p style={errStyle}>{errorTa}</p>}
      </div>
    </div>
  );
}

// ── Admin Editor ──────────────────────────────────────────────────
export default function AdminEditor() {
  const [form, setForm]     = useState(EMPTY);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState({});

  function set(key, val)     { setForm(f => ({ ...f, [key]: val })); setErrors(e => ({ ...e, [key]: undefined })); }
  function setElig(key, val) { setForm(f => ({ ...f, eligibility_rules: { ...f.eligibility_rules, [key]: val } })); }
  function setTime(key, val) { setForm(f => ({ ...f, timeline: { ...f.timeline, [key]: val } })); }

  function validate() {
    const e = {};
    if (!form.scheme_id.trim())                e.scheme_id                = "Required";
    if (!form.name_english.trim())             e.name_english             = "Required";
    if (!form.name_regional.trim())            e.name_regional            = "Required";
    if (!form.department.trim())               e.department               = "Required";
    if (!form.benefits.trim())                 e.benefits                 = "Required";
    if (!form.benefits_tamil.trim())           e.benefits_tamil           = "Required";
    if (!form.documents_required.trim())       e.documents_required       = "Required";
    if (!form.official_application_url.trim()) e.official_application_url = "Required";
    return e;
  }

  function generate() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    const docsEn = form.documents_required.split("\n").map(d => d.trim()).filter(Boolean);
    const docsTa = form.documents_tamil.split("\n").map(d => d.trim()).filter(Boolean);

    const json = {
      scheme_id:     form.scheme_id.trim(),
      name_english:  form.name_english.trim(),
      name_regional: form.name_regional.trim(),
      department:    form.department.trim(),
      state:         "Tamil Nadu",
      eligibility_rules: {
        gender:              form.eligibility_rules.gender || null,
        age_range:           (form.eligibility_rules.age_min && form.eligibility_rules.age_max)
                               ? [parseInt(form.eligibility_rules.age_min), parseInt(form.eligibility_rules.age_max)]
                               : null,
        income_limit_annual: form.eligibility_rules.income_limit_annual
                               ? parseInt(form.eligibility_rules.income_limit_annual)
                               : null,
      },
      benefits:       form.benefits.trim(),
      benefits_tamil: form.benefits_tamil.trim(),
      documents_required: docsEn,
      documents_tamil:    docsTa.length > 0 ? docsTa : null,
      timeline: {
        closing_date: form.timeline.closing_date || null,
        is_recurring: form.timeline.is_recurring,
      },
      official_application_url:   form.official_application_url.trim(),
      application_modality:       form.application_modality.trim()       || null,
      application_modality_tamil: form.application_modality_tamil.trim() || null,
    };

    setOutput(JSON.stringify(json, null, 2));
  }

  function copy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function reset() { setForm(EMPTY); setOutput(""); setErrors({}); setCopied(false); }

  return (
    <div style={{minHeight:"100vh", background:"#f9fafb"}}>
      <div style={{maxWidth:"800px", margin:"0 auto", padding:"24px 16px"}}>

        {/* Header */}
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"24px", paddingBottom:"16px", borderBottom:"1px solid #e5e7eb"}}>
          <div>
            <h1 style={{fontSize:"17px", fontWeight:"600", margin:"0"}}>Scheme Editor</h1>
            <p style={{fontSize:"12px", color:"#9ca3af", margin:"4px 0 0"}}>Type in English — Tamil translates automatically</p>
          </div>
          <div style={{display:"flex", gap:"8px"}}>
            <a href="/manage" style={{fontSize:"12px", border:"1px solid #d1d5db", borderRadius:"8px", padding:"6px 12px", color:"#4b5563", textDecoration:"none", background:"white"}}>
              Manage
            </a>
            <a href="/" style={{fontSize:"12px", border:"1px solid #d1d5db", borderRadius:"8px", padding:"6px 12px", color:"#4b5563", textDecoration:"none", background:"white"}}>
              ← Portal
            </a>
          </div>
        </div>

        {/* 1. Identity */}
        <div style={sectionStyle}>
          <p style={{fontSize:"13px", fontWeight:"600", marginBottom:"14px", color:"#111827"}}>1. Identity</p>

          <div style={{marginBottom:"12px"}}>
            <Label text="Scheme ID (e.g. ST-TN-004)" required />
            <input
              style={{...inputStyle, borderColor: errors.scheme_id ? "#ef4444" : "#d1d5db"}}
              placeholder="ST-TN-004"
              value={form.scheme_id}
              onChange={e => set("scheme_id", e.target.value)}
            />
            {errors.scheme_id && <p style={errStyle}>{errors.scheme_id}</p>}
            <p style={{fontSize:"11px", color:"#9ca3af", marginTop:"3px"}}>Use the next number after the last entry in schemes.json</p>
          </div>

          <div style={{marginBottom:"12px"}}>
            <TranslatedPair
              labelEn="Name in English" labelTa="பெயர் தமிழில்"
              valueEn={form.name_english} valueTa={form.name_regional}
              onChangeEn={v => set("name_english", v)} onChangeTa={v => set("name_regional", v)}
              placeholderEn="Pudhumai Penn Scheme" placeholderTa="புதுமைப் பெண் திட்டம்"
              required errorEn={errors.name_english} errorTa={errors.name_regional}
            />
          </div>

          <div>
            <Label text="Department" required />
            <select
              style={{...inputStyle, borderColor: errors.department ? "#ef4444" : "#d1d5db"}}
              value={form.department}
              onChange={e => set("department", e.target.value)}
            >
              <option value="">Select department…</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            {errors.department && <p style={errStyle}>{errors.department}</p>}
          </div>
        </div>

        {/* 2. Eligibility */}
        <div style={sectionStyle}>
          <p style={{fontSize:"13px", fontWeight:"600", marginBottom:"14px", color:"#111827"}}>2. Eligibility</p>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"12px", marginBottom:"12px"}}>
            <div>
              <Label text="Gender" />
              <select style={inputStyle} value={form.eligibility_rules.gender}
                onChange={e => setElig("gender", e.target.value)}>
                <option value="">Any</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>
            <div>
              <Label text="Min Age" />
              <input style={inputStyle} type="number" placeholder="17"
                value={form.eligibility_rules.age_min}
                onChange={e => setElig("age_min", e.target.value)} />
            </div>
            <div>
              <Label text="Max Age" />
              <input style={inputStyle} type="number" placeholder="30"
                value={form.eligibility_rules.age_max}
                onChange={e => setElig("age_max", e.target.value)} />
            </div>
          </div>
          <div>
            <Label text="Annual Income Limit (₹) — leave blank if no limit" />
            <input style={inputStyle} type="number" placeholder="200000"
              value={form.eligibility_rules.income_limit_annual}
              onChange={e => setElig("income_limit_annual", e.target.value)} />
          </div>
        </div>

        {/* 3. Benefits */}
        <div style={sectionStyle}>
          <p style={{fontSize:"13px", fontWeight:"600", marginBottom:"14px", color:"#111827"}}>3. Benefits</p>
          <TranslatedPair
            labelEn="Benefits in English" labelTa="பலன்கள் தமிழில்"
            valueEn={form.benefits} valueTa={form.benefits_tamil}
            onChangeEn={v => set("benefits", v)} onChangeTa={v => set("benefits_tamil", v)}
            placeholderEn="₹1,000/month deposited to bank account until degree completion"
            placeholderTa="மாதம் ₹1,000 வங்கி கணக்கில் வரவு வைக்கப்படும்"
            multiline required errorEn={errors.benefits} errorTa={errors.benefits_tamil}
          />
        </div>

        {/* 4. Documents */}
        <div style={sectionStyle}>
          <p style={{fontSize:"13px", fontWeight:"600", marginBottom:"4px", color:"#111827"}}>4. Documents Required</p>
          <p style={{fontSize:"11px", color:"#9ca3af", marginBottom:"14px"}}>One document per line — Tamil column auto-fills</p>
          <TranslatedPair
            labelEn="English" labelTa="தமிழில்"
            valueEn={form.documents_required} valueTa={form.documents_tamil}
            onChangeEn={v => set("documents_required", v)} onChangeTa={v => set("documents_tamil", v)}
            placeholderEn={"Aadhaar Card\nSchool Certificate\nBank Passbook"}
            placeholderTa={"ஆதார் அட்டை\nபள்ளி சான்றிதழ்\nவங்கி பாஸ்புக்"}
            multiline required errorEn={errors.documents_required}
          />
        </div>

        {/* 5. Timeline */}
        <div style={sectionStyle}>
          <p style={{fontSize:"13px", fontWeight:"600", marginBottom:"14px", color:"#111827"}}>5. Timeline</p>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px"}}>
            <div>
              <Label text="Closing Date — leave blank if ongoing" />
              <input style={inputStyle} type="date"
                value={form.timeline.closing_date}
                onChange={e => setTime("closing_date", e.target.value)} />
            </div>
            <div style={{display:"flex", alignItems:"center", gap:"10px", paddingTop:"20px"}}>
              <input type="checkbox" id="recurring" checked={form.timeline.is_recurring}
                onChange={e => setTime("is_recurring", e.target.checked)}
                style={{width:"16px", height:"16px", cursor:"pointer"}} />
              <label htmlFor="recurring" style={{fontSize:"13px", color:"#374151", cursor:"pointer"}}>
                Recurring scheme
              </label>
            </div>
          </div>
        </div>

        {/* 6. Application */}
        <div style={sectionStyle}>
          <p style={{fontSize:"13px", fontWeight:"600", marginBottom:"14px", color:"#111827"}}>6. Application</p>
          <div style={{marginBottom:"12px"}}>
            <Label text="Official URL" required />
            <input
              style={{...inputStyle, borderColor: errors.official_application_url ? "#ef4444" : "#d1d5db"}}
              type="url" placeholder="https://penkalvi.tn.gov.in/"
              value={form.official_application_url}
              onChange={e => set("official_application_url", e.target.value)}
            />
            {errors.official_application_url && <p style={errStyle}>{errors.official_application_url}</p>}
          </div>
          <TranslatedPair
            labelEn="How to apply — English" labelTa="விண்ணப்பிக்கும் முறை — தமிழில்"
            valueEn={form.application_modality} valueTa={form.application_modality_tamil}
            onChangeEn={v => set("application_modality", v)} onChangeTa={v => set("application_modality_tamil", v)}
            placeholderEn="Online via state portal or College Nodal Officer"
            placeholderTa="மாநில இணையதளம் மூலம் விண்ணப்பிக்கலாம்"
            multiline
          />
        </div>

        {/* Actions */}
        <div style={{display:"flex", gap:"8px", marginBottom:"20px"}}>
          <button onClick={generate}
            style={{flex:1, background:"#15803d", color:"white", border:"none", borderRadius:"10px", padding:"11px", fontSize:"14px", fontWeight:"500", cursor:"pointer"}}>
            Generate JSON →
          </button>
          <button onClick={reset}
            style={{border:"1px solid #d1d5db", borderRadius:"10px", padding:"11px 20px", fontSize:"13px", color:"#6b7280", background:"white", cursor:"pointer"}}>
            Reset
          </button>
        </div>

        {/* Output */}
        {output && (
          <div>
            <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"8px"}}>
              <p style={{fontSize:"12px", fontWeight:"500", color:"#6b7280", margin:"0"}}>
                Copy → paste inside the <code style={{background:"#f3f4f6", padding:"1px 5px", borderRadius:"4px"}}>[ ]</code> array in{" "}
                <code style={{background:"#f3f4f6", padding:"1px 5px", borderRadius:"4px"}}>src/data/schemes.json</code>
              </p>
              <button onClick={copy}
                style={{fontSize:"12px", border:"1px solid #d1d5db", borderRadius:"6px", padding:"5px 12px", color:"#374151", background:"white", cursor:"pointer"}}>
                {copied ? "✓ Copied!" : "Copy JSON"}
              </button>
            </div>
            <pre style={{background:"#111827", color:"#4ade80", fontSize:"12px", borderRadius:"12px", padding:"16px", overflow:"auto", maxHeight:"400px", lineHeight:"1.6", margin:"0"}}>
              {output}
            </pre>
            <div style={{background:"#fffbeb", border:"1px solid #fde68a", borderRadius:"8px", padding:"10px 14px", marginTop:"10px"}}>
              <p style={{fontSize:"12px", color:"#92400e", margin:"0"}}>
                ⚠ Always review Tamil text before saving. Verify the scheme_id is unique in schemes.json.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}