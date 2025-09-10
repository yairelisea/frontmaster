// src/pages/admin/ActiveCampaignsPage.jsx (wired to backend)
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminAPI } from '@/lib/api';

const initial = { name:'', query:'', size:25, days_back:14, lang:'es-419', country:'MX', city_keywords:[], plan:'BASIC', autoEnabled:true };

export default function ActiveCampaignsPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(initial);
  const [addingUrl, setAddingUrl] = useState('');
  const [targetCamp, setTargetCamp] = useState(null);

  const load = async () => {
    try {
      const data = await AdminAPI.listCampaigns();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); alert(e.message); }
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

  const updatePlan = async (c, plan) => {
    try {
      await AdminAPI.updateCampaign(c.id, { plan });
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
      setAddingUrl('');
      setTargetCamp(null);
      await load();
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Crear campaña</CardTitle>
          <CardDescription>Define actor (query), tamaño y plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onCreate} className="grid grid-cols-7 gap-3 items-end">
            <Input placeholder="nombre" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
            <Input placeholder="query (actor)" value={form.query} onChange={e=>setForm({...form,query:e.target.value})} required />
            <Input type="number" placeholder="size" value={form.size} onChange={e=>setForm({...form,size:Number(e.target.value)})} />
            <Select value={form.plan} onValueChange={v=>setForm({...form, plan:v})}>
              <SelectTrigger><SelectValue placeholder="Plan" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="BASIC">BASIC</SelectItem>
                <SelectItem value="PRO">PRO</SelectItem>
                <SelectItem value="UNLIMITED">UNLIMITED</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit">Crear</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Campañas</CardTitle>
          <CardDescription>Edita tamaño, plan, auto y URLs manuales.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Query</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Auto</TableHead>
                <TableHead>Agregar URL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(c => (
                <TableRow key={c.id}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.query}</TableCell>
                  <TableCell>
                    <Input className="w-24" type="number" defaultValue={c.size} onBlur={e=>updateSize(c, e.target.value)} />
                  </TableCell>
                  <TableCell>
                    <Select value={c.plan} onValueChange={v=>updatePlan(c, v)}>
                      <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BASIC">BASIC</SelectItem>
                        <SelectItem value="PRO">PRO</SelectItem>
                        <SelectItem value="UNLIMITED">UNLIMITED</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={()=>toggleAuto(c)}>{c.autoEnabled ? 'ON':'OFF'}</Button>
                  </TableCell>
                  <TableCell>
                    {targetCamp===c.id ? (
                      <div className="flex gap-2">
                        <Input placeholder="https://..." value={addingUrl} onChange={e=>setAddingUrl(e.target.value)} />
                        <Button size="sm" onClick={()=>addUrl(c)}>Agregar</Button>
                        <Button size="sm" variant="ghost" onClick={()=>{setTargetCamp(null);setAddingUrl('')}}>Cancelar</Button>
                      </div>
                    ) : (
                      <Button size="sm" onClick={()=>setTargetCamp(c.id)}>Agregar URL</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
