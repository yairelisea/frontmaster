
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Settings, Palette, Cpu, BellDot, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

const GeneralSettingsPage = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    appName: 'BLACKBOX MONITOR',
    logoUrl: '',
    primaryColor: '#1ACC8D',
    secondaryColor: '#111111',
    scanDepth: 'Profundo',
    scanFrequency: 'Cada hora',
    adminEmail: 'admin@blackbox.com',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, logoUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Settings saved:", settings);
    toast({
      title: "Configuración Guardada",
      description: "Los cambios en la configuración general han sido guardados.",
      variant: "default",
      style: {backgroundColor: '#1ACC8D', color: 'white'}
    });
  };
  
  const Section = ({ title, icon: Icon, children, description }) => (
     <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
     >
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Icon className="h-6 w-6 text-brand-green" />
            <CardTitle className="text-xl">{title}</CardTitle>
          </div>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-4">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <motion.form 
      onSubmit={handleSubmit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold tracking-tight text-foreground"
        >
          Configuración General
        </motion.h1>
         <Settings className="h-8 w-8 text-brand-green" />
      </div>
      <CardDescription>Ajusta los parámetros globales del sistema BLACKBOX MONITOR.</CardDescription>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Section title="Branding y Apariencia" icon={Palette} description="Personaliza la identidad visual de la plataforma.">
            <div>
              <Label htmlFor="appName">Nombre de la Aplicación</Label>
              <Input id="appName" name="appName" value={settings.appName} onChange={handleInputChange} className="mt-1" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primaryColor">Color Primario (Hex)</Label>
                <Input id="primaryColor" name="primaryColor" value={settings.primaryColor} onChange={handleInputChange} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="secondaryColor">Color Secundario (Hex)</Label>
                <Input id="secondaryColor" name="secondaryColor" value={settings.secondaryColor} onChange={handleInputChange} className="mt-1" />
              </div>
            </div>
            <div>
              <Label htmlFor="logoUrl">Logo de la Aplicación (URL o Subir)</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input id="logoUrlInput" name="logoUrlPath" value={typeof settings.logoUrl === 'string' && !settings.logoUrl.startsWith('data:') ? settings.logoUrl : ''} onChange={(e) => setSettings(prev => ({...prev, logoUrl: e.target.value}))} placeholder="https://example.com/logo.png" className="flex-grow"/>
                <Label htmlFor="logoUpload" className="cursor-pointer">
                  <Button type="button" variant="outline" asChild><span className="whitespace-nowrap">Subir Archivo</span></Button>
                  <Input id="logoUpload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </Label>
              </div>
              {settings.logoUrl && settings.logoUrl.startsWith('data:') && (
                <div className="mt-2 p-2 border rounded-md bg-muted/50 inline-block">
                  <img  src={settings.logoUrl} alt="Logo Preview" className="h-16 max-w-xs object-contain" src="https://images.unsplash.com/photo-1649000808933-1f4aac7cad9a" />
                </div>
              )}
            </div>
          </Section>

          <Section title="Parámetros de Análisis IA" icon={Cpu} description="Configura cómo la IA escanea y analiza la información.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scanDepth">Profundidad de Escaneo</Label>
                <Input id="scanDepth" name="scanDepth" value={settings.scanDepth} onChange={handleInputChange} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="scanFrequency">Frecuencia de Escaneo</Label>
                <Input id="scanFrequency" name="scanFrequency" value={settings.scanFrequency} onChange={handleInputChange} className="mt-1" />
              </div>
            </div>
          </Section>
        </div>

        <div className="space-y-8">
          <Section title="Notificaciones" icon={BellDot} description="Ajustes para correos automáticos y alertas del sistema.">
            <div>
              <Label htmlFor="adminEmail">Correo del Administrador Principal</Label>
              <Input id="adminEmail" name="adminEmail" type="email" value={settings.adminEmail} onChange={handleInputChange} className="mt-1" />
              <p className="text-xs text-muted-foreground mt-1">Este correo recibirá alertas críticas del sistema.</p>
            </div>
          </Section>
          
          <Card className="shadow-md">
            <CardFooter className="p-6">
               <Button type="submit" className="w-full bg-brand-green hover:bg-brand-green/90 text-primary-foreground">
                <Save className="mr-2 h-4 w-4" /> Guardar Configuración
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </motion.form>
  );
};

export default GeneralSettingsPage;
  