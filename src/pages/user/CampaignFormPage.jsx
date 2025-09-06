/// src/pages/user/CampaignFormPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import { motion } from "framer-motion";
import { createCampaign, analyzeCampaign } from "@/lib/api";

// Calcula days_back a partir de fechas (1..60)
function daysDiffClamp(start, end) {
  try {
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 14;
    const ms = Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)));
    return Math.min(Math.max(ms, 1), 60);
  } catch {
    return 14;
  }
}

const CampaignFormPage = () => {
  const { campaignId } = useParams(); // reservado para futura edición
  const navigate = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [keywords, setKeywords] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (campaignId) {
      // futuro: precargar campaña para edición
    }
  }, [campaignId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (!name || !target) {
      toast({
        title: "Faltan datos",
        description: "Nombre de campaña y Personaje/Entidad son obligatorios.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // city_keywords desde el campo "keywords" (coma-separados)
    const city_keywords = keywords
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const days_back =
      startDate && endDate ? daysDiffClamp(startDate, endDate) : 14;

    // Payload que espera tu backend
    const payload = {
      name,                  // <- el nombre se envía tal cual lo escribes
      query: target,         // lo que buscará la IA/noticias
      size: 25,
      days_back,
      lang: "es-419",
      country: "MX",
      city_keywords: city_keywords.length ? city_keywords : null,
    };

    try {
      // 1) Crear campaña real en el backend
      const created = await createCampaign(payload);

      toast({
        title: "Campaña creada",
        description: `“${created.name}” creada correctamente. Ejecutando análisis IA…`,
        className: "bg-brand-green text-white",
      });

      // 2) Lanzar análisis IA de inmediato
      let analysis = null;
      try {
        analysis = await analyzeCampaign(created);
      } catch (err) {
        analysis = {
          _error: err?.message || "No se pudo completar el análisis.",
        };
      }

      // 3) Redirigir a /user/campaigns y llevar resultados para mostrarlos
      navigate("/user/campaigns", {
        replace: true,
        state: {
          showAnalysisFor: created,
          analysisData: analysis,
        },
      });
    } catch (err) {
      toast({
        title: "No se pudo crear la campaña",
        description: err?.message || "Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
                Crear Nueva Campaña
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Define los parámetros para tu nueva campaña de monitoreo.
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
              <Label htmlFor="campaignName" className="font-semibold">
                Nombre de la Campaña
              </Label>
              <Input
                id="campaignName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Monitoreo Elecciones 2025"
                className="mt-1 focus-visible:ring-brand-green"
                required
              />
            </div>

            <div>
              <Label htmlFor="campaignTarget" className="font-semibold">
                Personaje / Entidad a Monitorear
              </Label>
              <Input
                id="campaignTarget"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="Ej. Candidato X, Empresa Y"
                className="mt-1 focus-visible:ring-brand-green"
                required
              />
            </div>

            <div>
              <Label htmlFor="campaignKeywords" className="font-semibold">
                Palabras Clave (separadas por coma)
              </Label>
              <Input
                id="campaignKeywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Ej. municipio, cargo, zona"
                className="mt-1 focus-visible:ring-brand-green"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="startDate" className="font-semibold">
                  Fecha de Inicio (opcional)
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 focus-visible:ring-brand-green"
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="font-semibold">
                  Fecha de Fin (opcional)
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 focus-visible:ring-brand-green"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                className="bg-brand-green hover:bg-brand-green/90 text-primary-foreground px-8 py-3 text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Creando y Analizando…
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    Crear y Analizar IA
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CampaignFormPage;