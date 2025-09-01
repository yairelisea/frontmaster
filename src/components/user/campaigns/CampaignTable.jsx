import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit3, Trash2, FileText, Play, Pause, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CampaignTable = ({ campaigns, allCampaignsCount, onEdit, onToggleStatus, onDelete, onOpenNewForm }) => {
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
                        <DropdownMenuItem onClick={() => onEdit(campaign)}>
                          <Edit3 className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onToggleStatus(campaign.id)}>
                          {campaign.status === 'Activa' ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                          {campaign.status === 'Activa' ? 'Pausar' : 'Activar'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" /> Generar Reporte PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onDelete(campaign.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
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
          Mostrando {campaigns.length} de {allCampaignsCount} campañas.
        </p>
      )}
    </>
  );
};