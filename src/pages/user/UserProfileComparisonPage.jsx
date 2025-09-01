import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, PlusCircle, BarChartHorizontalBig, TrendingUp, MessageCircle, Users2, GitCompareArrows, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

const mockProfileData = {
  "Tu Perfil": { mentions: 12500, sentimentPositive: 65, sentimentNeutral: 25, sentimentNegative: 10, engagementRate: 5.2, audienceSize: 150000 },
  "Competidor A": { mentions: 9800, sentimentPositive: 55, sentimentNeutral: 30, sentimentNegative: 15, engagementRate: 4.1, audienceSize: 120000 },
  "Líder Industria X": { mentions: 25000, sentimentPositive: 75, sentimentNeutral: 15, sentimentNegative: 10, engagementRate: 6.8, audienceSize: 300000 },
  "Influencer Y": { mentions: 15000, sentimentPositive: 80, sentimentNeutral: 15, sentimentNegative: 5, engagementRate: 7.5, audienceSize: 200000 },
};

const MetricDisplay = ({ label, value, unit, icon: Icon, color = 'text-brand-green' }) => (
  <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg text-center">
    <Icon className={`h-7 w-7 mb-1.5 ${color}`} />
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-xl font-bold text-foreground">{value}{unit && <span className="text-sm font-normal">{unit}</span>}</p>
  </div>
);

const SentimentBreakdown = ({ positive, neutral, negative }) => (
  <div className="w-full">
    <p className="text-xs text-muted-foreground mb-1">Sentimiento (%):</p>
    <div className="flex w-full h-6 rounded-full overflow-hidden border border-border">
      <div className="bg-green-500 h-full" style={{ width: `${positive}%` }} title={`Positivo: ${positive}%`}></div>
      <div className="bg-yellow-400 h-full" style={{ width: `${neutral}%` }} title={`Neutral: ${neutral}%`}></div>
      <div className="bg-red-500 h-full" style={{ width: `${negative}%` }} title={`Negativo: ${negative}%`}></div>
    </div>
    <div className="flex justify-between text-xs mt-1">
      <span className="text-green-600">P: {positive}%</span>
      <span className="text-yellow-600">N: {neutral}%</span>
      <span className="text-red-600">Ng: {negative}%</span>
    </div>
  </div>
);

