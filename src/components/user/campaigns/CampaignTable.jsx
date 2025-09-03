// src/components/CampaignTable.jsx
import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator, DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit3, Trash2, Play, Pause, Eye, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Este componente:
 * - Carga campañas desde el backend (GET /campaigns)
 * - Muestra columnas reales: name, query, size, days_back, lang, country, city_keywords, createdAt
 * - Permite lanzar análisis IA (GET /ai/analyze-news?campaignId=...&overall=true)
 * - Muestra resultados en un modal simple
 *
 * Props opcionales:
 * - onEdit(campaign)
 * - onToggleStatus(campaignId)  // si luego agregas estado en el back
 * - onDelete(campaignId)
 * - onOpenNewForm()             // abre formulario para crear campaña
 */
export const CampaignTable = ({
  onEdit,
  onToggleStatus,
  onDelete,
  onOpenNewForm,
}) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const [analyzingId, setAnalyzingId] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const { data } = await api.get("/campaigns");
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setFetchError(e?.response?.data?.detail || e?.message || "Error al cargar campañas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const runAnalysis = async (c) => {
    setAnalyzingId(c.id);
    setAnalyzeError(null);
    setAnalysis(null);
    try {
      const { data } = await api.get("/ai/analyze-news", {
        params: { campaignId: c.id, overall: true },
      });
      setActiveCampaign(c);
      setAnalysis(data);
      setShowModal(true);
    } catch (e) {
      setAnalyzeError(e?.response?.data?.detail || e?.message || "Error al analizar la campaña");
    } finally {
      setAnalyzingId(null);
    }
  };

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <div className="flex items-center justify-between p-3">
          <h2 className="text-lg font-semibold">Campañas</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchCampaigns} disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar"}
            </Button>
            {onOpenNewForm && (
              <Button onClick={onOpenNewForm}>Nueva campaña</Button>
            )}
          </div>
        </div>

        {fetchError && (
          <div className="px-3 pb-2 text-sm text-red-600">{fetchError}</div>
        )}

        <Table>
          <TableHeader className="bg-muted/10">
            <TableRow>
              <TableHead className="w-[220px]">Nombre</TableHead>
              <TableHead>Query</TableHead>
              <TableHead>Resultados</TableHead>
              <TableHead>Días</TableHead>
              <TableHead>Idioma</TableHead>
              <TableHead>País</TableHead>
              <TableHead>Localidades</TableHead>
              <TableHead>Creada</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <AnimatePresence>
              {rows.length > 0 ? (
                rows.map((c, index) => (
                  <motion.tr
                    key={c.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="font-medium text-foreground">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">{c.query}</TableCell>
                    <TableCell className="text-muted-foreground">{c.size}</TableCell>
                    <TableCell className="text-muted-foreground">{c.days_back}</TableCell>
                    <TableCell className="text-muted-foreground">{c.lang}</TableCell>
                    <TableCell className="text-muted-foreground">{c.country}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {Array.isArray(c.city_keywords) && c.city_keywords.length
                        ? c.city_keywords.join(", ")
                        : "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {c.createdAt ? new Date(c.createdAt).toLocaleString() : "-"}
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

                          <DropdownMenuItem onClick={() => runAnalysis(c)}>
                            <Sparkles className="mr-2 h-4 w-4" /> Analizar IA
                          </DropdownMenuItem>

                          <DropdownMenuItem onClick={() => { /* aquí podrías navegar a detalle si tienes ruta */ }}>
                            <Eye className="mr-2 h-4 w-4" /> Ver detalle
                          </DropdownMenuItem>

                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(c)}>
                              <Edit3 className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                          )}

                          {onToggleStatus && (
                            <DropdownMenuItem onClick={() => onToggleStatus(c.id)}>
                              {/* Si luego manejas estados en DB, alterna íconos */}
                              <Pause className="mr-2 h-4 w-4" /> Pausar/Activar
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />

                          <DropdownMenuItem>
                            {/* Pendiente implementar PDF si lo deseas */}
                            <Eye className="mr-2 h-4 w-4" /> Generar Reporte
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          {onDelete && (
                            <DropdownMenuItem
                              onClick={() => onDelete(c.id)}
                              className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))
              ) : (
                !loading && (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                      No tienes campañas aún.{" "}
                      {onOpenNewForm ? (
                        <Button variant="link" className="text-brand-green p-0 h-auto" onClick={onOpenNewForm}>
                          Crea una ahora
                        </Button>
                      ) : (
                        "Crea una desde el menú."
                      )}
                    </TableCell>
                  </TableRow>
                )
              )}

              {loading && (
                <TableRow>
                  <TableCell colSpan={9} className="h-20 text-center text-muted-foreground">
                    Cargando…
                  </TableCell>
                </TableRow>
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {/* Modal de resultados de análisis */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Análisis IA</div>
                <div className="font-semibold">
                  {activeCampaign?.name} — {activeCampaign?.query}
                </div>
              </div>
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cerrar
              </Button>
            </div>

            <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
              {analyzeError && (
                <div className="text-sm text-red-600">{analyzeError}</div>
              )}

              {analysis?.aggregate && (
                <div className="border rounded p-3">
                  <h3 className="font-semibold">Resumen global</h3>
                  <div className="text-sm">
                    <b>Sentimiento:</b>{" "}
                    {analysis.aggregate.overall_sentiment != null
                      ? analysis.aggregate.overall_sentiment.toFixed(2)
                      : "N/A"}
                  </div>
                  {!!analysis.aggregate.key_takeaways?.length && (
                    <ul className="list-disc pl-6 mt-2 text-sm">
                      {analysis.aggregate.key_takeaways.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {!!analysis?.items?.length && (
                <div className="space-y-3">
                  {analysis.items.map((it, i) => (
                    <div key={i} className="border rounded p-3">
                      <a
                        className="font-medium hover:underline"
                        href={it.link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {it.title}
                      </a>
                      <div className="text-xs text-gray-500">
                        {it.source}{" "}
                        {it.published_at &&
                          `• ${new Date(it.published_at).toLocaleString()}`}
                      </div>

                      {it.llm && (
                        <>
                          <p className="mt-2 text-sm">{it.llm.summary}</p>
                          <div className="text-xs mt-1">
                            <b>Sentimiento:</b>{" "}
                            {it.llm.sentiment != null
                              ? it.llm.sentiment.toFixed(2)
                              : "N/A"}{" "}
                            • <b>Tono:</b> {it.llm.tone || "N/A"} •{" "}
                            <b>Postura:</b> {it.llm.stance || "N/A"}
                          </div>
                          {!!it.llm.topics?.length && (
                            <div className="text-xs">
                              <b>Temas:</b> {it.llm.topics.join(", ")}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!analysis?.items?.length && !analysis?.aggregate && !analyzeError && (
                <div className="text-sm text-gray-500">
                  No se recibieron resultados del análisis.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};