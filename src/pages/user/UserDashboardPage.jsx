// src/pages/user/UserCampaignsPage.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { CampaignTable } from '@/components/user/campaigns/CampaignTable';
import { useNavigate, Link } from 'react-router-dom';

const API = (import.meta.env.VITE_API_URL || 'https://masterback.onrender.com').replace(/\/+$/, '');
const FAKE_USER = import.meta.env.VITE_FAKE_USER_ID || 'dev-user-1';

export default function UserCampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  // helper: fetch con timeout
  async function fetchWithTimeout(url, options = {}, ms = 15000) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    try {
      const res = await fetch(url, { ...options, signal: ctrl.signal });
      return res;
    } finally {
      clearTimeout(t);
    }
  }

  // carga inicial
  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        // 1) intento con header x-user-id
        let res = await fetchWithTimeout(`${API}/campaigns`, {
          headers: { 'Content-Type': 'application/json', 'x-user-id': FAKE_USER },
        });

        // 2) fallback: si el proxy limpia headers, usa ?userId=
        if (!res.ok) {
          const url = new URL(`${API}/campaigns`);
          url.searchParams.set('userId', FAKE_USER);
          res = await fetchWithTimeout(url.toString(), {
            headers: { 'Content-Type': 'application/json' },
          });
        }

        if (!res.ok) {
          const body = await res.text().catch(() => '');
          throw new Error(`GET /campaigns falló: ${res.status} ${body}`);
        }

        const data = await res.json();
        if (!alive) return;

        setCampaigns(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('fetchCampaigns error:', e);
        if (!alive) return;
        setErrMsg('No se pudieron cargar las campañas');
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las campañas',
          variant: 'destructive',
        });
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => { alive = false; };
  }, [toast]);

  // filtro local por nombre o query
  const filtered = campaigns.filter(c =>
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.query || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // mapeo a las columnas esperadas por CampaignTable
  const tableData = filtered.map(c => ({
    id: c.id,
    name: c.name,
    target: c.query,                          // usamos "query" como target visibles
    status: 'Activa',                         // placeholder: ajusta cuando tengas estado real
    mentions: 0,                              // placeholder: podrás traerlo de /analyses
    sentiment: '—',                           // placeholder
    startDate: (c.createdAt || '').slice(0, 10),
    endDate: '—',
  }));

  const handleEditCampaign = (campaign) => {
    navigate(`/user/campaigns/edit/${campaign.id}`);
  };

  const handleOpenNewForm = () => {
    navigate('/user/campaigns/new');
  };

  const toggleCampaignStatus = () => {
    // TODO: cuando tengas API para activar/pausar
    toast({ title: 'Pendiente', description: 'Pronto podrás pausar/activar campañas.' });
  };

  const deleteCampaign = () => {
    // TODO: llamada DELETE /campaigns/{id}
    toast({ title: 'Pendiente', description: 'Eliminar campañas estará disponible pronto.' });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card className="shadow-xl overflow-hidden border-t-4 border-brand-green">
        <CardHeader className="bg-gray-50 p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                Mis Campañas
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Gestiona tus campañas de monitoreo activas, pausadas o finalizadas.
              </CardDescription>
            </div>
            <Link to="/user/campaigns/new">
              <Button size="lg" className="bg-brand-green hover:bg-brand-green/90 text-primary-foreground w-full md:w-auto">
                <PlusCircle className="mr-2 h-5 w-5" /> Crear Nueva Campaña
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-4 md:p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o término (query)…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-2/3 lg:w-1/2 focus-visible:ring-brand-green"
            />
          </div>

          {loading ? (
            <div className="text-sm text-muted-foreground">Cargando campañas…</div>
          ) : errMsg ? (
            <div className="text-sm text-red-600">{errMsg}</div>
          ) : (
            <CampaignTable
              campaigns={tableData}
              allCampaignsCount={campaigns.length}
              onEdit={handleEditCampaign}
              onToggleStatus={(id) => toggleCampaignStatus(id)}
              onDelete={(id) => deleteCampaign(id)}
              onOpenNewForm={handleOpenNewForm}
            />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}