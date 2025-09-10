import React, { useEffect, useState } from "react";
import { AdminAPI } from "../lib/api";

const initial = { name: "", query: "", size: 25, days_back: 14, lang: "es-419", country: "MX", city_keywords: [], plan: "BASIC", autoEnabled: true };

export default function CampaignsPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(initial);
  const [addingUrl, setAddingUrl] = useState("");
  const [targetCamp, setTargetCamp] = useState(null);

  const load = async () => {
    try {
      const data = await AdminAPI.listCampaigns();
      setRows(data || []);
    } catch (e) { alert(e.message); }
  };
  useEffect(()=>{ load(); }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    try {
      await AdminAPI.createCampaign(form);
      setForm(initial);
      await load();
    } catch (e) { alert(e.message); }
  };

  const updateSize = async (c, size) => {
    try {
      await AdminAPI.updateCampaign(c.id, { size: Number(size) });
      await load();
    } catch (e) { alert(e.message); }
  };

  const toggleAuto = async (c) => {
    try {
      await AdminAPI.updateCampaign(c.id, { autoEnabled: !c.autoEnabled });
      await load();
    } catch (e) { alert(e.message); }
  };

  const addUrl = async (c) => {
    if (!addingUrl.trim()) return;
    try {
      await AdminAPI.addUrlToCampaign(c.id, addingUrl.trim());
      setAddingUrl("");
      setTargetCamp(null);
      await load();
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Campañas</h1>

      <form onSubmit={onCreate} className="grid grid-cols-7 gap-3 items-end">
        <input className="border p-2 col-span-2" placeholder="nombre" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/>
        <input className="border p-2 col-span-2" placeholder="query (actor)" value={form.query} onChange={e=>setForm({...form,query:e.target.value})} required/>
        <input className="border p-2" type="number" placeholder="size" value={form.size} onChange={e=>setForm({...form,size:e.target.value})}/>
        <select className="border p-2" value={form.plan} onChange={e=>setForm({...form,plan:e.target.value})}>
          <option value="BASIC">BASIC</option>
          <option value="PRO">PRO</option>
          <option value="UNLIMITED">UNLIMITED</option>
        </select>
        <button className="bg-black text-white px-4 py-2 rounded">Crear</button>
      </form>

      <div className="overflow-auto">
        <table className="min-w-full border">
          <thead><tr className="bg-gray-100">
            <th className="p-2 border">Nombre</th>
            <th className="p-2 border">Query</th>
            <th className="p-2 border">Size</th>
            <th className="p-2 border">Plan</th>
            <th className="p-2 border">Auto</th>
            <th className="p-2 border">Acciones</th>
          </tr></thead>
          <tbody>
            {rows.map(c => (
              <tr key={c.id}>
                <td className="p-2 border">{c.name}</td>
                <td className="p-2 border">{c.query}</td>
                <td className="p-2 border">
                  <input className="border p-1 w-24" type="number" defaultValue={c.size} onBlur={e=>updateSize(c, e.target.value)} />
                </td>
                <td className="p-2 border">{c.plan}</td>
                <td className="p-2 border">
                  <button className="px-3 py-1 border rounded" onClick={()=>toggleAuto(c)}>{c.autoEnabled ? "ON":"OFF"}</button>
                </td>
                <td className="p-2 border">
                  {targetCamp===c.id ? (
                    <div className="flex gap-2">
                      <input className="border p-1" placeholder="https://..." value={addingUrl} onChange={e=>setAddingUrl(e.target.value)} />
                      <button className="px-3 py-1 border rounded" onClick={()=>addUrl(c)}>Agregar URL</button>
                      <button className="px-3 py-1" onClick={()=>{setTargetCamp(null);setAddingUrl("");}}>Cancelar</button>
                    </div>
                  ) : (
                    <button className="px-3 py-1 border rounded" onClick={()=>setTargetCamp(c.id)}>Agregar URL</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
