// src/pages/admin/AdminCampaignDetailPage.jsx
import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  fetchCampaignItems,
  fetchCampaignAnalyses,
  adminRecover,
  adminBuildReport,
} from "../api/client.js";

export default function AdminCampaignDetailPage() {
  const { id } = useParams();
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
      const [i, a] = await Promise.all([
        fetchCampaignItems(id),
        fetchCampaignAnalyses(id),
      ]);
      setItems(Array.isArray(i) ? i : []);
      setAnalyses(Array.isArray(a) ? a : []);
    } catch (e) {
      console.error("Detalle campaña error:", e);
      setErr(e?.message || "Error cargando datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  const totals = useMemo(() => ({
    items: items.length,
    analyses: analyses.length,
    avgSentiment:
      analyses.length
        ? (
            analyses
              .map((a) => (typeof a.sentiment === "number" ? a.sentiment : 0))
              .reduce((s, v) => s + v, 0) / analyses.length
          ).toFixed(2)
        : "—",
  }), [items, analyses]);

  const onRecover = async () => {
    setBusy(true); setActionMsg("");
    try {
      await adminRecover(id);
      setActionMsg("Recuperación lanzada");
      await load();
    } catch (e) {
      setActionMsg("Error al recuperar");
    } finally {
      setBusy(false);
    }
  };

  const onPDF = async () => {
    setBusy(true); setActionMsg("");
    try {
      const r = await adminBuildReport(id);
      if (r?.url) window.open(r.url, "_blank");
      else setActionMsg("PDF generado");
    } catch (e) {
      setActionMsg("Error al generar PDF");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-xl font-semibold">Detalle campaña</h1>
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
            {busy ? "…" : "Recuperar"}
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

      {err && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {err}
        </div>
      )}
      {actionMsg && (
        <div className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded p-2">
          {actionMsg}
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Stat label="Items" value={totals.items} />
          <Stat label="Analyses" value={totals.analyses} />
          <Stat label="Avg Sentiment" value={totals.avgSentiment} />
        </div>
      )}

      {loading ? (
        <div>Cargando…</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-white rounded-xl shadow-sm overflow-hidden">
            <header className="px-4 py-3 border-b font-medium">Items</header>
            <ul className="divide-y">
              {items.length === 0 && (
                <li className="p-4 text-sm text-gray-500">No hay items.</li>
              )}
              {items.map((it) => (
                <li key={it.id} className="p-4">
                  <a
                    href={it.url}
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-blue-600"
                  >
                    {it.title || it.url}
                  </a>
                  <div className="text-xs text-gray-500 mt-1">
                    {it.publishedAt ? new Date(it.publishedAt).toLocaleString() : ""}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white rounded-xl shadow-sm overflow-hidden">
            <header className="px-4 py-3 border-b font-medium">Analyses</header>
            <ul className="divide-y">
              {analyses.length === 0 && (
                <li className="p-4 text-sm text-gray-500">No hay análisis.</li>
              )}
              {analyses.map((a) => (
                <li key={a.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        <strong>{a.tone || "—"}</strong>
                        {typeof a.sentiment === "number" && (
                          <span className="ml-2 text-xs text-gray-600">sent: {a.sentiment}</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-700">{a.summary}</div>
                    </div>
                    {a.createdAt && (
                      <div className="text-xs text-gray-500 ml-4 whitespace-nowrap">
                        {new Date(a.createdAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                  {Array.isArray(a.topics) && a.topics.length > 0 && (
                    <div className="mt-2 text-xs text-gray-600">
                      <span className="font-medium mr-1">Topics:</span>
                      {a.topics.join(", ")}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
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