// src/pages/admin/AdminCampaignDetailPage.jsx
import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  fetchCampaignById,
  adminRecover,
  adminProcessAnalyses,
  adminBuildReport,
} from "./apiClientBridge.js";

export default function AdminCampaignDetailPage() {
  const { id } = useParams();

  const [campaign, setCampaign] = useState(null);
  const [items, setItems] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const c = await fetchCampaignById(id);
      setCampaign(c || null);
      setItems([]);
      setAnalyses([]);
    } catch (e) {
      setErr(e?.message || "Error cargando datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const totals = useMemo(
    () => ({
      items: items.length,
      analyses: analyses.length,
      avgSentiment: analyses.length
        ? (
            analyses
              .map((a) => (typeof a.sentiment === "number" ? a.sentiment : 0))
              .reduce((s, v) => s + v, 0) / analyses.length
          ).toFixed(2)
        : "—",
    }),
    [items, analyses]
  );

  const onRecover = async () => {
    setBusy(true); setActionMsg("");
    try {
      await adminRecover(id);
      await adminProcessAnalyses(id);
      setActionMsg("Actualizada (buscar + analizar) OK");
      await load();
    } catch {
      setActionMsg("Error al actualizar");
    } finally {
      setBusy(false);
    }
  };

  const onPDF = async () => {
    setBusy(true); setActionMsg("");
    try {
      const r = await adminBuildReport(campaign || { name: "", query: "" });
      if (r?.url) window.open(r.url, "_blank");
      else setActionMsg("PDF generado");
    } catch {
      setActionMsg("Error al generar PDF");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="p-4">Cargando…</div>;
  if (!campaign) return <div className="p-4">No se encontró la campaña.</div>;

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-xl font-semibold">{campaign.name}</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading || busy}
            className="px-3 py-1.5 rounded bg-gray-200 text-gray-900 text-sm"
            title="Refrescar"
          >
            {loading ? "Cargando…" : "Refrescar"}
          </button>
          <button
            onClick={onRecover}
            disabled={busy}
            className="px-3 py-1.5 rounded bg-black text-white text-sm"
          >
            {busy ? "…" : "Actualizar (buscar + analizar)"}
          </button>
          <button
            onClick={onPDF}
            disabled={busy}
            className="px-3 py-1.5 rounded bg-gray-800 text-white text-sm"
          >
            PDF
          </button>
        </div>
      </div>

      {err && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{err}</div>}
      {actionMsg && <div className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded p-2">{actionMsg}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Stat label="Items" value={totals.items} />
        <Stat label="Analyses" value={totals.analyses} />
        <Stat label="Avg Sentiment" value={totals.avgSentiment} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500">Query</div>
          <div className="text-lg font-semibold">{campaign.query}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500">Config</div>
          <div className="text-sm text-gray-800">
            size: {campaign.size} · días: {campaign.days_back} · país: {campaign.country}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}