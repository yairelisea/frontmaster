// src/pages/auth/LoginPage.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { apiLogin } from "@/lib/api";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState("admin@blackboxmonitor.com");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const { token, user } = await apiLogin({ email, password: password || undefined });
      await login({ token, user }); // usa tu AuthContext
      nav(loc.state?.from || "/admin/campaigns", { replace: true });
    } catch (ex) {
      setErr(ex?.message || "Error de login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {err && <div className="text-sm text-red-600">{err}</div>}
      <input className="w-full border rounded px-3 py-2" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="w-full border rounded px-3 py-2" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="(opcional)" />
      <button className="w-full bg-black text-white rounded px-3 py-2" disabled={loading}>
        {loading ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}