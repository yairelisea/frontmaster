import { useEffect, useState } from "react";
import { getCampaign } from "@/services/campaigns";
import { analyzeNews } from "@/services/ai";

export default function CampaignDetail({ campaignId }) {
  const [c, setC] = useState(null);
  const [out, setOut] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setErr(null);
    const data = await getCampaign(campaignId);
    setC(data);
  };

  const run = async () => {
    if (!c) return;
    setLoading(true); setErr(null); setOut(null);
    try {
      const resp = await analyzeNews({
        q: c.query,
        size: c.size ?? 35,
        days_back: c.days_back ?? 14,
        overall: true,
        campaignId: c.id,
        lang: c.lang || "es-419",
        country: c.country || "MX",
        city_keywords: c.city_keywords || undefined,
      });
      setOut(resp);
    } catch (e) {
      setErr(e?.response?.data?.detail || e?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [campaignId]);

  return (
    <div className="space-y-3">
      {!c ? <div>Cargando campaña...</div> : (
        <>
          <div className="border rounded p-3">
            <div className="font-semibold text-lg">{c.name}</div>
            <div className="text-sm text-gray-600">
              {c.query} • resultados: {c.size ?? "—"} • días: {c.days_back ?? "—"}
              {c.city_keywords?.length ? <> • ciudades: {c.city_keywords.join(", ")}</> : null}
              {c.lang && <> • {c.lang}</>}
              {c.country && <> • {c.country}</>}
            </div>
            <div className="mt-2">
              <button onClick={run} disabled={loading} className="px-3 py-2 bg-black text-white rounded">
                {loading ? "Analizando..." : "Ejecutar análisis"}
              </button>
            </div>
          </div>

          {err && <div className="text-red-600">{err}</div>}

          {out?.aggregate && (
            <div className="border rounded p-3">
              <h3 className="font-semibold mb-1">Resumen global</h3>
              <p><b>Sentimiento:</b> {out.aggregate.overall_sentiment?.toFixed(2)}</p>
              <p><b>Posturas:</b> {Object.entries(out.aggregate.stance_distribution).map(([k,v]) => `${k}: ${v}`).join(", ")}</p>
              {out.aggregate.top_topics?.length ? <p><b>Temas:</b> {out.aggregate.top_topics.join(", ")}</p> : null}
              {out.aggregate.key_takeaways?.length ? (
                <ul className="list-disc pl-6">
                  {out.aggregate.key_takeaways.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              ) : null}
              <p className="italic">{out.aggregate.perception_overview}</p>
            </div>
          )}

          {out?.items?.length ? (
            <div className="grid gap-3">
              {out.items.map((it, i) => (
                <div key={i} className="border rounded p-3">
                  <a href={it.link} target="_blank" rel="noreferrer" className="font-semibold hover:underline">{it.title}</a>
                  <div className="text-sm text-gray-500">
                    {it.source} {it.published_at && `• ${new Date(it.published_at).toLocaleString()}`}
                  </div>
                  {it.llm && (
                    <>
                      <p className="mt-2">{it.llm.summary}</p>
                      <div className="text-sm mt-1">
                        <b>Sentimiento:</b> {it.llm.sentiment?.toFixed(2)} • <b>Tono:</b> {it.llm.tone} • <b>Postura:</b> {it.llm.stance}
                      </div>
                      {!!it.llm.topics?.length && <div className="text-sm"><b>Temas:</b> {it.llm.topics.join(", ")}</div>}
                      {it.llm.perception && (
                        <div className="mt-2">
                          <b>Percepción:</b> {it.llm.perception.view}
                          {!!it.llm.perception.evidence?.length && (
                            <ul className="list-disc pl-6 text-sm mt-1">
                              {it.llm.perception.evidence.map((evi, j) => <li key={j}>{evi}</li>)}
                            </ul>
                          )}
                          {typeof it.llm.perception.confidence === "number" && (
                            <div className="text-xs text-gray-500 mt-1">Confianza: {(it.llm.perception.confidence*100).toFixed(0)}%</div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}