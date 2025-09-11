// src/pages/admin/AdminCampaignDetailPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  adminGetCampaign,
  adminListCampaigns,
  fetchCampaignById,
  adminFetchCampaignOverview,
  adminFetchCampaignItems,
  adminFetchCampaignAnalyses,
  adminRecover,
  adminProcessAnalyses,
  adminBuildReport,
} from "@/lib/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { analyzeNewsForCampaign, fetchNewsForCampaign } from "@/lib/api";

export default function AdminCampaignDetailPage() {
  const { id } = useParams();

  const [campaign, setCampaign] = useState(null);
  const [overview, setOverview] = useState(null);
  const [items, setItems] = useState({ count: 0, page: 1, per_page: 25, items: [] });
  const [analyses, setAnalyses] = useState({ count: 0, page: 1, per_page: 25, items: [] });
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  const [itemFilters, setItemFilters] = useState({ q: "", status: "", order: "publishedAt", dir: "desc", page: 1, per_page: 25 });
  const [analysisFilters, setAnalysisFilters] = useState({ q: "", order: "createdAt", dir: "desc", page: 1, per_page: 25 });

  const loadBase = async () => {
    setLoading(true); setErr("");
    try {
      let c = null;
      try {
        c = await adminGetCampaign(id);
      } catch (e) {
        // Fallback robusto: intenta listar campañas admin y filtrar por id
        try {
          const list = await adminListCampaigns();
          c = (Array.isArray(list) ? list.find((x) => String(x.id) === String(id)) : null) || null;
        } catch {
          // último recurso: endpoint de usuario (puede devolver 403 si no eres owner)
          c = await fetchCampaignById(id);
        }
      }
      setCampaign(c || null);
      let o = null;
      try {
        o = await adminFetchCampaignOverview(id);
      } catch {}
      if (!o) {
        // Fallback: intenta calcular overview a partir de análisis IA o noticias
        try {
          const res = await analyzeNewsForCampaign(c, { size: 50, overall: true });
          const items = Array.isArray(res?.items) ? res.items : [];
          const sentiments = items
            .map((it) => (typeof it.sentiment === 'number' ? it.sentiment : (typeof it.llm?.sentiment_score === 'number' ? it.llm.sentiment_score : null)))
            .filter((v) => v != null);
          const avg_sentiment = sentiments.length ? sentiments.reduce((a,b)=>a+b,0)/sentiments.length : null;
          const topicCounts = new Map();
          items.forEach((it) => {
            const topics = Array.isArray(it.topics) ? it.topics : (Array.isArray(it.llm?.topics) ? it.llm.topics : []);
            topics.forEach((t) => topicCounts.set(t, (topicCounts.get(t)||0)+1));
          });
          const top_topics = Array.from(topicCounts.entries()).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([topic,count])=>({topic,count}));
          o = {
            total_items: items.length,
            analyzed_items: items.length,
            pending_items: 0,
            avg_sentiment,
            top_topics,
            last_run: null,
          };
        } catch {}
      }
      setOverview(o);
    } catch (e) {
      setErr(e?.message || "Error cargando datos");
    } finally {
      setLoading(false);
    }
  };

  const loadItems = async () => {
    try {
      const data = await adminFetchCampaignItems(id, itemFilters);
      if (data && typeof data === 'object' && Array.isArray(data.items)) {
        setItems(data);
        return;
      }
      throw new Error('no-items');
    } catch {
      // Fallback: usa /news/news con los parámetros de la campaña
      try {
        const news = await fetchNewsForCampaign(campaign, { size: itemFilters.per_page, days_back: campaign?.days_back });
        const items = (news?.items || []).map((it, idx) => ({
          id: it.id || String(idx),
          title: it.title,
          url: it.link || it.url,
          source: it.source,
          snippet: it.summary,
          publishedAt: it.published_at,
          status: null,
        }));
        setItems({ count: items.length, page: 1, per_page: itemFilters.per_page, items });
      } catch {}
    }
  };

  const loadAnalyses = async () => {
    try {
      const data = await adminFetchCampaignAnalyses(id, analysisFilters);
      if (data && typeof data === 'object' && Array.isArray(data.items)) {
        setAnalyses(data);
        return;
      }
      throw new Error('no-analyses');
    } catch {
      // Fallback: invoca /ai/analyze-news y mapea results
      try {
        const res = await analyzeNewsForCampaign(campaign, { size: analysisFilters.per_page, days_back: campaign?.days_back, overall: true });
        const items = Array.isArray(res?.items) ? res.items.map((it, idx) => ({
          id: it.id || String(idx),
          itemId: it.itemId || null,
          sentiment: it.sentiment ?? it.llm?.sentiment_score ?? null,
          tone: it.tone || null,
          topics: it.topics || it.llm?.topics || [],
          summary: it.summary || it.llm?.summary || '',
          entities: it.entities || it.llm?.entities || null,
          stance: it.stance || null,
          perception: it.perception || null,
          createdAt: it.createdAt || null,
        })) : [];
        setAnalyses({ count: items.length, page: 1, per_page: analysisFilters.per_page, items });
      } catch {}
    }
  };

  useEffect(() => { loadBase(); }, [id]);
  useEffect(() => { if (tab === "items") loadItems(); }, [tab, itemFilters]);
  useEffect(() => { if (tab === "analyses") loadAnalyses(); }, [tab, analysisFilters]);

  const onRecover = async () => {
    setBusy(true); setActionMsg("");
    try {
      await adminRecover(id);
      await adminProcessAnalyses(id);
      setActionMsg("Actualizada (buscar + analizar) OK");
      await loadBase();
      if (tab === "items") await loadItems();
      if (tab === "analyses") await loadAnalyses();
    } catch {
      // Fallback: ejecutar análisis IA para mostrar datos aunque el backend de recuperación falle
      try {
        setActionMsg("Backend no disponible. Ejecutando análisis IA (solo lectura)…");
        await analyzeNewsForCampaign(campaign, { overall: true });
        await loadBase();
        if (tab === "items") await loadItems();
        if (tab === "analyses") await loadAnalyses();
        setActionMsg("Análisis IA listo (modo lectura)");
      } catch {
        setActionMsg("Error al actualizar");
      }
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

  const onQuickAnalyze = async () => {
    setBusy(true); setActionMsg("");
    try {
      await analyzeNewsForCampaign(campaign, { overall: true });
      await loadBase();
      if (tab === "items") await loadItems();
      if (tab === "analyses") await loadAnalyses();
      setActionMsg("Análisis IA listo (lectura)");
    } catch {
      setActionMsg("Error en análisis IA");
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
          <button onClick={loadBase} disabled={loading || busy} className="px-3 py-1.5 rounded bg-gray-200 text-gray-900 text-sm">{loading ? "Cargando…" : "Refrescar"}</button>
          <button onClick={onRecover} disabled={busy} className="px-3 py-1.5 rounded bg-black text-white text-sm">{busy ? "…" : "Actualizar (buscar + analizar)"}</button>
          <button onClick={onQuickAnalyze} disabled={busy} className="px-3 py-1.5 rounded bg-gray-900 text-white text-sm">IA (rápido)</button>
          <button onClick={onPDF} disabled={busy} className="px-3 py-1.5 rounded bg-gray-800 text-white text-sm">PDF</button>
        </div>
      </div>

      {err && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{err}</div>}
      {actionMsg && <div className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded p-2">{actionMsg}</div>}

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="text-xs uppercase tracking-wide text-gray-500">Query</div>
        <div className="text-lg font-semibold">{campaign.query}</div>
        <div className="text-sm text-gray-800 mt-1">size: {campaign.size} · días: {campaign.days_back} · país: {campaign.country}</div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="analyses">Analyses</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewSection overview={overview} />
        </TabsContent>

        <TabsContent value="items">
          <ItemsSection state={items} filters={itemFilters} setFilters={setItemFilters} />
        </TabsContent>

        <TabsContent value="analyses">
          <AnalysesSection state={analyses} filters={analysisFilters} setFilters={setAnalysisFilters} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OverviewSection({ overview }) {
  if (!overview) return <div className="text-sm text-gray-500">Sin datos de overview.</div>;
  const { total_items, analyzed_items, pending_items, avg_sentiment, top_topics = [], last_run } = overview;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        <Kpi label="Items" value={total_items} />
        <Kpi label="Analizados" value={analyzed_items} />
        <Kpi label="Pendientes" value={pending_items} />
        <Kpi label="Sentimiento prom." value={avg_sentiment != null ? Number(avg_sentiment).toFixed(2) : "—"} />
        <Kpi label="Última ejecución" value={last_run ? new Date(last_run).toLocaleString() : "—"} />
      </div>
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="text-sm font-medium mb-2">Top topics</div>
        {top_topics.length === 0 ? (
          <div className="text-sm text-gray-500">Sin topics.</div>
        ) : (
          <ul className="text-sm list-disc pl-6">
            {top_topics.map((t, i) => (
              <li key={i} className="flex justify-between"><span>{t.topic}</span><span className="text-gray-500">{t.count}</span></li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ItemsSection({ state, filters, setFilters }) {
  const { items = [], count = 0, page = 1, per_page = 25 } = state || {};
  const totalPages = Math.max(1, Math.ceil(count / per_page));
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <input className="border rounded px-2 py-1 text-sm" placeholder="Buscar título…" value={filters.q} onChange={(e)=>setFilters({ ...filters, q: e.target.value, page: 1 })} />
        <select className="border rounded px-2 py-1 text-sm" value={filters.status} onChange={(e)=>setFilters({ ...filters, status: e.target.value, page: 1 })}>
          <option value="">Estado (todos)</option>
          <option value="PENDING">PENDING</option>
          <option value="PROCESSED">PROCESSED</option>
          <option value="ERROR">ERROR</option>
        </select>
        <select className="border rounded px-2 py-1 text-sm" value={filters.order} onChange={(e)=>setFilters({ ...filters, order: e.target.value })}>
          <option value="publishedAt">publishedAt</option>
          <option value="createdAt">createdAt</option>
        </select>
        <select className="border rounded px-2 py-1 text-sm" value={filters.dir} onChange={(e)=>setFilters({ ...filters, dir: e.target.value })}>
          <option value="desc">desc</option>
          <option value="asc">asc</option>
        </select>
        <select className="border rounded px-2 py-1 text-sm" value={filters.per_page} onChange={(e)=>setFilters({ ...filters, per_page: Number(e.target.value), page: 1 })}>
          {[10,25,50].map(n => <option key={n} value={n}>{n}/página</option>)}
        </select>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="text-left py-2 px-3 font-medium">Título</th>
              <th className="text-left py-2 px-3 font-medium">Fuente</th>
              <th className="text-left py-2 px-3 font-medium">Fecha</th>
              <th className="text-left py-2 px-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td className="py-6 text-center" colSpan={4}>Sin resultados</td></tr>
            ) : items.map((it) => (
              <tr key={it.id} className="border-b">
                <td className="py-2 px-3"><a className="underline" href={it.url} target="_blank" rel="noreferrer">{it.title || it.url}</a><div className="text-xs text-gray-500">{it.snippet || ""}</div></td>
                <td className="py-2 px-3">{it.source || "—"}</td>
                <td className="py-2 px-3">{it.publishedAt ? new Date(it.publishedAt).toLocaleString() : "—"}</td>
                <td className="py-2 px-3">{it.status || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={(p)=>setFilters({ ...filters, page: p })} />
    </div>
  );
}

function AnalysesSection({ state, filters, setFilters }) {
  const { items = [], count = 0, page = 1, per_page = 25 } = state || {};
  const totalPages = Math.max(1, Math.ceil(count / per_page));
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <input className="border rounded px-2 py-1 text-sm" placeholder="Buscar resumen/topic…" value={filters.q} onChange={(e)=>setFilters({ ...filters, q: e.target.value, page: 1 })} />
        <select className="border rounded px-2 py-1 text-sm" value={filters.order} onChange={(e)=>setFilters({ ...filters, order: e.target.value })}>
          <option value="createdAt">createdAt</option>
          <option value="sentiment">sentiment</option>
        </select>
        <select className="border rounded px-2 py-1 text-sm" value={filters.dir} onChange={(e)=>setFilters({ ...filters, dir: e.target.value })}>
          <option value="desc">desc</option>
          <option value="asc">asc</option>
        </select>
        <select className="border rounded px-2 py-1 text-sm" value={filters.per_page} onChange={(e)=>setFilters({ ...filters, per_page: Number(e.target.value), page: 1 })}>
          {[10,25,50].map(n => <option key={n} value={n}>{n}/página</option>)}
        </select>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="text-left py-2 px-3 font-medium">Resumen</th>
              <th className="text-left py-2 px-3 font-medium">Sentimiento</th>
              <th className="text-left py-2 px-3 font-medium">Tópicos</th>
              <th className="text-left py-2 px-3 font-medium">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td className="py-6 text-center" colSpan={4}>Sin resultados</td></tr>
            ) : items.map((a) => (
              <tr key={a.id} className="border-b">
                <td className="py-2 px-3 whitespace-pre-wrap">{a.summary || "—"}</td>
                <td className="py-2 px-3">{a.sentiment != null ? Number(a.sentiment).toFixed(2) : "—"}</td>
                <td className="py-2 px-3">{Array.isArray(a.topics) ? a.topics.join(", ") : "—"}</td>
                <td className="py-2 px-3">{a.createdAt ? new Date(a.createdAt).toLocaleString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={(p)=>setFilters({ ...filters, page: p })} />
    </div>
  );
}

function Kpi({ label, value }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function Pagination({ page, totalPages, onPage }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div>Página {page} de {totalPages}</div>
      <div className="flex gap-2">
        <button className="px-3 py-1.5 border rounded" disabled={page<=1} onClick={()=>onPage(page-1)}>Anterior</button>
        <button className="px-3 py-1.5 border rounded" disabled={page>=totalPages} onClick={()=>onPage(page+1)}>Siguiente</button>
      </div>
    </div>
  );
}
