import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Save } from 'lucide-react';
import { motion } from 'framer-motion';

// Mocked campaigns data for standalone page functionality
const initialCampaigns = [
  { id: 'CAMP001', name: 'Lanzamiento Tesla Cybertruck', target: 'Elon Musk', status: 'Activa', mentions: 12056, sentiment: 'Positivo (65%)', startDate: '2025-05-01', endDate: '2025-08-01', keywords: 'Cybertruck, Tesla, Elon Musk, pickup' },
  { id: 'CAMP002', name: 'Impacto IA en el Empleo', target: 'Políticos clave', status: 'Pausada', mentions: 8530, sentiment: 'Neutral (45%)', startDate: '2025-04-15', endDate: '2025-07-15', keywords: 'IA, empleo, futuro del trabajo, automatización' },
];


const CampaignFormPage = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [keywords, setKeywords] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // This would typically come from a global state/context or API call
  const [campaigns, setCampaigns] = useState(initialCampaigns); 

  useEffect(() => {
    if (campaignId) {
      const existingCampaign = campaigns.find(c => c.id === campaignId);
      if (existingCampaign) {
        setName(existingCampaign.name || '');
        setTarget(existingCampaign.target || '');
        setKeywords(existingCampaign.keywords || '');
        setStartDate(existingCampaign.startDate || '');
        setEndDate(existingCampaign.endDate || '');
        setIsEditing(true);
      } else {
        toast({ title: "Error", description: "Campaña no encontrada.", variant: "destructive" });
        navigate('/user/campaigns');
      }
    } else {
      setIsEditing(false);
      // Reset form for new campaign
      setName('');
      setTarget('');
      setKeywords('');
      setStartDate('');
      setEndDate('');
    }
  }, [campaignId, campaigns, navigate, toast]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (!name || !target || !keywords || !startDate || !endDate) {
      toast({ title: "Error", description: "Todos los campos son requeridos.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    const campaignData = { 
      name, 
      target, 
      keywords, 
      startDate, 
      endDate,
    };

    // Simulate API call
    setTimeout(() => {
      if (isEditing) {
        // Update existing campaign (locally for now)
        setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, ...campaignData } : c));
        toast({ title: "Campaña Actualizada", description: `La campaña "${campaignData.name}" ha sido actualizada.`, className: "bg-brand-green text-white" });
      } else {
        // Create new campaign (locally for now)
        const newCampaign = { ...campaignData, id: `CAMP${String(campaigns.length + 1).padStart(3, '0')}`, status: 'Activa', mentions: 0, sentiment: 'Neutral (50%)' };
        setCampaigns(prev => [newCampaign, ...prev]);
        toast({ title: "Campaña Creada", description: `La campaña "${newCampaign.name}" ha sido creada.`, className: "bg-brand-green text-white" });
      }
      setIsLoading(false);
      navigate('/user/campaigns');
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-xl border-t-4 border-brand-green">
        <CardHeader className="bg-gray-50 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {isEditing ? 'Editar Campaña' : 'Crear Nueva Campaña'}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {isEditing ? 'Modifica los detalles de tu campaña.' : 'Define los parámetros para tu nueva campaña de monitoreo.'}
              </CardDescription>
            </div>
            <Link to="/user/campaigns">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Campañas
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
            <div>
              <Label htmlFor="campaignName-page" className="font-semibold">Nombre de la Campaña</Label>
              <Input id="campaignName-page" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Monitoreo Elecciones 2025" className="mt-1 focus-visible:ring-brand-green"/>
            </div>
            <div>
              <Label htmlFor="campaignTarget-page" className="font-semibold">Personaje / Entidad a Monitorear</Label>
              <Input id="campaignTarget-page" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Ej. Candidato X, Empresa Y" className="mt-1 focus-visible:ring-brand-green"/>
            </div>
            <div>
              <Label htmlFor="campaignKeywords-page" className="font-semibold">Palabras Clave (separadas por coma)</Label>
              <Input id="campaignKeywords-page" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="Ej. innovación, tecnología, futuro" className="mt-1 focus-visible:ring-brand-green"/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="startDate-page" className="font-semibold">Fecha de Inicio</Label>
                <Input id="startDate-page" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 focus-visible:ring-brand-green"/>
              </div>
              <div>
                <Label htmlFor="endDate-page" className="font-semibold">Fecha de Fin</Label>
                <Input id="endDate-page" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 focus-visible:ring-brand-green"/>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" className="bg-brand-green hover:bg-brand-green/90 text-primary-foreground px-8 py-3 text-base" disabled={isLoading}>
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="mr-2 h-5 w-5" />
                )}
                {isLoading ? (isEditing ? 'Guardando...' : 'Creando...') : (isEditing ? 'Guardar Cambios' : 'Crear Campaña')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CampaignFormPage;