import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Users, CreditCard, BarChart3, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, description, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${color || 'text-brand-green'}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{value}</div>
        <p className="text-xs text-muted-foreground pt-1">{description}</p>
      </CardContent>
    </Card>
  </motion.div>
);

const AdminDashboardPage = () => {
  const stats = [
    { title: "Total Usuarios", value: "1,234", icon: Users, description: "+20.1% desde el último mes" },
    { title: "Suscripciones Activas", value: "876", icon: CreditCard, description: "+15% este mes" },
    { title: "Campañas en Curso", value: "56", icon: BarChart3, description: "10 nuevas esta semana" },
    { title: "Actividad Reciente", value: "302 eventos", icon: Activity, description: "En las últimas 24h", color: "text-blue-500" },
  ];

  return (
    <div className="space-y-6">
      <motion.h1 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold tracking-tight text-foreground"
      >
        Panel de Administración
      </motion.h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Resumen de Actividad</CardTitle>
              <CardDescription>Gráfico de actividad del sistema (placeholder).</CardDescription>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center bg-muted/30 rounded-b-lg relative">
              <p className="text-muted-foreground z-10">Aquí iría un gráfico de actividad.</p>
              {/* Removed the img tag that was causing visual noise */}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Notificaciones Recientes</CardTitle>
              <CardDescription>Alertas importantes del sistema (placeholder).</CardDescription>
            </CardHeader>
            <CardContent className="h-64 space-y-3 overflow-y-auto">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-3 bg-muted/50 rounded-md text-sm">
                  <p className="font-medium text-foreground">Notificación Importante {i+1}</p>
                  <p className="text-xs text-muted-foreground">Descripción de la notificación...</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;