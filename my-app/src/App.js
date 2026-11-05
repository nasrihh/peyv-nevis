import React, { useEffect, useRef, useState } from "react";
import logo from "./assets/logo.jpg";

import {
  UploadCloud, FileAudio, Play, Clock, Cpu, Check, Copy, FileText,
  Tags, Sparkles, X, Headphones, CircleHelp, AudioWaveform,
  Download, LogIn, UserPlus, User, History, LogOut, ShieldCheck,
  Languages, ChevronDown, LoaderCircle
} from "lucide-react";
import "./App.css";

const API_BASE_URL =  "http://127.0.0.1:8001";
const FORMATS = ["MP3", "WAV", "M4A", "MPEG", "MPGA", "WEBM"];
const INITIAL_DATA = {
  totalTime: "۱۰۹.۳۲ ثانیه",
  analysisTime: "۱۷.۱۴ ثانیه",
  sttTime: "۹۲.۱۸ ثانیه",
  transcript: "خیلی خوب دوستان از گذشته‌های دور و دیر باز مهم‌ترین دغدغه بشر برقراری ارتباط بوده. در طول دوران مختلف بشر تلاش کرده این ارتباط را ساده‌تر و باکیفیت‌تر کند. تلفن‌ها اختراع شدند تا انسان‌ها بتوانند از فاصله‌های دور با یکدیگر ارتباط برقرار کنند. در ابتدا ارتباط از طریق زوج‌سیم‌های مسی و مراکز سوئیچینگ انجام می‌شد. با پیشرفت فناوری، مراکز مخابراتی توسعه پیدا کردند و سپس فیبر نوری با افزایش چشمگیر کیفیت و سرعت ارتباطات وارد این حوزه شد.",
  summary: "در این کلاس درباره تاریخچه ارتباطات، تلفن‌های سانترال، مراکز سوئیچینگ و نقش فیبر نوری در بهبود کیفیت ارتباطات صحبت می‌شود.",
  tags: [
    { name: "تاریخچه ارتباطات", color: "tag-blue" },
    { name: "مراکز سوئیچینگ", color: "tag-orange" },
    { name: "فیبر نوری", color: "tag-green" },
    { name: "تکنولوژی مخابرات", color: "tag-pink" }
  ],
  questions: [
    "مراکز سوئیچینگ چه نقشی در ارتباطات تلفنی اولیه داشتند؟",
    "استفاده از فیبر نوری چه تأثیری بر کیفیت ارتباطات دارد؟",
    "تلفن سانترال چه کاربردی در سازمان‌ها دارد؟"
  ]
};

const readStored = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
};

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportDocument(data, format) {
  const safe = (value) => String(value ?? "").replace(/[&<>"]/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"
  }[c]));
  const html = `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8">
    <style>body{font-family:Tahoma,Arial,sans-serif;direction:rtl;line-height:2;padding:32px;color:#1e293b}
    h1{color:#4338ca}h2{color:#334155;border-bottom:1px solid #ddd;padding-bottom:6px}
    p,li{font-size:14px}</style></head><body>
    <h1>Peyv-Nevis | گزارش تحلیل صوت</h1>
    <h2>متن پیاده‌سازی‌شده</h2><p>${safe(data.transcript)}</p>
    <h2>خلاصه</h2><p>${safe(data.summary)}</p>
    <h2>تگ‌ها</h2><p>${safe((data.tags || []).map(t => t.name).join("، "))}</p>
    <h2>سؤالات</h2><ol>${(data.questions || []).map(q => `<li>${safe(q)}</li>`).join("")}</ol>
    ${data.factCheck ? `<h2>بررسی و اصلاح علمی</h2><p>${safe(data.factCheck)}</p>` : ""}
    </body></html>`;
  if (format === "pdf") {
    const w = window.open("", "_blank");
    if (!w) { alert("لطفاً اجازه باز شدن پنجره جدید را بدهید."); return; }
    w.document.open(); w.document.write(html); w.document.close();
    w.onload = () => { w.focus(); w.print(); };
    return;
  }
  const blob = new Blob(["\ufeff", html], { type: "application/msword;charset=utf-8" });
  downloadBlob(blob, "pey-nevis-report.doc");
}

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const submit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || (mode === "register" && !name.trim())) return;
    // نسخه نمایشی: برای احراز هویت واقعی باید این بخش به API امن متصل شود.
    const user = { name: name.trim() || email.split("@")[0], email };
    localStorage.setItem("peyNevisUser", JSON.stringify(user));
    onLogin(user);
  };
  return <main className="auth-shell" dir="rtl">
    <form className="auth-card" onSubmit={submit}>
      <img src={logo} alt="logo" className="logo"/>
     
      <p className="muted">فضای هوشمند تبدیل و تحلیل فایل‌های صوتی</p>
      <div className="auth-tabs">
        <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}><LogIn size={16}/> ورود</button>
        <button type="button" className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}><UserPlus size={16}/> ثبت‌نام</button>
      </div>
      {mode === "register" && <label>نام و نام خانوادگی<input value={name} onChange={e => setName(e.target.value)} placeholder="نام شما" required/></label>}
      <label>ایمیل<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" required/></label>
      <label>رمز عبور<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="حداقل ۶ کاراکتر" minLength={6} required/></label>
      <button className="primary-btn full" type="submit">{mode === "login" ? "ورود به حساب" : "ایجاد حساب کاربری"}</button>
    </form>
  </main>;
}

