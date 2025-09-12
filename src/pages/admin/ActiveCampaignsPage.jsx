// src/admin/AdminCampaignsPage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  adminListCampaigns,
  adminRecover,
  adminProcessAnalyses,
  adminBuildReport,
  adminDeleteCampaign,
  adminRunAll,
  analyzeNewsForCampaign,
} from "@/lib/api";

export default function AdminCampaignsPage() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const data = await adminListCampaigns();
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("fetchCampaigns error:", e);
      setErr(e?.message || "Error cargando campañas");
      setList([]);
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
              <th className="text-left py-2 px-3 font-medium">Creada</th>
              <th className="text-left py-2 px-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="py-6 text-center" colSpan={7}>Cargando…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td className="py-6 text-center" colSpan={7}>Sin campañas</td></tr>
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
                    <Actions c={c} onDone={load} />
                  </td>
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
      await adminRecover(c.id);               // re-búsqueda local + persistir
      await adminProcessAnalyses(c.id);       // procesa análisis pendientes
      setMsg("OK");
      onDone && onDone();
    } catch (e) {
      console.error(e);
      // Fallback rápido: análisis IA de lectura para no dejar al usuario sin feedback
      try {
        await analyzeNewsForCampaign(c, { overall: true });
        setMsg("Análisis IA listo (lectura)");
        onDone && onDone();
      } catch {
        setMsg("Error");
      }
    } finally {
      setBusy(false);
    }
  };

  const doPDF = async () => {
    setBusy(true); setMsg("");
    try {
      const r = await adminBuildReport(c);
      if (r?.url) window.open(r.url, "_blank");
      else setMsg("PDF generado");
    } catch (e) {
      console.error(e);
      setMsg("Error PDF");
    } finally {
      setBusy(false);
    }
  };

  const doQuickAnalyze = async () => {
    setBusy(true); setMsg("");
    try {
      await analyzeNewsForCampaign(c, { overall: true });
      setMsg("IA lista (lectura)");
      onDone && onDone();
    } catch (e) {
      console.error(e);
      setMsg("IA falló");
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async () => {
    const check = window.prompt('¿Eliminar la campaña "' + (c.name || '') + '"? Escribe ELIMINAR para confirmar.');
    if (check !== 'ELIMINAR') return;
    setBusy(true); setMsg('');
    try {
      await adminDeleteCampaign(c.id);
      setMsg('Eliminada');
      onDone && onDone();
    } catch (e) {
      console.error(e);
      setMsg('Error al eliminar');
    } finally {
      setBusy(false);
    }
  };

  const doRunAll = async () => {
    setBusy(true); setMsg('');
    try {
      await adminRunAll(c.id);
      setMsg('Run All enviado');
    } catch (e) {
      console.error(e);
      setMsg('Error run-all');
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
        {busy ? "…" : "Actualizar"}
      </button>
      <button
        onClick={doQuickAnalyze}
        disabled={busy}
        className="px-3 py-1.5 rounded bg-gray-900 text-white text-xs"
      >
        IA (rápido)
      </button>
      <button
        onClick={doPDF}
        disabled={busy}
        className="px-3 py-1.5 rounded bg-gray-800 text-white text-xs"
      >
        PDF
      </button>
      <button
        onClick={doRunAll}
        disabled={busy}
        className="px-3 py-1.5 rounded bg-gray-700 text-white text-xs"
      >
        Run All
      </button>
      <button
        onClick={doDelete}
        disabled={busy}
        className="px-3 py-1.5 rounded bg-red-600 text-white text-xs"
      >
        Eliminar
      </button>
      {msg && <span className="text-xs text-gray-600">{msg}</span>}
    </div>
  );
}
