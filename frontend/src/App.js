import { useState, useEffect } from "react";

const API = "http://47.131.162.162:4001";
//const API = "https://api.pamancloud.site/api";
const API_AI = "https://api.anthropic.com/v1/messages";


// ==================== COMPONENTS ====================

const NIKInput = ({ value, onChange, placeholder }) => {
  const formatted = value.replace(/\D/g, "").slice(0, 16);
  return (
    <input
      type="text"
      value={formatted}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 16))}
      placeholder={placeholder || "XXXXXXXXXXXXXXXX (16 digit)"}
      style={{
        width: "100%",
        padding: "12px 16px",
        border: "2px solid #CBD5E1",
        borderRadius: "10px",
        fontSize: "15px",
        outline: "none",
        transition: "border-color 0.2s",
        background: "#F8FAFF",
        color: "#1E3A5F",
        letterSpacing: "2px",
        fontFamily: "'Courier New', monospace",
        boxSizing: "border-box",
      }}
      onFocus={(e) => (e.target.style.borderColor = "#16a34a")}
      onBlur={(e) => (e.target.style.borderColor = "#CBD5E1")}
    />
  );
};

const LoginPage = ({ onLogin, onSwitch }) => {
  const [nik, setNik] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
  if (nik.length !== 16) {
    setError("NIK harus 16 digit");
    return;
  }
  if (!password) {
    setError("Password wajib diisi");
    return;
  }

  setLoading(true);
  setError("");

  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nik, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Login gagal");
      return;
    }

    localStorage.setItem("token", data.token);

    // 🔥 AMBIL DATA LENGKAP
   const profileRes = await fetch(`${API}/profile`, {
  headers: {
    Authorization: `Bearer ${data.token}`,
  },
});

if (!profileRes.ok) {
  console.log("PROFILE ERROR STATUS:", profileRes.status);
  
  // fallback → tetap login pakai data login
  onLogin(data.user);
  return;
}

const profile = await profileRes.json();

console.log("PROFILE:", profile); // 🔥 debug

