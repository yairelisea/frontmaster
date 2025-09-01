import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, MoreHorizontal, Search, Edit3, Trash2, FileText, Play, Pause, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { NavLink } from 'react-router-dom';

const initialCampaigns = [
  { id: 'CAMP001', name: 'Lanzamiento Tesla Cybertruck', target: 'Elon Musk', status: 'Activa', mentions: 12056, sentiment: 'Positivo (65%)', startDate: '2025-05-01', endDate: '2025-08-01', keywords: 'Cybertruck, Tesla, Elon Musk, pickup' },
  { id: 'CAMP002', name: 'Impacto IA en el Empleo', target: 'Políticos clave', status: 'Pausada', mentions: 8530, sentiment: 'Neutral (45%)', startDate: '2025-04-15', endDate: '2025-07-15', keywords: 'IA, empleo, futuro del trabajo, automatización' },
  { id: 'CAMP003', name: 'Opinión sobre Reforma Educativa', target: 'Secretaría de Educación', status: 'Finalizada', mentions: 25000, sentiment: 'Negativo (55%)', startDate: '2025-03-01', endDate: '2025-03-10', keywords: 'reforma educativa, SEP, educación pública' },
];

const CampaignForm = ({ onSubmit, existingCampaign, onCancel }) => {
  const [name, setName] = useState(existingCampaign?.name || '');
  const [target, setTarget] = useState(existingCampaign?.target || '');
  const [keywords, setKeywords] = useState(existingCampaign?.keywords || '');
  const [startDate, setStartDate] = useState(existingCampaign?.startDate || '');
  const [endDate, setEndDate] = useState(existingCampaign?.endDate || '');
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !target || !keywords || !startDate || !endDate) {
      toast({ title: "Error", description: "Todos los campos son requeridos.", variant: "destructive" });
      return;
    }
    onSubmit({ id: existingCampaign?.id, name, target, keywords, startDate, endDate, status: existingCampaign?.status || 'Activa', mentions: existingCampaign?.mentions || 0, sentiment: existingCampaign?.sentiment || 'Neutral (50%)' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="campaignName">Nombre de la Campaña</Label>
        <Input id="campaignName" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Monitoreo Elecciones 2025" className="mt-1"/>
      </div>
      <div>
        <Label htmlFor="campaignTarget">Personaje / Entidad a Monitorear</Label>
        <Input id="campaignTarget" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Ej. Candidato X, Empresa Y" className="mt-1"/>
      </div>
      <div>
        <Label htmlFor="campaignKeywords">Palabras Clave (separadas por coma)</Label>
        <Input id="campaignKeywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="Ej. innovación, tecnología, futuro" className="mt-1"/>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Fecha de Inicio</Label>
          <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1"/>
        </div>
        <div>
          <Label htmlFor="endDate">Fecha de Fin</Label>
          <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1"/>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" className="bg-brand-green hover:bg-brand-green/90 text-primary-foreground">
          {existingCampaign ? 'Guardar Cambios' : 'Crear Campaña'}
        </Button>
      </DialogFooter>
    </form>
  );
};


const UserCampaignsPage = () => {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const { toast } = useToast();

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.target.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateOrUpdateCampaign = (campaignData) => {
    if (editingCampaign) {
      setCampaigns(prev => prev.map(c => c.id === editingCampaign.id ? { ...c, ...campaignData } : c));
      toast({ title: "Campaña Actualizada", description: `La campaña "${campaignData.name}" ha sido actualizada.`, className: "bg-brand-green text-white" });
    } else {
      const newCampaign = { ...campaignData, id: `CAMP${String(campaigns.length + 1).padStart(3, '0')}` };
      setCampaigns(prev => [newCampaign, ...prev]);
      toast({ title: "Campaña Creada", description: `La campaña "${newCampaign.name}" ha sido creada.`, className: "bg-brand-green text-white" });
    }
    setIsFormOpen(false);
    setEditingCampaign(null);
  };

  const openFormForEdit = (campaign) => {
    setEditingCampaign(campaign);
    setIsFormOpen(true);
  };
  
  const openFormForNew = () => {
    setEditingCampaign(null);
    setIsFormOpen(true);
  };

  const toggleCampaignStatus = (campaignId) => {
    setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status: c.status === 'Activa' ? 'Pausada' : 'Activa' } : c));
    const campaign = campaigns.find(c => c.id === campaignId);
    toast({ title: "Estado Cambiado", description: `La campaña "${campaign.name}" ahora está ${campaign.status === 'Activa' ? 'Pausada' : 'Activa'}.`, className: "bg-brand-green text-white" });
  };
  
  const deleteCampaign = (campaignId) => {
     const campaign = campaigns.find(c => c.id === campaignId);
     toast({ title: "Campaña Eliminada", description: `La campaña "${campaign.name}" ha sido eliminada.`, variant: 'destructive' });
     setCampaigns(prev => prev.filter(c => c.id !== campaignId));
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
            <Button onClick={openFormForNew} size="lg" className="bg-brand-green hover:bg-brand-green/90 text-primary-foreground w-full md:w-auto">
              <PlusCircle className="mr-2 h-5 w-5" /> Crear Nueva Campaña
            </Button>
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

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow>
                  <TableHead className="w-[200px]">Nombre Campaña</TableHead>
                  <TableHead>Objetivo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Menciones</TableHead>
                  <TableHead>Sentimiento IA</TableHead>
                  <TableHead>Periodo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredCampaigns.length > 0 ? filteredCampaigns.map((campaign, index) => (
                    <motion.tr 
                      key={campaign.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="font-medium text-foreground">{campaign.name}</TableCell>
                      <TableCell className="text-muted-foreground">{campaign.target}</TableCell>
                      <TableCell>
                        <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                          campaign.status === 'Activa' ? 'bg-green-100 text-green-700 ring-1 ring-green-200' :
                          campaign.status === 'Pausada' ? 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200' :
                          'bg-gray-100 text-gray-700 ring-1 ring-gray-200'
                        }`}>
                          {campaign.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{campaign.mentions.toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground">{campaign.sentiment}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{campaign.startDate} al {campaign.endDate}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-brand-green">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Opciones</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => {/* Navigate to campaign details */}}>
                              <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openFormForEdit(campaign)}>
                              <Edit3 className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleCampaignStatus(campaign.id)}>
                              {campaign.status === 'Activa' ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                              {campaign.status === 'Activa' ? 'Pausar' : 'Activar'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4" /> Generar Reporte PDF
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => deleteCampaign(campaign.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                              <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        No tienes campañas aún. <Button variant="link" className="text-brand-green p-0 h-auto" onClick={openFormForNew}>Crea una ahora</Button>.
                      </TableCell>
                    </TableRow>
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
           {filteredCampaigns.length > 0 && (
            <p className="text-sm text-muted-foreground pt-2">
              Mostrando {filteredCampaigns.length} de {campaigns.length} campañas.
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={(isOpen) => { setIsFormOpen(isOpen); if (!isOpen) setEditingCampaign(null); }}>
        <DialogContent className="sm:max-w-lg md:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl">
              {editingCampaign ? 'Editar Campaña' : 'Crear Nueva Campaña'}
            </DialogTitle>
            <DialogDescription>
              {editingCampaign ? 'Modifica los detalles de tu campaña.' : 'Define los parámetros para tu nueva campaña de monitoreo.'}
            </DialogDescription>
          </DialogHeader>
          <CampaignForm 
            onSubmit={handleCreateOrUpdateCampaign} 
            existingCampaign={editingCampaign} 
            onCancel={() => { setIsFormOpen(false); setEditingCampaign(null); }}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default UserCampaignsPage;