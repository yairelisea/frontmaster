import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCampaigns } from "@/lib/api";

export default function AdminCampaignsPage() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchCampaigns();
        setList(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr(e?.message || "Error cargando campañas");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = !q
    ? list
    : list.filter((c) => (`${c.name} ${c.query}`).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Campañas</h1>
        <input
          className="border rounded px-3 py-2 text-sm"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar..."
        />
      </div>

      {err && <div className="text-red-600 text-sm">{err}</div>}

      <div className="bg-white rounded-xl shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2">Nombre</th>
              <th className="text-left p-2">Query</th>
              <th className="text-left p-2">Size</th>
              <th className="text-left p-2">Días</th>
              <th className="text-left p-2">País</th>
              <th className="text-left p-2">Creada</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-6 text-center text-gray-500" colSpan={6}>Cargando…</td></tr>
            ) : (
              <>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b">
                    <td className="p-2 underline">
                      <Link to={`/admin/campaigns/${c.id}`}>{c.name}</Link>
                    </td>
                    <td className="p-2">{c.query}</td>
                    <td className="p-2">{c.size}</td>
                    <td className="p-2">{c.days_back}</td>
                    <td className="p-2">{c.country}</td>
                    <td className="p-2">{c.createdAt ? new Date(c.createdAt).toLocaleString() : "—"}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td className="p-6 text-center text-gray-500" colSpan={6}>Sin campañas</td></tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

