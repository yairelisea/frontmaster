import React, { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { CampaignTable } from "@/components/user/campaigns/CampaignTable";
import { useNavigate, Link } from "react-router-dom";
import { fetchCampaigns } from "@/lib/api";

const UserCampaignsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const list = await fetchCampaigns(); // trae del backend
      setCampaigns(list);
      setFiltered(list);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "No se pudieron cargar las campañas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return setFiltered(campaigns);
    setFiltered(
      campaigns.filter((c) =>
        [c.name, c.query].some((v) => (v || "").toLowerCase().includes(term))
      )
    );
  }, [searchTerm, campaigns]);

  const handleOpenNewForm = () => navigate("/user/campaigns/new");

  // Los handlers de editar/estado/borrar por ahora son no-ops,
  // puedes conectarlos después a tus endpoints.
  const handleEdit = (c) => navigate(`/user/campaigns/edit/${c.id}`);
  const handleToggle = () =>
    toast({ title: "Próximamente", description: "Acción no implementada aún." });
  const handleDelete = () =>
    toast({ title: "Próximamente", description: "Acción no implementada aún." });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <Card className="shadow-xl overflow-hidden border-t-4 border-brand-green">
        <CardHeader className="bg-gray-50 p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold text-foreground">Mis Campañas</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Campañas reales desde tu backend.
              </CardDescription>
            </div>
            <Link to="/user/campaigns/new">
              <Button
                size="lg"
                className="bg-brand-green hover:bg-brand-green/90 text-primary-foreground w-full md:w-auto"
                onClick={handleOpenNewForm}
              >
                <PlusCircle className="mr-2 h-5 w-5" /> Crear Nueva Campaña
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-4 md:p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o personaje…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-2/3 lg:w-1/2 focus-visible:ring-brand-green"
            />
          </div>

          <CampaignTable
            campaigns={filtered}
            allCampaignsCount={campaigns.length}
            loading={loading}
            onEdit={handleEdit}
            onToggleStatus={handleToggle}
            onDelete={handleDelete}
            onOpenNewForm={handleOpenNewForm}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UserCampaignsPage;