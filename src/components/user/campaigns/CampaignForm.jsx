import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

export const CampaignForm = ({ onSubmit, existingCampaign, onCancel }) => {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [keywords, setKeywords] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (existingCampaign) {
      setName(existingCampaign.name || '');
      setTarget(existingCampaign.target || '');
      setKeywords(existingCampaign.keywords || '');
      setStartDate(existingCampaign.startDate || '');
      setEndDate(existingCampaign.endDate || '');
    } else {
      setName('');
      setTarget('');
      setKeywords('');
      setStartDate('');
      setEndDate('');
    }
  }, [existingCampaign]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !target || !keywords || !startDate || !endDate) {
      toast({ title: "Error", description: "Todos los campos son requeridos.", variant: "destructive" });
      return;
    }
    onSubmit({ 
      id: existingCampaign?.id, 
      name, 
      target, 
      keywords, 
      startDate, 
      endDate, 
      status: existingCampaign?.status || 'Activa', 
      mentions: existingCampaign?.mentions || 0, 
      sentiment: existingCampaign?.sentiment || 'Neutral (50%)' 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="campaignName-form">Nombre de la Campaña</Label>
        <Input id="campaignName-form" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Monitoreo Elecciones 2025" className="mt-1"/>
      </div>
      <div>
        <Label htmlFor="campaignTarget-form">Personaje / Entidad a Monitorear</Label>
        <Input id="campaignTarget-form" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Ej. Candidato X, Empresa Y" className="mt-1"/>
      </div>
      <div>
        <Label htmlFor="campaignKeywords-form">Palabras Clave (separadas por coma)</Label>
        <Input id="campaignKeywords-form" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="Ej. innovación, tecnología, futuro" className="mt-1"/>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate-form">Fecha de Inicio</Label>
          <Input id="startDate-form" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1"/>
        </div>
        <div>
          <Label htmlFor="endDate-form">Fecha de Fin</Label>
          <Input id="endDate-form" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1"/>
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