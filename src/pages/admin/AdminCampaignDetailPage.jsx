// src/pages/admin/AdminCampaignDetailPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchCampaignItems, fetchCampaignAnalyses } from "../../api/client.js";

export default function AdminCampaignDetailPage() {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [i, a] = await Promise.all([
          fetchCampaignItems(id),
          fetchCampaignAnalyses(id),
        ]);
        setItems(Array.isArray(i) ? i : []);
        setAnalyses(Array.isArray(a) ? a : []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Detalle campaña</h1>
      {loading ? (
        <div>Cargando…</div>
      ) : (
        <>
          <section>
            <h2 className="font-medium">Items</h2>
            <ul className="list-disc pl-5">
              {items.map((it) => (
                <li key={it.id}>
                  <a href={it.url} target="_blank" rel="noreferrer">
                    {it.title}
                  </a>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="font-medium">Analyses</h2>
            <ul className="list-disc pl-5">
              {analyses.map((a) => (
                <li key={a.id}>
                  <strong>{a.tone || "—"}</strong> {a.summary}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}