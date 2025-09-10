// src/pages/admin/UserManagementPage.jsx (wired to backend)
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AdminAPI } from '@/lib/api';

export default function UserManagementPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ id: '', email: '', name: '', isAdmin: false, plan: 'BASIC', features: { comparator:false, connectors:false } });

  const load = async () => {
    setLoading(true);
    try {
      const data = await AdminAPI.listUsers();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); alert(e.message); }
    setLoading(false);
  };
  useEffect(()=>{ load(); }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    try {
      await AdminAPI.createUser(form);
      setForm({ id: '', email: '', name: '', isAdmin: false, plan: 'BASIC', features: { comparator:false, connectors:false } });
      await load();
    } catch (e) { alert(e.message); }
  };

  const updatePlan = async (u, plan) => {
    try {
      await AdminAPI.updateUser(u.id, { plan });
      await load();
    } catch (e) { alert(e.message); }
  };

  const toggleAdmin = async (u) => {
    try {
      await AdminAPI.updateUser(u.id, { isAdmin: !u.isAdmin });
      await load();
    } catch (e) { alert(e.message); }
  };

  const toggleFeature = async (u, key) => {
    try {
      const next = { ...(u.features || {}), [key]: !(u.features?.[key]) };
      await AdminAPI.updateUser(u.id, { features: next });
      await load();
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Crear usuario</CardTitle>
          <CardDescription>Alta manual de cuentas con plan y flags.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onCreate} className="grid grid-cols-6 gap-3 items-end">
            <Input placeholder="id" value={form.id} onChange={e=>setForm({...form,id:e.target.value})} required />
            <Input placeholder="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
            <Input placeholder="nombre" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
            <Select value={form.plan} onValueChange={v=>setForm({...form, plan:v})}>
              <SelectTrigger><SelectValue placeholder="Plan" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="BASIC">BASIC</SelectItem>
                <SelectItem value="PRO">PRO</SelectItem>
                <SelectItem value="UNLIMITED">UNLIMITED</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm"><span>Comparator</span><Switch checked={form.features.comparator} onCheckedChange={v=>setForm({...form, features:{...form.features, comparator:v}})} /></label>
              <label className="flex items-center gap-2 text-sm"><span>Connectors</span><Switch checked={form.features.connectors} onCheckedChange={v=>setForm({...form, features:{...form.features, connectors:v}})} /></label>
            </div>
            <Button type="submit">Crear</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios</CardTitle>
          <CardDescription>Gestiona planes, admin y funciones opcionales.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Comparator</TableHead>
                <TableHead>Connectors</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(u => (
                <TableRow key={u.id}>
                  <TableCell>{u.id}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={()=>toggleAdmin(u)}>{u.isAdmin ? 'Sí' : 'No'}</Button>
                  </TableCell>
                  <TableCell>
                    <Select value={u.plan} onValueChange={v=>updatePlan(u, v)}>
                      <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BASIC">BASIC</SelectItem>
                        <SelectItem value="PRO">PRO</SelectItem>
                        <SelectItem value="UNLIMITED">UNLIMITED</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Switch checked={!!(u.features?.comparator)} onCheckedChange={()=>toggleFeature(u,'comparator')} />
                  </TableCell>
                  <TableCell>
                    <Switch checked={!!(u.features?.connectors)} onCheckedChange={()=>toggleFeature(u,'connectors')} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {loading && <div className="text-sm text-muted-foreground mt-2">Cargando...</div>}
        </CardContent>
      </Card>
    </div>
  );
}
