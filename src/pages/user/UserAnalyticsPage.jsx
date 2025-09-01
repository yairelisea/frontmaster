import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PieChart, BarChart2, TrendingUp, Users, CalendarDays, Download } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data for charts - in a real app, this would come from an API and be processed by a chart library
const sentimentData = {
  labels: ['Positivo', 'Neutral', 'Negativo'],
  datasets: [{
    data: [65, 25, 10], // Percentages
    backgroundColor: ['#1ACC8D', '#FFC107', '#F44336'], // Green, Yellow, Red
    borderColor: ['#FFFFFF', '#FFFFFF', '#FFFFFF'],
    borderWidth: 2,
  }]
};

const mentionsOverTimeData = {
  labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
  datasets: [{
    label: 'Menciones esta semana',
    data: [120, 150, 100, 180, 220, 160, 130],
    borderColor: '#1ACC8D',
    backgroundColor: 'rgba(26, 204, 141, 0.1)',
    tension: 0.3,
    fill: true,
  }]
};

const topKeywordsData = [
  { keyword: '#BlackBoxMonitor', mentions: 550, sentiment: 'Positivo (70%)' },
  { keyword: 'Inteligencia Artificial', mentions: 480, sentiment: 'Neutral (60%)' },
  { keyword: 'Análisis de Medios', mentions: 320, sentiment: 'Positivo (80%)' },
  { keyword: 'Opinión Pública', mentions: 250, sentiment: 'Negativo (40%)' },
  { keyword: 'Nueva Tecnología', mentions: 180, sentiment: 'Positivo (65%)' },
];

const SimplePieChart = ({ data }) => (
  <div className="relative w-full max-w-xs mx-auto aspect-square">
    {/* This is a visual placeholder. A real chart library like Chart.js or Recharts would be used. */}
    <div className="absolute inset-0 rounded-full" style={{
      background: `conic-gradient(
        ${data.datasets[0].backgroundColor[0]} 0% ${data.datasets[0].data[0]}%,
        ${data.datasets[0].backgroundColor[1]} ${data.datasets[0].data[0]}% ${data.datasets[0].data[0] + data.datasets[0].data[1]}%,
        ${data.datasets[0].backgroundColor[2]} ${data.datasets[0].data[0] + data.datasets[0].data[1]}% 100%
      )`
    }}></div>
    <div className="absolute inset-1/4 rounded-full bg-card"></div>
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="text-2xl font-bold text-foreground">{data.datasets[0].data[0]}%</span>
    </div>
  </div>
);

const SimpleBarChart = ({ data }) => (
  <div className="w-full h-64 bg-muted/50 p-4 rounded-lg flex items-end justify-around space-x-2">
    {/* Placeholder for bar chart */}
    {data.datasets[0].data.map((value, index) => (
      <div key={index} className="flex-1 flex flex-col items-center justify-end">
        <div 
          className="w-3/4 rounded-t-sm" 
          style={{ height: `${(value / Math.max(...data.datasets[0].data)) * 90}%`, backgroundColor: data.datasets[0].borderColor }}
        ></div>
        <span className="text-xs mt-1 text-muted-foreground">{data.labels[index]}</span>
      </div>
    ))}
  </div>
);


const UserAnalyticsPage = () => {
  const [selectedCampaign, setSelectedCampaign] = React.useState('general');
  const [dateRange, setDateRange] = React.useState('last_7_days');

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
          <PieChart className="mr-3 h-7 w-7 text-brand-green" /> Resumen IA y Opinión
        </motion.h1>
        <div className="flex gap-2 md:gap-4">
          <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
            <SelectTrigger className="w-full md:w-[200px] focus-visible:ring-brand-green">
              <BarChart2 className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Seleccionar Campaña" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">Visión General</SelectItem>
              <SelectItem value="camp001">Lanzamiento Tesla Cybertruck</SelectItem>
              <SelectItem value="camp002">Impacto IA en el Empleo</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-full md:w-[180px] focus-visible:ring-brand-green">
              <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Rango de Fechas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_7_days">Últimos 7 días</SelectItem>
              <SelectItem value="last_30_days">Últimos 30 días</SelectItem>
              <SelectItem value="last_90_days">Últimos 90 días</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-brand-green text-brand-green hover:bg-brand-green hover:text-white">
            <Download className="mr-2 h-4 w-4" /> Exportar PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="shadow-lg h-full">
            <CardHeader>
              <CardTitle className="text-xl">Sentimiento General</CardTitle>
              <CardDescription>Distribución del sentimiento de las menciones.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <SimplePieChart data={sentimentData} />
              <div className="mt-4 flex justify-around w-full text-xs">
                {sentimentData.labels.map((label, index) => (
                  <div key={label} className="flex items-center">
                    <span className="h-2 w-2 rounded-full mr-1.5" style={{ backgroundColor: sentimentData.datasets[0].backgroundColor[index] }}></span>
                    {label}: {sentimentData.datasets[0].data[index]}%
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="shadow-lg h-full">
            <CardHeader>
              <CardTitle className="text-xl">Volumen de Menciones</CardTitle>
              <CardDescription>Tendencia de menciones a lo largo del tiempo.</CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleBarChart data={mentionsOverTimeData} />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Palabras Clave Destacadas</CardTitle>
            <CardDescription>Keywords más frecuentes y su sentimiento asociado.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {topKeywordsData.map((kw, index) => (
                <li key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors">
                  <span className="font-medium text-foreground">{kw.keyword}</span>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-muted-foreground">Menciones: {kw.mentions}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      kw.sentiment.includes('Positivo') ? 'bg-green-100 text-green-700' : 
                      kw.sentiment.includes('Negativo') ? 'bg-red-100 text-red-700' : 
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {kw.sentiment}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Métricas Adicionales (Placeholder)</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-muted/30 rounded-lg">
              <TrendingUp className="h-8 w-8 text-brand-green mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">25%</p>
              <p className="text-sm text-muted-foreground">Crecimiento de Menciones</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">1.2K</p>
              <p className="text-sm text-muted-foreground">Influencers Identificados</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <PieChart className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">75%</p>
              <p className="text-sm text-muted-foreground">Alcance Potencial</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default UserAnalyticsPage;