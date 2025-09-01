
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { BarChart3, PlusCircle, Search, Settings2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion } from 'framer-motion';

const campaignsData = [
  { id: 'CMP001', name: 'Lanzamiento Producto X', user: 'Alice Wonderland', status: 'Activa', mentions: 1205, startDate: '2025-05-01', endDate: '2025-06-01' },
  { id: 'CMP002', name: 'Elecciones Regionales Z', user: 'Bob The Builder', status: 'Pausada', mentions: 850, startDate: '2025-04-15', endDate: '2025-07-15' },
  { id: 'CMP003', name: 'Conferencia Anual Tech', user: 'Diana Prince', status: 'Finalizada', mentions: 2500, startDate: '2025-03-01', endDate: '2025-03-10' },
  { id: 'CMP004', name: 'Impacto Social ONG Y', user: 'Alice Wonderland', status: 'Activa', mentions: 560, startDate: '2025-05-20', endDate: '2025-08-20' },
];

const ActiveCampaignsPage = () => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredCampaigns = campaignsData.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="border-b bg-muted/20 p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Campañas Activas</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">Revisa, edita o elimina campañas creadas por usuarios.</CardDescription>
            </div>
            <Button className="bg-brand-green hover:bg-brand-green/90 text-primary-foreground w-full md:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Crear Campaña (Admin)
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nombre de campaña o usuario..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-1/2 lg:w-1/3"
            />
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Nombre Campaña</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Menciones</TableHead>
                  <TableHead>Fechas (Inicio - Fin)</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.length > 0 ? filteredCampaigns.map((campaign, index) => (
                  <motion.tr 
                    key={campaign.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <TableCell className="font-medium text-foreground">{campaign.name}</TableCell>
                    <TableCell className="text-muted-foreground">{campaign.user}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        campaign.status === 'Activa' ? 'bg-green-100 text-green-700' :
                        campaign.status === 'Pausada' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {campaign.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{campaign.mentions.toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{campaign.startDate} - {campaign.endDate}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-foreground hover:text-brand-green mr-1">
                        <Settings2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </motion.tr>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No se encontraron campañas.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
           {filteredCampaigns.length > 0 && (
            <p className="text-sm text-muted-foreground pt-2">
              Mostrando {filteredCampaigns.length} de {campaignsData.length} campañas.
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ActiveCampaignsPage;
  