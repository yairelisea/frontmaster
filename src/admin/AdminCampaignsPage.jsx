// src/pages/admin/ActiveCampaignsPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchCampaignById,
  adminRecover,
  adminProcessAnalyses,
  adminBuildReport,
} from "../../api/client.js";

export default function ActiveCampaignsPage() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true); setErr(""); setMsg("");
      try {
        const c = await fetchCampaignById(id);
        setCampaign(c || null);
      } catch (e) {
        setErr(e?.message || "Error cargando campaña");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const doUpdate = async () => {
    if (!campaign) return;
    setBusy(true); setMsg(""); setErr("");
    try {
      await adminRecover(campaign.id);           // búsqueda local + persistir
      await adminProcessAnalyses(campaign.id);   // procesar análisis pendientes
      setMsg("Actualizada (buscar + analizar) OK");
    } catch (e) {
      setErr("Error al actualizar");
    } finally {
      setBusy(false);
    }
  };

  const doPDF = async () => {
    if (!campaign) return;
    setBusy(true); setMsg(""); setErr("");
    try {
      const r = await adminBuildReport(campaign); // /reports/pdf con payload mínimo
      if (r?.url) window.open(r.url, "_blank");
      else setMsg("PDF generado");
    } catch (e) {
      setErr("Error al generar PDF");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="p-4">Cargando…</div>;
  if (!campaign) return <div className="p-4">No se encontró la campaña.</div>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-xl font-semibold">{campaign.name}</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={doUpdate}
            disabled={busy}
            className="px-3 py-1.5 rounded bg-black text-white text-sm"
          >
            {busy ? "…" : "Actualizar (buscar + analizar)"}
          </button>
          <button
            onClick={doPDF}
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
      {msg && (
        <div className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded p-2">
          {msg}
        </div>
      )}

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

      <div className="text-xs text-gray-500">
        * Esta vista no lista Items/Analyses porque tu API actual no expone endpoints de lectura por campaña.
      </div>
    </div>
  );
}