// src/components/user/campaigns/CampaignTable.jsx
import React, { useState, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit3, Trash2, FileText, Play, Pause, Eye, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeCampaign } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import AnalysisResultModal from './AnalysisResultModal';

export const CampaignTable = ({ campaigns, allCampaignsCount, onEdit, onToggleStatus, onDelete, onOpenNewForm }) => {
  const { toast } = useToast();
  const [aiOpen, setAiOpen] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiCampaignName, setAiCampaignName] = useState("");

  const onAnalyze = useCallback(async (campaign) => {
    try {
      toast({ title: "Analizando con IA…", description: `Consultando noticias para: ${campaign.query}`, duration: 2000 });
      const result = await analyzeCampaign(campaign);
      setAiCampaignName(campaign.name);
      setAiResult(result);
      setAiOpen(true);
      toast({ title: "Listo ✅", description: "Análisis completado." });
    } catch (err) {
      console.error(err);
      toast({ title: "Error en análisis", description: String(err?.message || err), variant: "destructive" });
    }
  }, [toast]);

  return (
    <>
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
              {campaigns.length > 0 ? campaigns.map((campaign, index) => (
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
                  <TableCell className="text-muted-foreground">{campaign.query}</TableCell>
                  <TableCell>
                    <span className="px-2.5 py-1 text-xs rounded-full font-medium bg-gray-100 text-gray-700 ring-1 ring-gray-200">
                      Activa
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{(campaign.mentions ?? 0).toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground">{campaign.sentiment ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    Últimos {campaign.days_back ?? 14} días
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-brand-green">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Opciones</DropdownMenuLabel>

                        <DropdownMenuItem onClick={() => onAnalyze(campaign)}>
                          <Bot className="mr-2 h-4 w-4" /> Analizar con IA
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => {/* navegar a detalle */}}>
                          <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => onEdit?.(campaign)}>
                          <Edit3 className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => onToggleStatus?.(campaign.id)}>
                          {campaign.status === 'Activa' ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                          {campaign.status === 'Activa' ? 'Pausar' : 'Activar'}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" /> Generar Reporte PDF
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={() => onDelete?.(campaign.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                          <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No tienes campañas aún. <Button variant="link" className="text-brand-green p-0 h-auto" onClick={onOpenNewForm}>Crea una ahora</Button>.
                  </TableCell>
                </TableRow>
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {campaigns.length > 0 && (
        <p className="text-sm text-muted-foreground pt-2">
          Mostrando {campaigns.length} de {allCampaignsCount ?? campaigns.length} campañas.
        </p>
      )}

      <AnalysisResultModal
        open={aiOpen}
        onOpenChange={setAiOpen}
        result={aiResult}
        campaignName={aiCampaignName}
      />
    </>
  );
};