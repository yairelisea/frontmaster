import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchCampaignItems, fetchCampaignAnalyses } from "../../api/client.js";

export default function AdminCampaignDetailPage() {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [tab, setTab] = useState("items");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [it, an] = await Promise.all([
        fetchCampaignItems(id),
        fetchCampaignAnalyses(id),
      ]);
      setItems(Array.isArray(it) ? it : []);
      setAnalyses(Array.isArray(an) ? an : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Campaña {id.slice(0,8)}…</h1>
        <Link to="/admin/campaigns" className="text-sm underline">← Volver</Link>
      </div>

      <div className="flex gap-2">
        <button className={`px-3 py-1.5 rounded ${tab==="items"?"bg-black text-white":"bg-gray-200"}`} onClick={()=>setTab("items")}>Items</button>
        <button className={`px-3 py-1.5 rounded ${tab==="analyses"?"bg-black text-white":"bg-gray-200"}`} onClick={()=>setTab("analyses")}>Analyses</button>
      </div>

      {loading ? <div>Cargando…</div> : (
        tab==="items" ? (
          <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-2">Fecha</th>
                  <th className="text-left p-2">Título</th>
                  <th className="text-left p-2">Fuente</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Link</th>
                </tr>
              </thead>
              <tbody>
                {items.length===0 ? (
                  <tr><td className="p-4 text-center" colSpan={5}>Sin items</td></tr>
                ) : items.map(it=>(
                  <tr key={it.id} className="border-b">
                    <td className="p-2">{it.publishedAt ? new Date(it.publishedAt).toLocaleString() : "-"}</td>
                    <td className="p-2">{it.title}</td>
                    <td className="p-2">{(new URL(it.url)).hostname}</td>
                    <td className="p-2">{it.status || "-"}</td>
                    <td className="p-2"><a className="underline text-blue-600" href={it.url} target="_blank" rel="noreferrer">Abrir</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-2">Fecha</th>
                  <th className="text-left p-2">Sentiment</th>
                  <th className="text-left p-2">Tone</th>
                  <th className="text-left p-2">Topics</th>
                  <th className="text-left p-2">Resumen</th>
                </tr>
              </thead>
              <tbody>
                {analyses.length===0 ? (
                  <tr><td className="p-4 text-center" colSpan={5}>Sin análisis</td></tr>
                ) : analyses.map(a=>(
                  <tr key={a.id} className="border-b">
                    <td className="p-2">{a.createdAt ? new Date(a.createdAt).toLocaleString() : "-"}</td>
                    <td className="p-2">{a.sentiment ?? "-"}</td>
                    <td className="p-2">{a.tone ?? "-"}</td>
                    <td className="p-2">{Array.isArray(a.topics)? a.topics.join(", ") : "-"}</td>
                    <td className="p-2">{a.summary ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
} 