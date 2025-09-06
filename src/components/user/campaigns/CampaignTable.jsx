import React from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal, Edit3, Trash2, FileText, Play, Pause, Eye, Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * campaigns: array de campañas del backend
 * allCampaignsCount: total de campañas
 * onAnalyze(campaign): callback para lanzar análisis IA
 * onView(campaign): callback para mostrar detalles / análisis guardado
 * analyzingId: string | null => id de campaña que está analizando
 * onEdit, onToggleStatus, onDelete, onOpenNewForm: opcionales (puedes omitirlos)
 */
export const CampaignTable = ({
  campaigns = [],
  allCampaignsCount = 0,
  onAnalyze,
  onView,
  analyzingId,
  onEdit,
  onToggleStatus,
  onDelete,
  onOpenNewForm,
}) => {
  const fmt = (v) => (v === undefined || v === null ? "—" : String(v));
  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/10">
            <TableRow>
              <TableHead className="w-[220px]">Nombre</TableHead>
              <TableHead>Consulta</TableHead>
              <TableHead>País</TableHead>
              <TableHead>Idioma</TableHead>

              <TableHead>Resultados</TableHead>
              <TableHead>Días atrás</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {campaigns.length > 0 ? (
                campaigns.map((c, index) => {
                  const isAnalyzing = analyzingId === c.id;
                  return (
                    <motion.tr
                      key={c.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="font-medium text-foreground">{fmt(c.name)}</TableCell>
                      <TableCell className="text-muted-foreground">{fmt(c.query)}</TableCell>
                      <TableCell className="text-muted-foreground">{fmt(c.country || "MX")}</TableCell>
                      <TableCell className="text-muted-foreground">{fmt(c.lang || "es-419")}</TableCell>
                      <TableCell className="text-muted-foreground">{fmt(c.size ?? 25)}</TableCell>
                      <TableCell className="text-muted-foreground">{fmt(c.days_back ?? 14)}</TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={isAnalyzing}
                            onClick={() => onAnalyze && onAnalyze(c)}
                            className="gap-1"
                            title="Analizar IA"
                          >
                            {isAnalyzing ? (
                              <>
                                <span className="h-4 w-4 rounded-full border-2 border-b-transparent animate-spin" />
                                Analizando…
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4" />
                                Analizar IA
                              </>
                            )}
                          </Button>

                          {/* Menú opcional */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-brand-green"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Opciones</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => onView && onView(c)}
                                title="Ver más (usa análisis en caché si existe)"
                              >
                                <Eye className="mr-2 h-4 w-4" /> Ver más
                              </DropdownMenuItem>
                              {onEdit && (
                                <DropdownMenuItem onClick={() => onEdit(c)}>
                                  <Edit3 className="mr-2 h-4 w-4" /> Editar
                                </DropdownMenuItem>
                              )}
                              {onToggleStatus && (
                                <DropdownMenuItem onClick={() => onToggleStatus(c.id)}>
                                  {/* placeholder de estado temporal */}
                                  <Pause className="mr-2 h-4 w-4" />
                                  Pausar
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <FileText className="mr-2 h-4 w-4" /> Generar Reporte PDF
                              </DropdownMenuItem>
                              {onDelete && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => onDelete(c.id)}
                                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </motion.tr>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No tienes campañas aún.{" "}
                    {onOpenNewForm && (
                      <Button
                        variant="link"
                        className="text-brand-green p-0 h-auto"
                        onClick={onOpenNewForm}
                      >
                        Crea una ahora
                      </Button>
                    )}
                    .
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