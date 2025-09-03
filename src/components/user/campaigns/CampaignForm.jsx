import { useState, useEffect } from "react";
import { createCampaign, updateCampaign } from "@/services/campaigns";

export default function CampaignForm({ initial, onSaved, onCancel }) {
  const [name, setName] = useState(initial?.name || "");
  const [query, setQuery] = useState(initial?.query || "");
  const [size, setSize] = useState(initial?.size ?? 35);
  const [days, setDays] = useState(initial?.days_back ?? 14);
  const [lang, setLang] = useState(initial?.lang || "es-419");
  const [country, setCountry] = useState(initial?.country || "MX");
  const [city, setCity] = useState((initial?.city_keywords || []).join(","));
  const [err, setErr] = useState(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true); setErr(null);
    try {
      const payload = {
        name, query,
        size: Number(size),
        days_back: Number(days),
        lang, country,
        city_keywords: city.split(",").map(s => s.trim()).filter(Boolean)
      };
      const out = initial?.id
        ? await updateCampaign(initial.id, payload)
        : await createCampaign(payload);
      onSaved?.(out);
    } catch (e) {
      setErr(e?.response?.data?.detail || e?.message || "Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border rounded p-3 space-y-2">
      <h3 className="font-semibold">{initial?.id ? "Editar campaña" : "Nueva campaña"}</h3>
      {err && <div className="text-red-600">{err}</div>}
      <div className="grid md:grid-cols-2 gap-2">
        <label className="space-y-1">
          <div className="text-sm">Nombre</div>
          <input className="border rounded px-3 py-2 w-full" value={name} onChange={e=>setName(e.target.value)} />
        </label>
        <label className="space-y-1">
          <div className="text-sm">Actor/Tema</div>
          <input className="border rounded px-3 py-2 w-full" value={query} onChange={e=>setQuery(e.target.value)} />
        </label>
        <label className="space-y-1">
          <div className="text-sm">Resultados buscados</div>
          <input type="number" className="border rounded px-3 py-2 w-full" value={size} onChange={e=>setSize(e.target.value)} />
          <div className="text-xs text-gray-500">El backend lo capea según el plan</div>
        </label>
        <label className="space-y-1">
          <div className="text-sm">Días hacia atrás</div>
          <input type="number" className="border rounded px-3 py-2 w-full" value={days} onChange={e=>setDays(e.target.value)} />
        </label>
        <label className="space-y-1">
          <div className="text-sm">Idioma</div>
          <input className="border rounded px-3 py-2 w-full" value={lang} onChange={e=>setLang(e.target.value)} />
        </label>
        <label className="space-y-1">
          <div className="text-sm">País</div>
          <input className="border rounded px-3 py-2 w-full" value={country} onChange={e=>setCountry(e.target.value)} />
        </label>
        <label className="space-y-1 md:col-span-2">
          <div className="text-sm">Palabras clave de ciudad/localidad (coma separadas)</div>
          <input className="border rounded px-3 py-2 w-full" value={city} onChange={e=>setCity(e.target.value)} placeholder="Querétaro,Qro,Corregidora" />
        </label>
      </div>
      <div className="flex gap-2">
        <button onClick={save} disabled={saving} className="px-3 py-2 bg-black text-white rounded">
          {saving ? "Guardando..." : "Guardar"}
        </button>
        <button onClick={onCancel} className="px-3 py-2 border rounded">Cancelar</button>
      </div>
    </div>
  );
}