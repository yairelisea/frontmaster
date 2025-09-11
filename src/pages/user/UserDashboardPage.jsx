// src/pages/user/UserDashboardPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { fetchCampaigns, } from "@/lib/api";
import {
  PlusCircle,
  BarChart3,
  Activity,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

function formatDate(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

const UserDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [filter, setFilter] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Carga inicial
  useEffect(() => {
    (async () => {
      try {
        const [ok, list] = await Promise.allSettled([ping(), fetchCampaigns()]);
        if (ok.status === "fulfilled") setHealth(ok.value);
        if (list.status === "fulfilled") {
          setCampaigns(Array.isArray(list.value) ? list.value : []);
        } else {
          toast({
            title: "No se pudieron cargar las campañas",
            description: list.reason?.message || "Intenta de nuevo en un momento.",
            variant: "destructive",
          });
        }
      } catch (e) {
        toast({
          title: "Error al cargar el tablero",
          description: e?.message || "Intenta de nuevo.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const list = await fetchCampaigns();
      setCampaigns(Array.isArray(list) ? list : []);
      toast({
        title: "Actualizado",
        description: "Datos del tablero actualizados.",
      });
    } catch (e) {
      toast({
        title: "No se pudieron actualizar las campañas",
        description: e?.message || "Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const filtered = useMemo(() => {
    const f = (filter || "").toLowerCase().trim();
    if (!f) return campaigns;
    return campaigns.filter(
      (c) =>
        c.name?.toLowerCase().includes(f) ||
        c.query?.toLowerCase().includes(f) ||
        c.country?.toLowerCase().includes(f)
    );
  }, [campaigns, filter]);

  const totalCampaigns = campaigns.length;
  const lastCreated =
    totalCampaigns > 0
      ? [...campaigns]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
      : null;

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Tablero</h1>
          <p className="text-muted-foreground">
            Resumen de tus campañas y salud del servicio.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onRefresh}
            variant="outline"
            className="gap-2"
            disabled={refreshing}
            title="Actualizar"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button
            className="bg-brand-green hover:bg-brand-green/90 gap-2"
            onClick={() => navigate("/user/campaigns/new")}
          >
            <PlusCircle className="h-4 w-4" />
            Nueva campaña
          </Button>
        </div>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de campañas</CardDescription>
            <CardTitle className="text-3xl">
              {loading ? <Skeleton className="h-8 w-20" /> : totalCampaigns}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Conteo total asociadas a tu cuenta.
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Última creada</CardDescription>
            <CardTitle className="text-xl">
              {loading ? (
                <Skeleton className="h-6 w-40" />
              ) : lastCreated ? (
                lastCreated.name
              ) : (
                "—"
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {loading ? (
              <Skeleton className="h-4 w-48" />
            ) : lastCreated ? (
              <>Creada el {formatDate(lastCreated.createdAt)}</>
            ) : (
              <>Aún no tienes campañas.</>
            )}
          </CardContent>
          {lastCreated && (
            <CardFooter>
              <Link
                to="/user/campaigns"
                className="text-brand-green inline-flex items-center gap-1 text-sm"
              >
                Ver campañas <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </CardFooter>
          )}
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Salud del backend</CardDescription>
            <CardTitle className="text-xl flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {loading ? "…" : health?.ok ? "OK" : "Sin datos"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {loading
              ? "Comprobando /health…"
              : health?.ok
              ? "El servicio respondió correctamente."
              : "No se pudo comprobar la salud del servicio."}
          </CardContent>
        </Card>
      </div>

      {/* Buscador y tabla de recientes */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Campañas recientes
            </CardTitle>
            <CardDescription>
              Las más nuevas primero. Filtra por nombre, query o país.
            </CardDescription>
          </div>
          <div className="w-full sm:w-64">
            <Input
              placeholder="Filtrar campañas…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="focus-visible:ring-brand-green"
            />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-[90%]" />
              <Skeleton className="h-8 w-[80%]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center">
              {campaigns.length === 0 ? (
                <>
                  No tienes campañas.{" "}
                  <button
                    onClick={() => navigate("/user/campaigns/new")}
                    className="text-brand-green underline"
                  >
                    Crea la primera
                  </button>
                  .
                </>
              ) : (
                <>No hay resultados que coincidan con el filtro.</>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Query</TableHead>
                  <TableHead>País</TableHead>
                  <TableHead>Idioma</TableHead>
                  <TableHead>Resultados</TableHead>
                  <TableHead>Días</TableHead>
                  <TableHead>Creada</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered
                  .slice(0, 8)
                  .map((c) => (
                    <TableRow key={c.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-muted-foreground">{c.query}</TableCell>
                      <TableCell className="text-muted-foreground">{c.country || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{c.lang || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{c.size ?? 25}</TableCell>
                      <TableCell className="text-muted-foreground">{c.days_back ?? 14}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(c.createdAt)}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Link to="/user/campaigns">
            <Button variant="outline" className="gap-2">
              Ver todas
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default UserDashboardPage;
