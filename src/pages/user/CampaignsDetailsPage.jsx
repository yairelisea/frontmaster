import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function SentimentPill({ value }) {
  if (value == null) return <Badge variant="secondary">N/A</Badge>;
  const v = Number(value);
  if (v > 0.15) return <Badge variant="success">Positivo ({v.toFixed(2)})</Badge>;
  if (v < -0.15) return <Badge variant="destructive">Negativo ({v.toFixed(2)})</Badge>;
  return <Badge variant="secondary">Neutral ({v.toFixed(2)})</Badge>;
}

export default function CampaignDetailsPage() {
  const { campaignId } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const nav = useNavigate();

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      // si tienes GET /campaigns/{id}, usa esa ruta directamente:
      // const { data: c } = await api.get(`campaigns/${campaignId}`);
      // setCampaign(c);

      // fallback: trae todas y filtra
      const { data: list } = await api.get("campaigns");
      setCampaign(Array.isArray(list) ? list.find(c => c.id === campaignId) : null);

      const { data: an } = await api.get("analyses", { params: { campaignId } });
      setAnalyses(Array.isArray(an) ? an : []);
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || "Error cargando");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [campaignId]);

  const { overall, items } = useMemo(() => {
    const ov = analyses.find(a => !a.itemId) || null;
    const it = analyses.filter(a => !!a.itemId);
    return { overall: ov, items: it };
  }, [analyses]);

  const runAnalysis = async () => {
    if (!campaign) return;
    setRunning(true);
    setError(null);
    try {
      await api.get("ai/analyze-news", {
        params: {
          q: campaign.query,
          size: campaign.size ?? 25,
          days_back: campaign.days_back ?? 14,
          overall: true,
          lang: campaign.lang || "es-419",
          country: campaign.country || "MX",
        },
      });
      await fetchAll();
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || "Error corriendo análisis");
    } finally {
      setRunning(false);
    }
  };

  if (loading) return <div className="p-4">Cargando…</div>;
  if (error) return <div className="p-4 text-red-600">Error: {String(error)}</div>;
  if (!campaign) {
    return (
      <div className="p-4">
        <p>No se encontró la campaña.</p>
        <Button variant="link" onClick={() => nav("/user/campaigns")}>Volver</Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{campaign.name}</h1>
          <p className="text-sm text-gray-600">
            Consulta: <span className="font-mono">{campaign.query}</span> • Resultados: {campaign.size} • Días: {campaign.days_back}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/user/campaigns"><Button variant="outline">Volver</Button></Link>
          <Button onClick={runAnalysis} disabled={running}>
            {running ? "Analizando…" : "Correr análisis IA"}
          </Button>
        </div>
      </div>

      <section className="p-4 border rounded-md">
        <h2 className="font-semibold mb-2">Resumen general</h2>
        {overall ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sentimiento:</span>
              <SentimentPill value={overall.sentiment} />
            </div>
            {overall.summary && (
              <div>
                <div className="text-sm text-gray-600 mb-1">Resumen IA:</div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{overall.summary}</p>
              </div>
            )}
            {overall.perception && (
              <div className="text-sm">
                <div className="text-gray-600 mb-1">Percepción (IA):</div>
                <pre className="bg-slate-50 p-2 rounded border overflow-auto text-xs">
                  {JSON.stringify(overall.perception, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-500">Aún no hay resumen. Usa “Correr análisis IA”.</div>
        )}
      </section>

      <section className="p-4 border rounded-md">
        <h2 className="font-semibold mb-3">Notas analizadas</h2>
        {items.length === 0 ? (
          <div className="text-sm text-gray-500">Todavía no hay notas analizadas.</div>
        ) : (
          <div className="space-y-3">
            {items.map((it) => (
              <div key={it.id} className="border rounded p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{it.title || "Nota"}</div>
                  <SentimentPill value={it.sentiment} />
                </div>
                {it.summary && <p className="text-sm text-gray-700 mt-1">{it.summary}</p>}
                <div className="flex flex-wrap gap-2 mt-2">
                  {(Array.isArray(it.topics) ? it.topics : []).map((t, idx) => (
                    <Badge key={idx} variant="outline">{t}</Badge>
                  ))}
                </div>
                {it.entities && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-gray-600">Entidades</summary>
                    <pre className="bg-slate-50 p-2 rounded border overflow-auto text-xs">
                      {JSON.stringify(it.entities, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}