onLogin(profile); 

  } catch {
    setError("Server tidak bisa diakses");
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={{ animation: "fadeSlide 0.4s ease" }}>
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>NIK (Nomor Induk Kependudukan) *</label>
        <NIKInput value={nik} onChange={setNik} />
        <p style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>
          Format: 16 digit sesuai KTP
        </p>
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>PASSWORD *</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          placeholder="Masukkan password"
          style={{ ...inputStyle }}
          onFocus={(e) => (e.target.style.borderColor = "#16a34a")}
          onBlur={(e) => (e.target.style.borderColor = "#CBD5E1")}
        />
        <div style={{ textAlign: "right", marginTop: 6 }}>
          <span style={{ fontSize: 13, color: "#D97706", cursor: "pointer", fontWeight: 700 }}>
            Lupa password?
          </span>
        </div>
      </div>
      {error && (
        <div style={{ background: "#FEE2E2", border: "1px solid #FCA5A5", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#DC2626", fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}
      <button
        onClick={handleLogin}
        disabled={loading}
        style={{ ...btnPrimary, opacity: loading ? 0.7 : 1, cursor: loading ? "wait" : "pointer" }}
      >
        {loading ? "🔄 Memverifikasi..." : "🔐 Masuk ke Portal"}
      </button>
      <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#64748B" }}>
        This is a secure government portal. Never share your credentials.
      </p>
    </div>
  );
};

const RegisterPage = ({ onRegister, onSwitch }) => {
  const [form, setForm] = useState({
    first_name: "", last_name: "", nik: "", phone: "",
    email: "", kecamatan: "", kelurahan: "", password: "", confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const kecamatans = ["Gili Buaya", "Laut Dalam", "Batu Karang", "Padang Pasir", "Terumbu Karang", "Pantai Barat", "Pantai Timur", "Laguna Biru", "Selat Sempit", "Taman Ubur-Ubur", "Muara Jangkar", "Pulau Nanas"];

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleRegister = async () => {
  if (!form.first_name || !form.last_name) return setError("Nama lengkap wajib diisi");
  if (form.nik.length !== 16) return setError("NIK harus 16 digit");

  setLoading(true);
  setError("");

  try {
    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
     body: JSON.stringify({
      nik: form.nik,
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      kecamatan: form.kecamatan,
      kelurahan: form.kelurahan
})
    }); 

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Register gagal");
      return;
    }
    alert("Pendaftaran berhasil! Silakan login dengan NIK dan password yang sudah dibuat.");

    onSwitch("login");

    //localStorage.setItem("token", data.token);
    //onRegister(data.user);

  } catch {
    setError("Server error");
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={{ animation: "fadeSlide 0.4s ease" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        {[["first_name", "NAMA DEPAN"], ["last_name", "NAMA BELAKANG"]].map(([k, l]) => (
          <div key={k}>
            <label style={labelStyle}>{l} *</label>
            <input value={form[k]} onChange={set(k)} placeholder={l === "NAMA DEPAN" ? "Budi" : "Santoso"} style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
              onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
              onBlur={(e) => (e.target.style.borderColor = "#CBD5E1")} />
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>NIK *</label>
        <NIKInput value={form.nik} onChange={(v) => setForm({ ...form, nik: v })} />
        <p style={{ fontSize: 11, color: "#64748B", marginTop: 3 }}>Sesuai yang tercetak di KTP</p>
      </div>
      {[["phone", "NOMOR HP", "0812-3456-7890", "tel"], ["email", "EMAIL", "nama@email.com", "email"]].map(([k, l, ph, t]) => (
        <div key={k} style={{ marginBottom: 14 }}>
          <label style={labelStyle}>{l} *</label>
          <input type={t} value={form[k]} onChange={set(k)} placeholder={ph} style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
            onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
            onBlur={(e) => (e.target.style.borderColor = "#CBD5E1")} />
        </div>
      ))}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div>
          <label style={labelStyle}>KECAMATAN *</label>
          <select value={form.kecamatan} onChange={(e) => setForm({ ...form, kecamatan: e.target.value })}
        style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}>
    <option value="">-- Pilih Kecamatan --</option>
    {kecamatans.map((k) => (
    <option key={k} value={k}>{k}</option>
  ))}
</select>
        </div>
        <div>
          <label style={labelStyle}>KELURAHAN</label>
          <input value={form.kelurahan} onChange={set("kelurahan")} placeholder="Nama Kelurahan" style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
            onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
            onBlur={(e) => (e.target.style.borderColor = "#CBD5E1")} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        {[["password", "PASSWORD"], ["confirm", "KONFIRMASI PASSWORD"]].map(([k, l]) => (
          <div key={k}>
            <label style={labelStyle}>{l} *</label>
            <input type="password" value={form[k]} onChange={set(k)} placeholder="••••••••" style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
              onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
              onBlur={(e) => (e.target.style.borderColor = "#CBD5E1")} />
          </div>
        ))}
      </div>
      {error && (
        <div style={{ background: "#FEE2E2", border: "1px solid #FCA5A5", borderRadius: 8, padding: "10px 14px", marginBottom: 14, color: "#DC2626", fontSize: 13 }}>⚠️ {error}</div>
      )}
      <button onClick={handleRegister} disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.7 : 1 }}>
        {loading ? "⏳ Mendaftarkan..." : "📝 Daftar Sekarang"}
      </button>
    </div>
  );
};

const Dashboard = ({ user, onLogout }) => {
  const [applications, setApplications] = useState([]);
  const [tab, setTab] = useState("profile");
  const [newAppType, setNewAppType] = useState("");
  const [submitMsg, setSubmitMsg] = useState("");
  const [aiChat, setAiChat] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

useEffect(() => {
  const fetchApps = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/app/applications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setApplications(data);

    } catch (err) {
      console.error(err);
    }
  };

  fetchApps();
}, [user.id]);

  const approved = applications.filter((a) => a.status === "approved").length;
  const pending = applications.filter((a) => a.status === "pending").length;

const handleSubmitApp = async () => {
  if (!newAppType) return;

  try {
    const token = localStorage.getItem("token");

    console.log("TOKEN:", token);

    if (!token) {
      setSubmitMsg("❌ Belum login");
      return;
    }

    const res = await fetch(`${API}/app/applications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ type: newAppType }),
    });

    const result = await res.json(); // 🔥 ambil response

    console.log("RESPONSE:", result); // 🔥 DEBUG

    if (!res.ok) {
      setSubmitMsg(`❌ ${result.error || "Gagal kirim"}`);
      return;
    }

    const updated = await fetch(`${API}/app/applications`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await updated.json();
    setApplications(data);

    setSubmitMsg("✅ Pengajuan berhasil!");
    setNewAppType("");

  } catch (err) {
    console.error(err);
    setSubmitMsg("❌ Gagal kirim (network)");
  }
};

  const handleAiAssist = async () => {
    if (!aiChat.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch(API_AI, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Kamu adalah asisten layanan warga Pemerintah Bikini Bottom (dari SpongeBob SquarePants). Bantu warga dengan pertanyaan tentang layanan pemerintahan dengan gaya lucu dan ramah ala Bikini Bottom. Jawab dalam Bahasa Indonesia.\n\nPertanyaan warga: ${aiChat}`
          }]
        })
      });
      const data = await res.json();
      setAiResponse(data.content?.[0]?.text || "Maaf, tidak dapat menjawab saat ini.");
    } catch {
      setAiResponse("Maaf, layanan AI sedang tidak tersedia.");
    }
    setAiLoading(false);
  };

  const serviceTypes = ["KTP Baru", "KTP Hilang/Rusak", "Kartu Keluarga", "Akta Kelahiran", "Akta Kematian", "Surat Pindah", "Surat Domisili", "BPJS Kesehatan", "Izin Usaha (SIUP)", "IMB", "Surat Keterangan Tidak Mampu"];

  return (
    <div style={{ animation: "fadeSlide 0.3s ease" }}>
      {/* Welcome Banner */}
      <div style={{
        background: "linear-gradient(135deg, #16a34a 0%, #16a34a 50%, #16a34a 100%)",
        borderRadius: 14, padding: "20px 24px", marginBottom: 20,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        boxShadow: "0 4px 20px rgba(245,158,11,0.4)"
      }}>
        <div>
          <p style={{ color: "#FEF3C7", fontSize: 13, margin: 0 }}>👋 Selamat datang,</p>
          <h2 style={{ color: "white", margin: "4px 0 2px", fontSize: 20, fontWeight: 900 }}>
            {user.first_name} {user.last_name}
          </h2>
          <p style={{ color: "#FDE68A", fontSize: 12, margin: 0 }}>NIK: {user.nik}</p>
        </div>
        <button onClick={onLogout} style={{
          background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
          borderRadius: 8, padding: "8px 14px", color: "white", cursor: "pointer", fontSize: 13,
          backdropFilter: "blur(4px)", transition: "background 0.2s"
        }} onMouseOver={(e) => e.target.style.background = "rgba(255,255,255,0.25)"}
          onMouseOut={(e) => e.target.style.background = "rgba(255,255,255,0.15)"}>
          🚪 Keluar
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Pengajuan", value: applications.length, icon: "📋", color: "#EFF6FF", border: "#BFDBFE" },
          { label: "Disetujui", value: approved, icon: "✅", color: "#F0FDF4", border: "#BBF7D0" },
          { label: "Proses", value: pending, icon: "⏳", color: "#FFFBEB", border: "#FDE68A" },
        ].map((s) => (
          <div key={s.label} style={{ background: s.color, border: `1px solid ${s.border}`, borderRadius: 12, padding: "14px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 22 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#1E3A8A" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#64748B" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 18, background: "#F1F5F9", padding: 4, borderRadius: 10 }}>
        {[["profile", "👤 Profil"], ["apps", "📋 Pengajuan"], ["ai", "🤖 Bantuan AI"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex: 1, padding: "9px 6px", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600,
            background: tab === id ? "white" : "transparent",
            color: tab === id ? "#D97706" : "#64748B",
            boxShadow: tab === id ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
            transition: "all 0.2s"
          }}>{label}</button>
        ))}
      </div>

      {/* Tab: Profile */}
      {tab === "profile" && (
        <div style={{ background: "white", borderRadius: 12, padding: 20, border: "1px solid #E2E8F0" }}>
          <h3 style={{ margin: "0 0 16px", color: "#1E3A8A", fontSize: 15, fontWeight: 700 }}>👤 Profil Warga</h3>
          {[
            ["Nama Lengkap", `${user.first_name} ${user.last_name}`],
            ["NIK", user.nik],
            ["Nomor HP", user.phone],
            ["Email", user.email],
            ["Kecamatan", user.kecamatan],
            ["Kelurahan", user.kelurahan || "-"],
            ["Status Akun", "✅ Aktif"],
            ["Terakhir Masuk", user.last_login],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F1F5F9", fontSize: 14 }}>
              <span style={{ color: "#64748B", fontWeight: 500 }}>{k}</span>
              <span style={{ color: "#1E3A8A", fontWeight: 600, textAlign: "right", maxWidth: "55%" }}>{v}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Applications */}
      {tab === "apps" && (
        <div>
          <div style={{ background: "white", borderRadius: 12, padding: 16, marginBottom: 16, border: "1px solid #E2E8F0" }}>
            <h3 style={{ margin: "0 0 14px", color: "#1E3A8A", fontSize: 15, fontWeight: 700 }}>➕ Ajukan Layanan Baru</h3>
            <select value={newAppType} onChange={(e) => setNewAppType(e.target.value)} style={{ ...inputStyle, width: "100%", marginBottom: 10, boxSizing: "border-box" }}>
              <option value="">-- Pilih Jenis Layanan --</option>
              {serviceTypes.map((s) => <option key={s}>{s}</option>)}
            </select>
            {submitMsg && <div style={{ color: "#16A34A", fontSize: 13, marginBottom: 8 }}>{submitMsg}</div>}
            <button onClick={handleSubmitApp} style={{ ...btnPrimary, padding: "10px 20px", width: "auto" }}>
              📤 Kirim Pengajuan
            </button>
          </div>

          <div style={{ background: "white", borderRadius: 12, padding: 16, border: "1px solid #E2E8F0" }}>
            <h3 style={{ margin: "0 0 14px", color: "#1E3A8A", fontSize: 15, fontWeight: 700 }}>📋 Riwayat Pengajuan</h3>
            {applications.length === 0 ? (
              <p style={{ color: "#94A3B8", textAlign: "center", padding: 20 }}>Belum ada pengajuan</p>
            ) : applications.map((app) => (
              <div key={app.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #F1F5F9" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#1E3A8A" }}>{app.type}</p>
                  <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94A3B8" }}>{app.date}</p>
                </div>
                <span style={{
                  padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                  background: app.status === "approved" ? "#DCFCE7" : "#FFFBEB",
                  color: app.status === "approved" ? "#16A34A" : "#D97706"
                }}>
                  {app.status === "approved" ? "✅ Disetujui" : "⏳ Proses"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: AI Assistant */}
      {tab === "ai" && (
        <div style={{ background: "white", borderRadius: 12, padding: 18, border: "1px solid #E2E8F0" }}>
          <h3 style={{ margin: "0 0 6px", color: "#1E3A8A", fontSize: 15, fontWeight: 700 }}>🤖 Asisten Layanan Bikini Bottom</h3>
          <p style={{ color: "#64748B", fontSize: 13, marginBottom: 16 }}>Tanya apa saja tentang layanan pemerintahan Kuyukiland</p>

          {aiResponse && (
            <div style={{ background: "#FEFCE8", border: "1px solid #FDE68A", borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 14, color: "#1E3A8A", lineHeight: 1.6 }}>
              🤖 <strong>Asisten:</strong><br />{aiResponse}
            </div>
          )}

          <textarea
            value={aiChat}
            onChange={(e) => setAiChat(e.target.value)}
            placeholder="Contoh: Apa saja syarat membuat KTP baru di Bikini Bottom?"
            rows={3}
            style={{ ...inputStyle, width: "100%", boxSizing: "border-box", resize: "none", fontFamily: "inherit", lineHeight: 1.5 }}
          />
          <button onClick={handleAiAssist} disabled={aiLoading} style={{ ...btnPrimary, marginTop: 10, opacity: aiLoading ? 0.7 : 1 }}>
            {aiLoading ? "🔄 Memproses..." : "💬 Tanya Asisten"}
          </button>

          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 12, color: "#94A3B8", marginBottom: 8 }}>Pertanyaan umum:</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["Syarat KTP baru", "Cara urus KK", "Jam pelayanan", "Lokasi Krabby Patty"].map((q) => (
                <button key={q} onClick={() => setAiChat(q)} style={{
                  background: "#FEFCE8", border: "1px solid #FDE68A", borderRadius: 20,
                  padding: "5px 12px", fontSize: 12, color: "#92400E", cursor: "pointer"
                }}>{q}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== STYLES ====================
const labelStyle = {
  display: "block", fontSize: 11, fontWeight: 700,
  color: "#374151", marginBottom: 6, letterSpacing: "0.5px"
};
const inputStyle = {
  width: "100%", padding: "11px 14px", border: "2px solid #CBD5E1",
  borderRadius: 10, fontSize: 14, outline: "none", background: "#F8FAFF",
  color: "#1E3A8A", transition: "border-color 0.2s", fontFamily: "inherit"
};
const btnPrimary = {
  width: "100%",
  padding: "13px",
  background: "linear-gradient(135deg, #16a34a, #15803d)",
  border: "none",
  borderRadius: 10,
  color: "white",
  fontSize: 15,
  fontWeight: 800,
  cursor: "pointer",
  transition: "all 0.2s",
  boxShadow: "0 4px 12px rgba(22,163,74,0.3)",
  fontFamily: "inherit"
};

// ==================== MAIN APP ====================
export default function App() {
  const [mode, setMode] = useState("login"); // login | register
  const [user, setUser] = useState(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleLogout = () => { setUser(null); setMode("login"); };

  const formatTime = (d) =>
    d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " WIB";

  const formatDate = (d) =>
    d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
    * { box-sizing: border-box; }

    body { 
      margin: 0; 
      font-family: 'Nunito', sans-serif; 
      background: #f0fdf4;
    }

    :root {
      --green-primary: #16a34a;
      --green-dark: #15803d;
      --green-light: #dcfce7;
    }

      @keyframes fadeSlide {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: #ecfdf5; }
      ::-webkit-scrollbar-thumb { background: #16a34a; border-radius: 3px; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #ecfdf5 0%, #d1fae5 100%)", padding: "0 0 40px", position: "relative", overflow: "hidden" }}>

        {/* Decorative bubbles */}
        {[
          { w:60, h:60, top:"8%", left:"5%", delay:"0s" },
          { w:40, h:40, top:"15%", right:"8%", delay:"1s" },
          { w:80, h:80, top:"35%", left:"2%", delay:"2s" },
          { w:30, h:30, top:"55%", right:"5%", delay:"0.5s" },
          { w:50, h:50, top:"75%", left:"8%", delay:"1.5s" },
        ].map((b, i) => (
          <div key={i} style={{
            position: "absolute", width: b.w, height: b.h, borderRadius: "50%",
            background: "#16a34a", border: "2px solid #16a34a",
            top: b.top, left: b.left, right: b.right,
            animation: `bubble 3s ease-in-out infinite`, animationDelay: b.delay,
            pointerEvents: "none"
          }} />
        ))}

        {/* Top Navigation */}
        <div style={{ background: "#16a34a", padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", backdropFilter: "blur(4px)" }}>
          <span style={{ color: "#070300", fontSize: 12, fontWeight: 700 }}>🏛 Official Portal — Government of kuyukiland</span>
          <div style={{ display: "flex", gap: 16 }}>
            {["Bahasa", "Bantuan", "Kontak"].map((m) => (
              <span key={m} style={{ color: "#060200", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>{m}</span>
            ))}
          </div>
        </div>

        {/* Header */}
        <div style={{ background: "rgba(255,255,255,0.85)", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", marginBottom: 8, backdropFilter: "blur(8px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "linear-gradient(var(--green-dark), #087e2f)", color: "white",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)"
            }}>🗿</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#0a0400", lineHeight: 1.2 }}>
                Pemerintah Kuyukiland
              </h1>
              <h1>Kuyukiland</h1>
            <p>Citizen Services Portal — E-Government Directorate</p>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#000000", fontFamily: "monospace" }}>{formatTime(time)}</p>
            <p style={{ margin: 0, fontSize: 11, color: "#000000", fontWeight: 600 }}>{formatDate(time)}</p>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ maxWidth: 550, margin: "0 auto", padding: "0 16px" }}>
          {user ? (
            <Dashboard user={user} onLogout={handleLogout} />
          ) : (
            <div style={{ background: "rgba(255,255,255,0.9)", borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,0.12)", border: "2px solid rgba(255,255,255,0.8)", backdropFilter: "blur(10px)" }}>
              {/* Portal Header */}
              <div style={{ background: "linear-gradient(135deg, #16a34a, #15803d)", padding: "24px 24px 20px", textAlign: "center" }}>
                <h2 style={{ color: "white", margin: "0 0 4px", fontSize: 20, fontWeight: 900 }}>
                  Citizen Login Portal
                </h2>
                <p style={{ color: "#FEF3C7", margin: 0, fontSize: 13, fontWeight: 600 }}>Pemerintah Kuyukiland — Layanan Warga</p>
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", background: "#f0fdf4", borderBottom: "2px solid #bbf7d0" }}>
                {[["login", "🔑 Masuk"], ["register", "📝 Daftar"]].map(([id, label]) => (
                  <button key={id} onClick={() => setMode(id)} style={{
                    flex: 1, padding: "14px", border: "none", background: "transparent", cursor: "pointer",
                    fontSize: 14, fontWeight: 800, transition: "all 0.2s",
                    color: mode === id ? "#16a34a" : "#94A3B8",
                    borderBottom: mode === id ? "3px solid #16a34a" : "3px solid transparent",
                    fontFamily: "inherit"
                  }}>{label}</button>
                ))}
              </div>

              <div style={{ padding: "24px 20px" }}>
                {mode === "login" ? (
                  <LoginPage onLogin={setUser} onSwitch={() => setMode("register")} />
                ) : (
                  <RegisterPage onRegister={(u) => { setUser(u); }} onSwitch={() => setMode("login")} />
                )}
              </div>
            </div>
          )}

          {/* DB Info Badge */}
          <div style={{ marginTop: 16, background: "rgba(255,255,255,0.6)", borderRadius: 10, padding: "10px 14px", border: "1px solid rgba(255,255,255,0.8)", backdropFilter: "blur(4px)" }}>
            <p style={{ margin: 0, fontSize: 11, color: "#92400E", textAlign: "center", fontWeight: 600 }}>
              🗄️ <strong>Microservice Architecture</strong> — Auth Service · Application Service · AI Service<br/>
              🐘 <strong>PostgreSQL</strong> Database Ready · NIK-based Authentication
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
