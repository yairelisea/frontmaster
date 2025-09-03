import { useEffect, useState } from "react";
import { listCampaigns, deleteCampaign } from "@/services/campaigns";

export default function CampaignList({ onOpen, onOpenNew }) {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true); setErr(null);
    try {
      const data = await listCampaigns();
      setRows(data || []);
    } catch (e) {
      setErr(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!confirm("¿Eliminar campaña?")) return;
    await deleteCampaign(id);
    load();
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Campañas</h2>
        <button onClick={onOpenNew} className="px-3 py-2 bg-black text-white rounded">Nueva campaña</button>
      </div>
      {err && <div className="text-red-600">{err}</div>}
      {loading ? <div>Cargando...</div> : (
        <div className="grid gap-2">
          {rows.map(c => (
            <div key={c.id} className="border rounded p-3 flex justify-between items-center">
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-sm text-gray-500">
                  {c.query} • resultados: {c.size ?? "—"} • días: {c.days_back ?? "—"}
                  {c.city_keywords?.length ? <> • ciudades: {c.city_keywords.join(", ")}</> : null}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onOpen(c)} className="px-3 py-2 border rounded">Abrir</button>
                <button onClick={() => remove(c.id)} className="px-3 py-2 border rounded text-red-600">Eliminar</button>
              </div>
            </div>
          ))}
          {!rows.length && <div className="text-gray-600">No hay campañas</div>}
        </div>
      )}
    </div>
  );
}