const UserProfileComparisonPage = () => {
  const [profilesToCompare, setProfilesToCompare] = useState(["Tu Perfil", "Competidor A"]);
  const [availableProfiles, setAvailableProfiles] = useState(Object.keys(mockProfileData));
  const [newProfileName, setNewProfileName] = useState('');
  const { toast } = useToast();

  const addProfileToCompare = (profileName) => {
    if (profileName && !profilesToCompare.includes(profileName) && profilesToCompare.length < 4) {
      setProfilesToCompare([...profilesToCompare, profileName]);
    } else if (profilesToCompare.length >= 4) {
        toast({ title: "Límite Alcanzado", description: "Puedes comparar hasta 4 perfiles a la vez.", variant: "destructive" });
    }
  };
  
  const removeProfileFromCompare = (profileName) => {
    if (profileName === "Tu Perfil") {
      toast({ title: "Acción no permitida", description: "No puedes eliminar 'Tu Perfil' de la comparación.", variant: "destructive" });
      return;
    }
    setProfilesToCompare(profilesToCompare.filter(p => p !== profileName));
  };

  const handleAddNewProfileToList = () => {
    if (newProfileName && !availableProfiles.includes(newProfileName)) {
      // In a real app, this might trigger fetching data for the new profile
      setAvailableProfiles([...availableProfiles, newProfileName]);
      // Add to comparison if slot available
      if(profilesToCompare.length < 4 && !profilesToCompare.includes(newProfileName)){
        setProfilesToCompare([...profilesToCompare, newProfileName]);
      }
      mockProfileData[newProfileName] = { // Add mock data for new profile
        mentions: Math.floor(Math.random() * 15000) + 5000,
        sentimentPositive: Math.floor(Math.random() * 30) + 50,
        sentimentNeutral: Math.floor(Math.random() * 20) + 10,
        sentimentNegative: Math.floor(Math.random() * 10) + 5,
        engagementRate: parseFloat((Math.random() * 3 + 3).toFixed(1)),
        audienceSize: Math.floor(Math.random() * 100000) + 80000,
      };
      toast({ title: "Perfil Agregado", description: `El perfil "${newProfileName}" está listo para ser comparado.`, className:"bg-brand-green text-white" });
      setNewProfileName('');
    } else if (availableProfiles.includes(newProfileName)){
        toast({ title: "Perfil ya existe", description: `El perfil "${newProfileName}" ya está en la lista.`, variant: "default" });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 md:space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center">
          <GitCompareArrows className="mr-3 h-7 w-7 text-brand-green" /> Comparación de Perfiles
        </motion.h1>
      </div>
      <CardDescription className="text-muted-foreground">
        Analiza y compara métricas clave entre tu perfil, competidores, líderes de industria o influencers.
        Selecciona hasta 4 perfiles para una visualización lado a lado.
      </CardDescription>

      <Card className="shadow-lg">
        <CardHeader className="border-b bg-gray-50">
          <CardTitle className="text-lg">Configurar Comparación</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <Label htmlFor="select-profile" className="text-sm font-medium">Añadir Perfil a la Comparación:</Label>
              <Select onValueChange={addProfileToCompare} disabled={profilesToCompare.length >= 4}>
                <SelectTrigger id="select-profile" className="mt-1 focus-visible:ring-brand-green">
                  <SelectValue placeholder="Seleccionar perfil existente..." />
                </SelectTrigger>
                <SelectContent>
                  {availableProfiles.filter(p => !profilesToCompare.includes(p)).map(profile => (
                    <SelectItem key={profile} value={profile}>{profile}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-grow">
                <Label htmlFor="new-profile-name" className="text-sm font-medium">O Añadir Nuevo Perfil a la Lista:</Label>
                <Input 
                  id="new-profile-name"
                  placeholder="Ej. @NuevoCompetidor, Página Z" 
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  className="mt-1 focus-visible:ring-brand-green"
                />
              </div>
              <Button onClick={handleAddNewProfileToList} className="bg-brand-green hover:bg-brand-green/90 text-white whitespace-nowrap">
                <PlusCircle className="h-4 w-4 mr-2" /> Añadir
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {profilesToCompare.length > 0 ? (
        <div className={`grid grid-cols-1 ${profilesToCompare.length > 1 ? 'md:grid-cols-2' : ''} ${profilesToCompare.length > 2 ? 'lg:grid-cols-3' : ''} ${profilesToCompare.length > 3 ? 'xl:grid-cols-4' : ''} gap-6`}>
          <AnimatePresence>
            {profilesToCompare.map((profileName, index) => {
              const data = mockProfileData[profileName] || { mentions: 0, sentimentPositive: 0, sentimentNeutral: 0, sentimentNegative: 0, engagementRate: 0, audienceSize: 0 }; // Fallback for new profiles not yet in mockData
              return (
                <motion.div
                  key={profileName}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="shadow-xl h-full flex flex-col border-t-4 border-brand-green">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl text-foreground">{profileName}</CardTitle>
                        {profileName !== "Tu Perfil" && (
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500 h-7 w-7" onClick={() => removeProfileFromCompare(profileName)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-grow">
                      <MetricDisplay label="Total Menciones" value={data.mentions.toLocaleString()} icon={MessageCircle} color="text-blue-500" />
                      <SentimentBreakdown positive={data.sentimentPositive} neutral={data.sentimentNeutral} negative={data.sentimentNegative} />
                      <MetricDisplay label="Tasa Engagement" value={data.engagementRate} unit="%" icon={TrendingUp} color="text-purple-500" />
                      <MetricDisplay label="Tamaño Audiencia" value={data.audienceSize.toLocaleString()} icon={Users2} color="text-orange-500" />
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <Card className="shadow-lg">
          <CardContent className="p-10 text-center">
            <GitCompareArrows className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl font-semibold text-foreground">Comienza tu Comparación</p>
            <p className="text-muted-foreground">Añade perfiles usando los controles de arriba para ver sus métricas lado a lado.</p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default UserProfileComparisonPage;