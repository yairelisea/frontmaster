// src/pages/admin/UserManagementPage.jsx (wired to backend)
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AdminAPI } from '@/lib/api';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

export default function UserManagementPage() {
  const { toast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', name: '', isAdmin: false, plan: 'BASIC', features: { comparator:false, connectors:false } });
  const [creating, setCreating] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [assign, setAssign] = useState({}); // { [userId]: campaignId }

  const load = async () => {
    setLoading(true);
    try {
      const data = await AdminAPI.listUsers();
      setRows(Array.isArray(data) ? data : []);
      // carga campañas disponibles para asignar
      try {
        const list = await AdminAPI.listCampaigns();
        setCampaigns(Array.isArray(list) ? list : []);
      } catch {}
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: e?.message || 'No se pudieron cargar los usuarios', variant: 'destructive' });
    }
    setLoading(false);
  };
  useEffect(()=>{ load(); }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    // Validación básica
    const email = (form.email || '').trim();
    if (!email) {
      toast({ title: 'Email requerido', description: 'Ingresa un correo válido.', variant: 'destructive' });
      return;
    }
    const emailOk = /.+@.+\..+/.test(email);
    if (!emailOk) {
      toast({ title: 'Email inválido', description: 'Verifica el formato del correo.', variant: 'destructive' });
      return;
    }
    setCreating(true);
    try {
      const { name, isAdmin, plan, features } = form;
      await AdminAPI.createUser({ email, name, isAdmin, plan, features });
      setForm({ email: '', name: '', isAdmin: false, plan: 'BASIC', features: { comparator:false, connectors:false } });
      toast({ title: 'Usuario creado', description: email });
      await load();
    } catch (e) {
      toast({ title: 'No se pudo crear el usuario', description: e?.message || 'Intenta nuevamente', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const updatePlan = async (u, plan) => {
    try {
      await AdminAPI.updateUser(u.id, { plan });
      toast({ title: 'Plan actualizado', description: `${u.email} → ${plan}` });
      await load();
    } catch (e) {
      toast({ title: 'Error actualizando plan', description: e?.message || 'Intenta nuevamente', variant: 'destructive' });
    }
  };

  const toggleAdmin = async (u) => {
    try {
      await AdminAPI.updateUser(u.id, { isAdmin: !u.isAdmin });
      toast({ title: 'Rol admin actualizado', description: `${u.email}: ${!u.isAdmin ? 'Ahora admin' : 'Ya no es admin'}` });
      await load();
    } catch (e) {
      toast({ title: 'Error actualizando rol', description: e?.message || 'Intenta nuevamente', variant: 'destructive' });
    }
  };

  const toggleFeature = async (u, key) => {
    try {
      const next = { ...(u.features || {}), [key]: !(u.features?.[key]) };
      await AdminAPI.updateUser(u.id, { features: next });
      toast({ title: 'Feature actualizado', description: `${u.email}: ${key}` });
      await load();
    } catch (e) {
      toast({ title: 'Error actualizando feature', description: e?.message || 'Intenta nuevamente', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Crear usuario</CardTitle>
          <CardDescription>Alta manual de cuentas con plan y flags.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onCreate} className="grid grid-cols-5 gap-3 items-end">
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
            <Button type="submit" disabled={creating}>{creating ? 'Creando…' : 'Crear'}</Button>
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
                <TableHead>Campañas</TableHead>
                <TableHead>Asignar campaña</TableHead>
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
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {campaigns
                        .filter(c => String(c.userId ?? c.user_id ?? '') === String(u.id))
                        .slice(0, 5)
                        .map(c => (
                          <Link key={c.id} to={`/admin/campaigns/${c.id}`} className="text-xs underline">
                            {c.name || c.query || c.id}
                          </Link>
                        ))}
                      {campaigns.filter(c => String(c.userId ?? c.user_id ?? '') === String(u.id)).length === 0 && (
                        <span className="text-xs text-gray-500">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Select
                        value={assign[u.id] || ''}
                        onValueChange={(v)=> setAssign(prev => ({ ...prev, [u.id]: v }))}
                      >
                        <SelectTrigger className="w-56"><SelectValue placeholder="Seleccionar campaña" /></SelectTrigger>
                        <SelectContent className="max-h-64 overflow-auto">
                          {campaigns.map(c => (
                            <SelectItem key={c.id} value={String(c.id)}>
                              {c.name || c.query || c.id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={async ()=>{
                          const campaignId = assign[u.id];
                          if (!campaignId) {
                            toast({ title: 'Selecciona una campaña', description: 'Elige una campaña para asignar.' });
                            return;
                          }
                          try {
                            await AdminAPI.assignCampaignToUser(campaignId, u.id);
                            toast({ title: 'Campaña asignada', description: `${u.email}` });
                          } catch (e) {
                            toast({ title: 'No se pudo asignar', description: e?.message || 'Intenta nuevamente', variant: 'destructive' });
                          }
                        }}
                      >
                        Agregar
                      </Button>
                    </div>
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
