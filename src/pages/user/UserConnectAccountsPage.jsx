import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Facebook, Twitter, Instagram, Youtube, Linkedin, Globe, CheckCircle, AlertTriangle, Link as LinkIcon, Link2Off } from 'lucide-react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';


const socialPlatforms = [
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600',bgColor: 'bg-blue-50 hover:bg-blue-100', connectUrl: '#' },
  { id: 'twitter', name: 'X (Twitter)', icon: Twitter, color: 'text-sky-500', bgColor: 'bg-sky-50 hover:bg-sky-100', connectUrl: '#' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-500', bgColor: 'bg-pink-50 hover:bg-pink-100', connectUrl: '#' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-600', bgColor: 'bg-red-50 hover:bg-red-100', connectUrl: '#' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700', bgColor: 'bg-blue-50 hover:bg-blue-100', connectUrl: '#' },
  { id: 'website', name: 'Sitio Web / Blog', icon: Globe, color: 'text-purple-500', bgColor: 'bg-purple-50 hover:bg-purple-100', connectUrl: '#' },
];

const UserConnectAccountsPage = () => {
  const [connectedAccounts, setConnectedAccounts] = useState({
    facebook: { connected: true, userHandle: 'MiPaginaFB', lastSync: 'Hoy 10:30 AM' },
    twitter: { connected: false, userHandle: null, lastSync: null },
    instagram: { connected: true, userHandle: '@miInsta', lastSync: 'Ayer 15:00 PM', error: 'Requiere re-autenticación' },
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlatformToDisconnect, setSelectedPlatformToDisconnect] = useState(null);
  const { toast } = useToast();

  const handleConnect = (platformId) => {
    // Simulate connection process
    toast({ title: `Conectando con ${socialPlatforms.find(p => p.id === platformId)?.name}...`, description: "Serás redirigido para autenticar.", className: "bg-brand-green text-white" });
    setTimeout(() => {
      setConnectedAccounts(prev => ({
        ...prev,
        [platformId]: { connected: true, userHandle: `@usuario${platformId}`, lastSync: 'Ahora mismo' }
      }));
      toast({ title: "¡Conexión Exitosa!", description: `${socialPlatforms.find(p => p.id === platformId)?.name} ha sido conectado.`, className: "bg-brand-green text-white" });
    }, 2000);
  };

  const openDisconnectDialog = (platform) => {
    setSelectedPlatformToDisconnect(platform);
    setDialogOpen(true);
  };

  const confirmDisconnect = () => {
    if (selectedPlatformToDisconnect) {
      setConnectedAccounts(prev => ({
        ...prev,
        [selectedPlatformToDisconnect.id]: { connected: false, userHandle: null, lastSync: null }
      }));
      toast({ title: "Cuenta Desconectada", description: `${selectedPlatformToDisconnect.name} ha sido desconectada.`, variant: "destructive" });
      setSelectedPlatformToDisconnect(null);
    }
    setDialogOpen(false);
  };


  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 md:space-y-8"
    >
      <div className="flex items-center justify-between">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center">
          <LinkIcon className="mr-3 h-7 w-7 text-brand-green" /> Conectar Redes Sociales
        </motion.h1>
      </div>
      <CardDescription className="text-muted-foreground">
        Conecta tus cuentas de redes sociales y sitios web para permitir que BLACKBOX MONITOR analice directamente tus publicaciones y el engagement de tus canales oficiales. Esto mejora la precisión del análisis de tu propia voz y audiencia.
      </CardDescription>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {socialPlatforms.map((platform, index) => {
          const accountStatus = connectedAccounts[platform.id];
          const Icon = platform.icon;
          return (
            <motion.div
              key={platform.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className={`shadow-lg hover:shadow-xl transition-shadow duration-300 ${accountStatus?.connected ? 'border-l-4 border-brand-green' : 'border-l-4 border-gray-300'}`}>
                <CardHeader className="flex flex-row items-center justify-between space-x-4 pb-3">
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-10 w-10 ${platform.color}`} />
                    <CardTitle className="text-lg text-foreground">{platform.name}</CardTitle>
                  </div>
                  {accountStatus?.connected && !accountStatus?.error && <CheckCircle className="h-6 w-6 text-green-500" />}
                  {accountStatus?.error && <AlertTriangle className="h-6 w-6 text-yellow-500" />}
                </CardHeader>
                <CardContent className="space-y-3">
                  {accountStatus?.connected ? (
                    <>
                      <p className="text-sm text-foreground font-medium">Conectado como: <span className="text-brand-green">{accountStatus.userHandle}</span></p>
                      {accountStatus.lastSync && <p className="text-xs text-muted-foreground">Última sinc.: {accountStatus.lastSync}</p>}
                      {accountStatus.error && <p className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded-md">{accountStatus.error}</p>}
                      <div className="flex gap-2 pt-1">
                        {accountStatus.error && 
                          <Button size="sm" variant="outline" className="flex-1 border-yellow-500 text-yellow-600 hover:bg-yellow-50" onClick={() => handleConnect(platform.id)}>
                            Reconectar
                          </Button>
                        }
                        <Button size="sm" variant="destructive" className="flex-1 bg-red-500 hover:bg-red-600 text-white" onClick={() => openDisconnectDialog(platform)}>
                          <Link2Off className="mr-2 h-4 w-4"/> Desconectar
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">Conecta esta plataforma para un análisis más completo.</p>
                      <Button size="sm" className={`w-full ${platform.bgColor} ${platform.color} hover:opacity-90`} onClick={() => handleConnect(platform.id)}>
                        <LinkIcon className="mr-2 h-4 w-4" /> Conectar {platform.name}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Desconexión</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres desconectar tu cuenta de {selectedPlatformToDisconnect?.name}? 
              Esto detendrá el análisis de tus publicaciones oficiales desde esta plataforma.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDisconnect}>Sí, Desconectar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="mt-8 shadow-lg">
        <CardHeader>
          <CardTitle>¿Por qué conectar tus cuentas?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-muted-foreground">
          <p><strong>Análisis Profundo de tu Audiencia:</strong> Entiende mejor quiénes interactúan con tu contenido oficial.</p>
          <p><strong>Comparación Precisa:</strong> Mide tu rendimiento directamente contra el de otros perfiles.</p>
          <p><strong>Optimización de Contenido:</strong> Descubre qué tipo de publicaciones generan mayor impacto en tus propios canales.</p>
          <p><strong>Alertas en Tiempo Real:</strong> Recibe notificaciones sobre cambios significativos en la interacción con tus perfiles.</p>
        </CardContent>
      </Card>

    </motion.div>
  );
};

export default UserConnectAccountsPage;