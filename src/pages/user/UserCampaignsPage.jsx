import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { CampaignTable } from '@/components/user/campaigns/CampaignTable';
import { useNavigate, Link } from 'react-router-dom';
import { fetchCampaigns } from '@/lib/api';

const UserCampaignsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchCampaigns(); // usa VITE_API_URL + header x-user-id
        if (mounted) setCampaigns(data);
      } catch (err) {
        console.error(err);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las campañas.',
          variant: 'destructive',
        });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [toast]);

  const filteredCampaigns = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return campaigns;
    return campaigns.filter(c =>
      (c.name ?? '').toLowerCase().includes(term) ||
      (c.query ?? '').toLowerCase().includes(term)
    );
  }, [campaigns, searchTerm]);

  const handleEditCampaign = (campaign) => {
    navigate(`/user/campaigns/edit/${campaign.id}`);
  };

  const handleOpenNewForm = () => {
    navigate('/user/campaigns/new');
  };

  // Estas funciones hoy solo actualizan UI local; para MVP las dejamos “no-op”
  const toggleCampaignStatus = (campaignId) => {
    toast({ title: 'Próximamente', description: 'Cambiar estado aún no está conectado.', className: 'bg-brand-green text-white' });
  };

  const deleteCampaign = (campaignId) => {
    toast({ title: 'Próximamente', description: 'Eliminar campaña aún no está conectado.', variant: 'destructive' });
  };

  if (loading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Cargando campañas…
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <Card className="shadow-xl overflow-hidden border-t-4 border-brand-green">
        <CardHeader className="bg-gray-50 p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Mis Campañas</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">Gestiona tus campañas de monitoreo y lanza análisis con IA.</CardDescription>
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
              placeholder="Buscar por nombre o consulta (query)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-2/3 lg:w-1/2 focus-visible:ring-brand-green"
            />
          </div>

          <CampaignTable 
            campaigns={filteredCampaigns}
            allCampaignsCount={campaigns.length}
            onEdit={handleEditCampaign}
            onToggleStatus={toggleCampaignStatus}
            onDelete={deleteCampaign}
            onOpenNewForm={handleOpenNewForm}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UserCampaignsPage;