import React, { useEffect, useState } from "react";
import { AdminAPI } from "../lib/api";

export default function UsersPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ id: "", email: "", name: "", isAdmin: false, plan: "BASIC", features: {} });

  const load = async () => {
    setLoading(true);
    try {
      const data = await AdminAPI.listUsers();
      setRows(data || []);
    } catch (e) { alert(e.message); }
    setLoading(false);
  };
  useEffect(()=>{ load(); }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    try {
      await AdminAPI.createUser(form);
      setForm({ id: "", email: "", name: "", isAdmin: false, plan: "BASIC", features: {} });
      await load();
    } catch (e) { alert(e.message); }
  };

  const toggleAdmin = async (u) => {
    try {
      await AdminAPI.updateUser(u.id, { isAdmin: !u.isAdmin });
      await load();
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Usuarios</h1>
      <form onSubmit={onCreate} className="grid grid-cols-5 gap-3 items-end">
        <input className="border p-2" placeholder="id" value={form.id} onChange={e=>setForm({...form,id:e.target.value})} required/>
        <input className="border p-2" placeholder="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/>
        <input className="border p-2" placeholder="nombre" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
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
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Nombre</th>
            <th className="p-2 border">Admin</th>
            <th className="p-2 border">Plan</th>
            <th className="p-2 border">Acciones</th>
          </tr></thead>
          <tbody>
            {rows.map(u => (
              <tr key={u.id}>
                <td className="p-2 border">{u.id}</td>
                <td className="p-2 border">{u.email}</td>
                <td className="p-2 border">{u.name}</td>
                <td className="p-2 border">{u.isAdmin ? "Sí" : "No"}</td>
                <td className="p-2 border">{u.plan}</td>
                <td className="p-2 border">
                  <button className="px-3 py-1 border rounded" onClick={()=>toggleAdmin(u)}>{u.isAdmin?"Quitar admin":"Hacer admin"}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {loading && <div>Cargando...</div>}
    </div>
  );
}
