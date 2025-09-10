import { useEffect, useState } from "react";
import { fetchCampaigns, adminRecover } from "../../api/client";

function Row({ c, onDone }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const onRecover = async () => {
    setLoading(true);
    setMsg("");
    try {
      const r = await adminRecover(c.id);
      if (r?.result) {
        setMsg(`Local:${r.result.local} News:${r.result.ingest} Analyses:${r.result.analyses}`);
      } else {
        setMsg("Ejecutado");
      }
      onDone && onDone();
    } catch (e) {
      setMsg("Error al recuperar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <tr className="border-b">
      <td className="py-2 pr-3">{c.name}</td>
      <td className="py-2 pr-3 text-gray-600">{c.query}</td>
      <td className="py-2 pr-3">{c.size}</td>
      <td className="py-2 pr-3">{c.days_back}</td>
      <td className="py-2 pr-3">{c.country}</td>
      <td className="py-2 pr-3">{new Date(c.createdAt).toLocaleString()}</td>
      <td className="py-2">
        <button
          onClick={onRecover}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-black text-white text-sm disabled:opacity-60"
        >
          {loading ? "Procesando..." : "Recuperar resultados"}
        </button>
        {msg && <div className="text-xs mt-1">{msg}</div>}
      </td>
    </tr>
  );
}

export default function AdminCampaignsPage() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchCampaigns();
      setItems(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = !q
    ? items
    : items.filter((c) =>
        `${c.name} ${c.query}`.toLowerCase().includes(q.toLowerCase())
      );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Mis campañas</h1>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar…"
          className="border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="text-left py-2 pr-3 font-medium">Nombre</th>
              <th className="text-left py-2 pr-3 font-medium">Consulta</th>
              <th className="text-left py-2 pr-3 font-medium">Size</th>
              <th className="text-left py-2 pr-3 font-medium">Días</th>
              <th className="text-left py-2 pr-3 font-medium">País</th>
              <th className="text-left py-2 pr-3 font-medium">Creada</th>
              <th className="text-left py-2 pr-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="py-6 text-center" colSpan={7}>Cargando…</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="py-6 text-center" colSpan={7}>Sin campañas</td>
              </tr>
            ) : (
              filtered.map((c) => (
                <Row key={c.id} c={c} onDone={load} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}