import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { CampaignTable } from '@/components/user/campaigns/CampaignTable';
import { useNavigate, Link } from 'react-router-dom';

const initialCampaignsData = [
  { id: 'CAMP001', name: 'Lanzamiento Tesla Cybertruck', target: 'Elon Musk', status: 'Activa', mentions: 12056, sentiment: 'Positivo (65%)', startDate: '2025-05-01', endDate: '2025-08-01', keywords: 'Cybertruck, Tesla, Elon Musk, pickup' },
  { id: 'CAMP002', name: 'Impacto IA en el Empleo', target: 'Políticos clave', status: 'Pausada', mentions: 8530, sentiment: 'Neutral (45%)', startDate: '2025-04-15', endDate: '2025-07-15', keywords: 'IA, empleo, futuro del trabajo, automatización' },
  { id: 'CAMP003', name: 'Opinión sobre Reforma Educativa', target: 'Secretaría de Educación', status: 'Finalizada', mentions: 25000, sentiment: 'Negativo (55%)', startDate: '2025-03-01', endDate: '2025-03-10', keywords: 'reforma educativa, SEP, educación pública' },
];

// In a real app, this state would be managed globally (e.g., Context, Redux, Zustand) or fetched/updated via API.
// For now, we'll use a simple in-memory store for demonstration.
let campaignsStore = [...initialCampaignsData];

const UserCampaignsPage = () => {
  const [campaigns, setCampaigns] = useState(campaignsStore);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Effect to re-sync with the "store" if it changes (e.g. after form submission on another page)
  // This is a simple way to reflect changes. A proper state management solution would be better.
  useEffect(() => {
    setCampaigns(campaignsStore);
  }, []);


  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.target.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditCampaign = (campaign) => {
    navigate(`/user/campaigns/edit/${campaign.id}`);
  };
  
  const handleOpenNewForm = () => {
    navigate('/user/campaigns/new');
  };

  const toggleCampaignStatus = (campaignId) => {
    const campaign = campaignsStore.find(c => c.id === campaignId);
    if (!campaign) return;
    const newStatus = campaign.status === 'Activa' ? 'Pausada' : 'Activa';
    
    campaignsStore = campaignsStore.map(c => c.id === campaignId ? { ...c, status: newStatus } : c);
    setCampaigns(campaignsStore);

    toast({ title: "Estado Cambiado", description: `La campaña "${campaign.name}" ahora está ${newStatus}.`, className: "bg-brand-green text-white" });
  };
  
  const deleteCampaign = (campaignId) => {
     const campaign = campaignsStore.find(c => c.id === campaignId);
     if (!campaign) return;
     
     campaignsStore = campaignsStore.filter(c => c.id !== campaignId);
     setCampaigns(campaignsStore);

     toast({ title: "Campaña Eliminada", description: `La campaña "${campaign.name}" ha sido eliminada.`, variant: 'destructive' });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="shadow-xl overflow-hidden border-t-4 border-brand-green">
        <CardHeader className="bg-gray-50 p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Mis Campañas</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">Gestiona tus campañas de monitoreo activas, pausadas o finalizadas.</CardDescription>
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
              placeholder="Buscar por nombre de campaña o personaje..." 
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