export default function App() {
  const [user, setUser] = useState(() => readStored("peyNevisUser", null));
  const [page, setPage] = useState("app");
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState("fa");
  const [loading, setLoading] = useState(false);
  const [factLoading, setFactLoading] = useState(false);
  const [factOpen, setFactOpen] = useState(false);
  const [factCheck, setFactCheck] = useState("");
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [resultData, setResultData] = useState(INITIAL_DATA);
  const [history, setHistory] = useState(() => readStored("peyNevisHistory", []));
  const fileInputRef = useRef(null);

  useEffect(() => localStorage.setItem("peyNevisHistory", JSON.stringify(history)), [history]);

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;
    const valid = /\.(mp3|wav|m4a|mpeg|mpga|webm)$/i.test(selectedFile.name);
    if (!valid) { setNotice("فرمت فایل پشتیبانی نمی‌شود."); return; }
    setNotice("");
    setFile({ originalFile: selectedFile, name: selectedFile.name, size: (selectedFile.size / (1024 * 1024)).toFixed(2) + " MB" });
  };

  const handleProcessAudio = async () => {
    if (!file?.originalFile) { setNotice("لطفاً ابتدا یک فایل صوتی انتخاب کنید."); return; }
    if (!API_BASE_URL) {
      setNotice("آدرس API تنظیم نشده است. فایل نمونه نمایش داده می‌شود؛ برای پردازش واقعی VITE_API_URL را تنظیم کنید.");
      return;
    }
    setLoading(true); setNotice("");
    try {
      const form = new FormData();
      form.append("file", file.originalFile);
      form.append("language", language);
      const response = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/process`, { method: "POST", body: form });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const payload = await response.json();
      const normalized = {
        ...INITIAL_DATA, ...payload,
        transcript: payload.transcript ?? payload.text ?? INITIAL_DATA.transcript,
        summary: payload.summary ?? INITIAL_DATA.summary,
        tags: Array.isArray(payload.tags) ? payload.tags.map(t => typeof t === "string" ? { name: t, color: "tag-blue" } : t) : INITIAL_DATA.tags,
        questions: payload.questions ?? INITIAL_DATA.questions
      };
      setResultData(normalized); setFactCheck(""); setFactOpen(false);
      const record = { id: Date.now(), name: file.name, date: new Date().toLocaleString("fa-IR"), language, transcript: normalized.transcript, summary: normalized.summary };
      setHistory(prev => [record, ...prev].slice(0, 50));
      setNotice("پردازش با موفقیت انجام شد.");
    } catch (err) {
      console.error(err); setNotice("ارتباط با API ناموفق بود. آدرس سرویس و ساختار پاسخ را بررسی کنید.");
    } finally { setLoading(false); }
  };

  const handleFactCheck = async () => {
    setFactOpen(true);
    if (!API_BASE_URL) {
      setFactCheck("برای دریافت اصلاحیه علمی واقعی، API را تنظیم کنید. این بخش باید از سرویس fact-check پاسخ شامل موارد نیازمند اصلاح، توضیح علمی و منابع دریافت کند.");
      return;
    }
    setFactLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/fact-check`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: resultData.transcript, language })
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const payload = await response.json();
      setFactCheck(payload.corrections || payload.result || payload.analysis || payload.message || JSON.stringify(payload, null, 2));
    } catch (err) {
      console.error(err); setFactCheck("در دریافت نتیجه صحت‌سنجی خطایی رخ داد. اتصال و مسیر /fact-check را بررسی کنید.");
    } finally { setFactLoading(false); }
  };

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(resultData.transcript); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    catch { setNotice("امکان کپی متن وجود ندارد."); }
  };

  const logout = () => { localStorage.removeItem("peyNevisUser"); setUser(null); setPage("app"); };
  if (!user) return <AuthScreen onLogin={setUser}/>;

  if (page === "profile") return <div className="app-container" dir="rtl">
    <header className="main-header">
      <button className="brand brand-button" onClick={() => setPage("app")}><img src={logo} alt="logo" className="logo"/></button>
      <nav className="header-actions"><button onClick={() => setPage("app")}><FileAudio size={17}/> پردازش صوت</button><button onClick={logout}><LogOut size={17}/> خروج</button></nav>
    </header>
    <main className="profile-page">
      <section className="profile-welcome"><div className="avatar"><User size={30}/></div><div><h1>داشبورد کاربری</h1><p>{user.name} · {user.email}</p></div></section>
      <section className="content-card">
        <div className="section-heading"><History/><h2>تاریخچه فایل‌های پردازش‌شده</h2><span className="history-count">{history.length} فایل</span></div>
        {history.length === 0 ? <p className="empty-state">هنوز فایلی پردازش نکرده‌اید.</p> : <div className="history-list">
          {history.map(item => <article className="history-item" key={item.id}><div className="file-icon"><FileAudio/></div><div className="history-meta"><b dir="ltr">{item.name}</b><small>{item.date} · زبان: {item.language}</small><p>{item.summary}</p></div><button className="small-btn" onClick={() => { setResultData({ ...INITIAL_DATA, transcript: item.transcript, summary: item.summary }); setPage("app"); }}>مشاهده</button></article>)}
        </div>}
      </section>
    </main>
    <footer className="app-footer">© {new Date().getFullYear()} Peyv-Nevis</footer>
  </div>;

  return <div className="app-container" dir="rtl">
    <header className="main-header">
      <img src={logo} alt="logo" className="logo"/>
      <div className="header-actions"><span className="header-badge"><Sparkles size={15}/> یادگیری هوشمند، با هر صدا</span><button onClick={() => setPage("profile")}><User size={17}/> پروفایل</button><button onClick={logout}><LogOut size={17}/> خروج</button></div>
    </header>

    <main className="main-layout">
      <aside className="upload-panel">
        <h2><UploadCloud size={26}/> فایل صوتی خود را آپلود کنید</h2>
        <p className="upload-description">فایل‌های صوتی با فرمت‌های زیر پشتیبانی می‌شوند</p>
        <div className="format-list">{FORMATS.map(format => <span key={format}>{format}</span>)}</div>
        <div className={`upload-dropzone ${dragging ? "drag-active" : ""}`} onClick={() => fileInputRef.current?.click()} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); handleFileChange(e.dataTransfer.files?.[0]); }}>
          <UploadCloud size={38}/><p>برای انتخاب فایل کلیک کنید یا فایل را بکشید و رها کنید</p>
          <input ref={fileInputRef} type="file" accept=".mp3,.wav,.m4a,.mpeg,.mpga,.webm,audio/*" hidden onChange={e => handleFileChange(e.target.files?.[0])}/>
        </div>
        {file && <div className="selected-file"><div className="file-icon"><AudioWaveform size={24}/></div><div className="file-info"><strong dir="ltr">{file.name}</strong><span>{file.size}</span></div><button className="remove-file" onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} title="حذف فایل"><X size={17}/></button></div>}
        <label className="language-label"><span><Languages size={17}/> زبان فایل</span>
          <select value={language} onChange={e => setLanguage(e.target.value)}><option value="fa">فارسی</option><option value="en">انگلیسی</option><option value="ku">کردی</option></select>
        </label>
        <button className="process-button" onClick={handleProcessAudio} disabled={loading}>{loading ? <><LoaderCircle className="spin"/> در حال پردازش...</> : <>پردازش فایل <Play size={18}/></>}</button>
        {notice && <p className="notice" role="status">{notice}</p>}
        <p className="api-hint">زبان انتخاب‌شده همراه فایل با کلید <code>language</code> ارسال می‌شود.</p>
      </aside>

      <section className="results-panel">
        <div className="success-box"><div className="success-icon"><Check size={24}/></div><div><h3>نتایج تحلیل صوت</h3><p>متن پیاده‌سازی‌شده و تحلیل آموزشی فایل در این قسمت نمایش داده می‌شود.</p></div></div>
        <div className="statistics-grid">
          <div className="stat-card"><div className="stat-icon"><Clock/></div><div><span>زمان کل پردازش</span><strong>{resultData.totalTime}</strong></div></div>
          <div className="stat-card"><div className="stat-icon"><Cpu/></div><div><span>زمان تحلیل</span><strong>{resultData.analysisTime}</strong></div></div>
          <div className="stat-card"><div className="stat-icon"><AudioWaveform/></div><div><span>زمان تبدیل گفتار به متن</span><strong>{resultData.sttTime}</strong></div></div>
        </div>

        <div className="content-card transcript-card">
          <div className="section-heading"><FileText size={21}/><h3>متن پیاده‌سازی شده</h3><div className="heading-actions">
            <div className="dropdown-wrap"><button className="download-btn" onClick={() => setDownloadOpen(v => !v)}><Download size={17}/> دانلود خروجی <ChevronDown size={15}/></button>{downloadOpen && <div className="dropdown-menu"><button onClick={() => { exportDocument({ ...resultData, factCheck }, "pdf"); setDownloadOpen(false); }}>دانلود PDF</button><button onClick={() => { exportDocument({ ...resultData, factCheck }, "word"); setDownloadOpen(false); }}>دانلود Word</button></div>}</div>
            <button className="copy-button" onClick={handleCopy} title="کپی متن">{copied ? <Check size={18}/> : <Copy size={18}/>}</button>
          </div></div>
          <p className="transcript-text">{resultData.transcript}</p>
          <button className="fact-check-btn" onClick={handleFactCheck} disabled={factLoading}>{factLoading ? <LoaderCircle className="spin"/> : <ShieldCheck size={18}/>} بررسی و اصلاح علمی</button>
          {factOpen && <div className="fact-check-box"><div className="fact-title"><ShieldCheck size={20}/><b>نتیجه بررسی و اصلاح علمی</b><button onClick={() => setFactOpen(false)} aria-label="بستن"><X size={17}/></button></div>{factLoading ? <p>در حال بررسی محتوای علمی...</p> : <p className="fact-content">{factCheck}</p>}</div>}
        </div>

        <div className="result-section"><div className="section-heading"><FileText size={20}/><h3>خلاصه</h3></div><div className="summary-box">{resultData.summary}</div></div>
        <div className="result-section"><div className="section-heading"><Tags size={20}/><h3>تگ‌ها</h3></div><div className="tags-list">{resultData.tags.map((tag, i) => <span key={`${tag.name}-${i}`} className={`result-tag ${tag.color || "tag-blue"}`}>{tag.name}</span>)}</div></div>
        <div className="result-section"><div className="section-heading"><CircleHelp size={20}/><h3>سؤالات</h3></div><div className="questions-list">{resultData.questions.map((q, i) => <div className="question-item" key={i}><span className="question-number">{i + 1}</span><p>{q}</p></div>)}</div></div>
      </section>
    </main>
    <footer className="app-footer">© {new Date().getFullYear()} Peyv-Nevis — سامانه هوشمند تبدیل و تحلیل صوت</footer>
  </div>;
}
