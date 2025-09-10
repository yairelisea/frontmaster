import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// ¡OJO con la ruta! desde src/admin -> ../api
import { fetchCampaigns } from "../api/client.js";

export default function AdminCampaignsPage() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const data = await fetchCampaigns();
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("fetchCampaigns error:", e);
      setErr(e?.message || "Error cargando campañas");
      setList([]); // evita crashear el render
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = !q
    ? list
    : list.filter((c) => (`${c.name} ${c.query}`).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Mis campañas</h1>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar…"
          className="border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {err && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {err} — revisa VITE_API_URL, token y CORS en el backend.
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="text-left py-2 px-3 font-medium">Nombre</th>
              <th className="text-left py-2 px-3 font-medium">Consulta</th>
              <th className="text-left py-2 px-3 font-medium">Size</th>
              <th className="text-left py-2 px-3 font-medium">Días</th>
              <th className="text-left py-2 px-3 font-medium">País</th>
              <th className="text-left py-2 px-3 font-medium">Acciones</th>
              <th className="text-left py-2 px-3 font-medium">Creada</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="py-6 text-center" colSpan={6}>Cargando…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td className="py-6 text-center" colSpan={6}>Sin campañas</td></tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="py-2 px-3">
                    <Link className="underline" to={`/admin/campaigns/${c.id}`}>{c.name}</Link>
                  </td>
                  <td className="py-2 px-3 text-gray-600">{c.query}</td>
                  <td className="py-2 px-3">{c.size}</td>
                  <td className="py-2 px-3">{c.days_back}</td>
                  <td className="py-2 px-3">{c.country}</td>
                  <td className="py-2 px-3">
                    {c.createdAt ? new Date(c.createdAt).toLocaleString() : "—"}
                  </td>
                  <td className="py-2 px-3">
+       <Actions c={c} onDone={load} />
+     </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function Actions({ c, onDone }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const doRecover = async () => {
    setBusy(true); setMsg("");
    try {
      await adminRecover(c.id);
      setMsg("Recuperada");
      onDone && onDone(); // recarga lista
    } catch (e) {
      setMsg("Error recover");
    } finally {
      setBusy(false);
    }
  };

  const doPDF = async () => {
    setBusy(true); setMsg("");
    try {
      const r = await adminBuildReport(c.id);
      if (r?.url) window.open(r.url, "_blank");
      else setMsg("PDF generado");
    } catch (e) {
      setMsg("Error PDF");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <button
        onClick={doRecover}
        disabled={busy}
        className="px-3 py-1.5 rounded bg-black text-white text-xs"
      >
        {busy ? "…" : "Recuperar"}
      </button>
      <button
        onClick={doPDF}
        disabled={busy}
        className="px-3 py-1.5 rounded bg-gray-800 text-white text-xs"
      >
        PDF
      </button>
      {msg && <span className="text-xs text-gray-600">{msg}</span>}
    </div>
  );
}