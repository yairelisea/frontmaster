// src/pages/user/UserCampaignsPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { CampaignTable } from '@/components/user/campaigns/CampaignTable';
import { Link, useLocation } from 'react-router-dom';
import { fetchCampaigns, analyzeCampaign } from '@/lib/api';
import * as report from '@/lib/report';

const UserCampaignsPage = () => {
  const { toast } = useToast();
  const location = useLocation();

  // Estado de campañas
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Estado para análisis IA
  const [analyzingId, setAnalyzingId] = useState(null);
  const [analysisError, setAnalysisError] = useState(location.state?.analysisError || null);
  const [analysisData, setAnalysisData] = useState(location.state?.analysisData || null); // normalizado: { summary, sentiment_label, sentiment_score, topics, items, raw }
  const [analysisCampaign, setAnalysisCampaign] = useState(location.state?.showAnalysisFor || null);

  useEffect(() => {
    if (location.state) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Cargar campañas reales desde el backend
  async function loadCampaigns() {
    try {
      setLoading(true);
      const list = await fetchCampaigns();
      setCampaigns(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('fetchCampaigns error:', err);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las campañas.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCampaigns();
  }, []);

  // Helpers de presentación para sentimiento y recortes
  const toPercent0to100 = (score, pct) => {
    if (typeof pct === 'number') return Math.round(pct);
    if (typeof score === 'number') return Math.round(((score + 1) / 2) * 100); // -1..1 -> 0..100
    return null;
  };
  const clip = (str, n = 220) => {
    if (!str || typeof str !== 'string') return '';
    return str.length > n ? str.slice(0, n - 1) + '…' : str;
  };

  // Búsqueda local
  const filteredCampaigns = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return campaigns;
    return campaigns.filter(c =>
      (c.name || '').toLowerCase().includes(q) ||
      (c.query || '').toLowerCase().includes(q)
    );
  }, [campaigns, searchTerm]);

  // Lanzar análisis IA de una campaña
  async function handleAnalyze(campaign) {
    setAnalyzingId(campaign.id);
    setAnalysisError(null);
    setAnalysisData(null);
    setAnalysisCampaign(campaign);

    try {
      const res = await analyzeCampaign(campaign);
      setAnalysisData(res);
      toast({
        title: 'Análisis completado',
        description: `Se analizó "${campaign.name}"`,
        className: 'bg-brand-green text-white',
      });
    } catch (err) {
      console.error('analyzeCampaign error:', err);
      setAnalysisError(err?.message || 'No se pudo completar el análisis.');
      toast({
        title: 'Error de análisis',
        description: err?.message || 'No se pudo completar el análisis.',
        variant: 'destructive',
      });
    } finally {
      setAnalyzingId(null);
    }
  }

  async function handleExportPDF() {
    try {
      if (!analysisCampaign || !analysisData) return;
      const fn =
        report.downloadAnalysisPDF ||
        report.generateAnalysisPDF ||
        report.generatePDF; // fallback if you exported a generic name
      if (typeof fn !== 'function') {
        throw new Error('No PDF generator export found in lib/report.js');
      }
      await fn({
        campaign: analysisCampaign,
        analysis: analysisData,
      });
    } catch (e) {
      console.error('PDF export error:', e);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Encabezado + buscador */}
      <Card className="shadow-xl overflow-hidden border-t-4 border-brand-green">
        <CardHeader className="bg-gray-50 p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Mis Campañas</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Gestiona y analiza tus campañas de monitoreo.
              </CardDescription>
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
              placeholder="Buscar por nombre o consulta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-2/3 lg:w-1/2 focus-visible:ring-brand-green"
            />
          </div>

          {/* Tabla de campañas */}
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Cargando campañas…</div>
          ) : (
            <CampaignTable
              campaigns={filteredCampaigns}
              allCampaignsCount={campaigns.length}
              onAnalyze={handleAnalyze}
              analyzingId={analyzingId}
              // Puedes pasar onEdit / onDelete cuando estén listos
            />
          )}
        </CardContent>
      </Card>

      {/* Panel de resultados de IA */}
      {(analysisCampaign || analysisData || analysisError) && (
        <Card className="border shadow-md">
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <CardTitle className="text-xl">
                Resultados IA {analysisCampaign ? `– ${analysisCampaign.name}` : ''}
              </CardTitle>
              <CardDescription>
                Resumen, sentimiento, tópicos y notas analizadas (vista rápida).
              </CardDescription>
            </div>
            {analysisData ? (
              <Button
                onClick={handleExportPDF}
                className="bg-brand-green hover:bg-brand-green/90 text-primary-foreground"
              >
                Exportar PDF
              </Button>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-4">
            {!analysisData && !analysisError && (
              <div className="text-sm text-muted-foreground">Ejecuta “Analizar IA” en una campaña para ver resultados aquí.</div>
            )}

            {analysisError && (
              <div className="text-red-600 text-sm">{analysisError}</div>
            )}

            {analysisData && (
              <>
                {/* Resumen y sentimiento */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="text-xs text-muted-foreground mb-1">Sentimiento</div>
                    <div className="text-lg font-semibold">
                      {analysisData.sentiment_label ?? 'N/A'}
                    </div>
                    {(() => {
                      const pct = toPercent0to100(analysisData.sentiment_score, analysisData.sentiment_score_pct);
                      return typeof pct === 'number' ? (
                        <div className="text-xs text-muted-foreground">Sentimiento: {pct}%</div>
                      ) : null;
                    })()}
                  </div>
                  <div className="p-4 rounded-lg border bg-card md:col-span-2">
                    <div className="text-xs text-muted-foreground mb-1">Resumen</div>
                    <div className="text-sm leading-relaxed">
                      {analysisData.summary || 'Sin resumen.'}
                    </div>
                  </div>
                </div>

                {/* Tópicos */}
                {Array.isArray(analysisData.topics) && analysisData.topics.length > 0 && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Tópicos</div>
                    <div className="flex flex-wrap gap-2">
                      {analysisData.topics.map((t, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lista de artículos / items */}
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Artículos analizados</div>
                  {Array.isArray(analysisData.items) && analysisData.items.length > 0 ? (
                    <ul className="space-y-2">
                      {analysisData.items.slice(0, 25).map((it, idx) => (
                        <li key={idx} className="p-3 rounded border">
                          <div className="font-medium">
                            {it.title || it.headline || `Nota ${idx + 1}`}
                          </div>
                          {(() => {
                            const lbl = it.llm?.sentiment_label;
                            const pct = toPercent0to100(it.llm?.sentiment_score, it.llm?.sentiment_score_pct);
                            if (!lbl && typeof pct !== 'number') return null;
                            return (
                              <div className="text-xs text-muted-foreground">
                                {lbl ? `Sentimiento: ${lbl}` : ''}
                                {typeof pct === 'number' ? (lbl ? ` · ${pct}%` : `${pct}%`) : ''}
                              </div>
                            );
                          })()}
                          {it.source && (
                            <div className="text-xs text-muted-foreground">
                              {it.source}
                            </div>
                          )}
                          {it.url && (
                            <a
                              href={it.url}
                              className="text-xs text-brand-green underline"
                              target="_blank" rel="noreferrer"
                            >
                              Abrir
                            </a>
                          )}
                          {(() => {
                            const short = it.llm?.summary || it.summary;
                            return short ? (
                              <div className="text-sm mt-1 text-muted-foreground">{clip(short)}</div>
                            ) : null;
                          })()}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-muted-foreground">No se encontraron artículos.</div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default UserCampaignsPage;