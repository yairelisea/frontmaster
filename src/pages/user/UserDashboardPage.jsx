import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, MessageSquare, PieChart, Users, Activity, PlusCircle, ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, description, trend, to, color = 'text-brand-green' }) => (
  <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-base font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className={`h-6 w-6 ${color}`} />
    </CardHeader>
    <CardContent className="flex-grow">
      <div className="text-3xl font-bold text-foreground">{value}</div>
      <div className="flex items-center text-xs text-muted-foreground pt-1">
        {trend === 'up' && <TrendingUp className="h-4 w-4 mr-1 text-green-500" />}
        {trend === 'down' && <TrendingDown className="h-4 w-4 mr-1 text-red-500" />}
        {trend === 'neutral' && <Minus className="h-4 w-4 mr-1 text-gray-500" />}
        {description}
      </div>
    </CardContent>
    {to && (
      <CardFooter className="pt-4 border-t mt-auto">
        <NavLink to={to} className="w-full">
          <Button variant="outline" className="w-full text-brand-green border-brand-green hover:bg-brand-green hover:text-white">
            Ver Detalles <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </NavLink>
      </CardFooter>
    )}
  </Card>
);

const SentimentIndicator = ({ sentiment, score }) => {
  let colorClass = "bg-gray-500";
  if (sentiment === "Positivo") colorClass = "bg-green-500";
  else if (sentiment === "Negativo") colorClass = "bg-red-500";
  else if (sentiment === "Neutral") colorClass = "bg-yellow-500";

  return (
    <div className="flex items-center">
      <span className={`h-3 w-3 rounded-full ${colorClass} mr-2`}></span>
      <span className="text-sm font-medium text-foreground">{sentiment}</span>
      <span className="text-xs text-muted-foreground ml-1">({score}%)</span>
    </div>
  );
};

const UserDashboardPage = () => {
  const mainStats = [
    { title: "Menciones Totales", value: "12,876", icon: MessageSquare, description: "+5.2% esta semana", trend: "up", to: "/user/posts" },
    { title: "Campañas Activas", value: "3", icon: BarChart3, description: "1 nueva campaña", trend: "neutral", to: "/user/campaigns" },
    { title: "Sentimiento General", value: "Positivo", icon: PieChart, description: "65% dominante", trend: "up", to: "/user/analytics", color: "text-green-500" },
    { title: "Perfiles Comparados", value: "2", icon: Users, description: "vs. Competidor A", trend: "neutral", to: "/user/compare" },
  ];

  const recentActivity = [
    { id: 1, text: "Nueva mención en X sobre 'Proyecto Alpha'", time: "Hace 5 min" },
    { id: 2, text: "Análisis de sentimiento completado para 'Campaña Verano'", time: "Hace 1 hora" },
    { id: 3, text: "Alerta: Pico de menciones negativas detectado", time: "Hace 3 horas", critical: true },
    { id: 4, text: "Conectaste tu cuenta de Facebook", time: "Ayer" },
  ];

  const campaignOverview = {
    name: "Lanzamiento Producto X",
    mentions: 3200,
    sentiment: { positive: 70, neutral: 20, negative: 10 }
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
          className="text-3xl md:text-4xl font-bold tracking-tight text-foreground"
        >
          Bienvenido a tu Dashboard
        </motion.h1>
        <NavLink to="/user/campaigns/new">
          <Button size="lg" className="bg-brand-green hover:bg-brand-green/90 text-primary-foreground w-full md:w-auto">
            <PlusCircle className="mr-2 h-5 w-5" /> Nueva Campaña
          </Button>
        </NavLink>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {mainStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="shadow-lg h-full">
            <CardHeader>
              <CardTitle className="text-xl">Resumen de Campaña Principal: <span className="text-brand-green">{campaignOverview.name}</span></CardTitle>
              <CardDescription>Total Menciones: {campaignOverview.mentions.toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Distribución de Sentimiento:</h4>
                <div className="space-y-2">
                  <SentimentIndicator sentiment="Positivo" score={campaignOverview.sentiment.positive} />
                  <SentimentIndicator sentiment="Neutral" score={campaignOverview.sentiment.neutral} />
                  <SentimentIndicator sentiment="Negativo" score={campaignOverview.sentiment.negative} />
                </div>
              </div>
              {/* Placeholder for a simple bar chart */}
              <div className="h-32 bg-muted rounded-md flex items-center justify-center">
                <p className="text-sm text-muted-foreground">[Gráfico de sentimiento aquí]</p>
              </div>
              <Button variant="link" className="text-brand-green p-0 hover:underline">
                Ver detalles de la campaña <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="shadow-lg h-full">
            <CardHeader>
              <CardTitle className="text-xl">Actividad Reciente</CardTitle>
              <CardDescription>Últimos eventos y alertas.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {recentActivity.map(activity => (
                  <li key={activity.id} className={`flex items-start space-x-3 p-2 rounded-md ${activity.critical ? 'bg-red-50 border border-red-200' : ''}`}>
                    <Activity className={`h-5 w-5 mt-0.5 flex-shrink-0 ${activity.critical ? 'text-red-500' : 'text-brand-green'}`} />
                    <div>
                      <p className={`text-sm font-medium ${activity.critical ? 'text-red-700' : 'text-foreground'}`}>{activity.text}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card className="shadow-lg bg-gradient-to-r from-brand-black to-gray-800 text-primary-foreground p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl text-white">¿Necesitas más poder?</CardTitle>
              <CardDescription className="text-gray-300 mt-1">Explora nuestros planes avanzados para desbloquear más campañas, análisis profundos y soporte prioritario.</CardDescription>
            </div>
            <NavLink to="/user/plans">
              <Button size="lg" variant="secondary" className="bg-white text-brand-green hover:bg-gray-100 w-full md:w-auto">
                Ver Planes <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </NavLink>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default UserDashboardPage;