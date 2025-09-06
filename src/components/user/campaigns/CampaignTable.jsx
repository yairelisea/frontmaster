import React from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator, DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit3, Trash2, FileText, Play, Pause, Eye, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CampaignTable = ({
  campaigns,
  allCampaignsCount,
  onEdit,
  onToggleStatus,
  onDelete,
  onOpenNewForm,
  onAnalyze,           // <-- NUEVO: callback para lanzar análisis IA
  analyzingId,         // <-- NUEVO: id en análisis (para mostrar loading por fila)
}) => {
  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/10">
            <TableRow>
              <TableHead className="w-[220px]">Nombre</TableHead>
              <TableHead>Consulta</TableHead>
              <TableHead>Tamaño</TableHead>
              <TableHead>Días</TableHead>
              <TableHead>País / Idioma</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {campaigns.length > 0 ? campaigns.map((c, index) => (
                <motion.tr
                  key={c.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="font-medium text-foreground">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground truncate max-w-[360px]">{c.query}</TableCell>
                  <TableCell className="text-muted-foreground">{c.size}</TableCell>
                  <TableCell className="text-muted-foreground">{c.days_back}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {c.country} / {c.lang}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onAnalyze?.(c)}
                        disabled={analyzingId === c.id}
                        className="gap-2"
                      >
                        {analyzingId === c.id ? (
                          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                        ) : (
                          <BrainCircuit className="h-4 w-4" />
                        )}
                        Analizar IA
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-brand-green">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Opciones</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => {/* Navegar a detalles si lo implementas */}}>
                            <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit?.(c)}>
                            <Edit3 className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onToggleStatus?.(c.id)}>
                            {/* Solo placeholder – si manejas estados */}
                            <Play className="mr-2 h-4 w-4" /> Activar / Pausar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" /> Generar Reporte PDF
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onDelete?.(c.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </motion.tr>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
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
    </>
  );
};