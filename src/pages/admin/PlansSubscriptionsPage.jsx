
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { CreditCard, CheckCircle, XCircle, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const plansData = [
  { 
    name: "Básico", 
    price: "$19/mes", 
    features: ["1 Campaña", "100 Menciones/mes", "Análisis Básico IA"],
    users: 150,
    active: true,
    color: "bg-sky-500"
  },
  { 
    name: "Profesional", 
    price: "$49/mes", 
    features: ["5 Campañas", "1000 Menciones/mes", "Análisis Avanzado IA", "Reportes PDF"],
    users: 320,
    active: true,
    color: "bg-indigo-500"
  },
  { 
    name: "Empresarial", 
    price: "$99/mes", 
    features: ["Campañas Ilimitadas", "Menciones Ilimitadas", "Análisis Premium IA", "Soporte Prioritario", "API Access"],
    users: 85,
    active: true,
    color: "bg-purple-500"
  },
  {
    name: "Legado Gratuito",
    price: "$0/mes",
    features: ["Funcionalidad limitada", "Solo para pruebas"],
    users: 12,
    active: false,
    color: "bg-gray-500"
  }
];

const PlanCard = ({ plan, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
  >
    <Card className={`shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 ${plan.active ? 'border-brand-green' : 'border-muted'}`}>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">{plan.name}</CardTitle>
            <CardDescription className="text-brand-green font-semibold">{plan.price}</CardDescription>
          </div>
          <span className={`px-3 py-1 text-xs rounded-full text-white ${plan.color}`}>
            {plan.users} usuarios
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-center">
              {plan.active ? <CheckCircle className="h-4 w-4 mr-2 text-brand-green flex-shrink-0" /> : <XCircle className="h-4 w-4 mr-2 text-destructive flex-shrink-0" />}
              {feature}
            </li>
          ))}
        </ul>
        <div className="pt-2 flex justify-between items-center">
          <Button variant="outline" size="sm" className="text-foreground border-foreground/50 hover:bg-secondary hover:text-primary-foreground">
            <Edit className="mr-2 h-3 w-3" /> Editar Plan
          </Button>
          {plan.active ? (
            <span className="text-xs text-green-600 font-medium flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" /> Activo
            </span>
          ) : (
             <span className="text-xs text-red-600 font-medium flex items-center">
              <XCircle className="h-4 w-4 mr-1" /> Inactivo
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);


const PlansSubscriptionsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold tracking-tight text-foreground"
        >
          Planes y Suscripciones
        </motion.h1>
        <Button className="bg-brand-green hover:bg-brand-green/90 text-primary-foreground">
          <CreditCard className="mr-2 h-4 w-4" /> Crear Nuevo Plan
        </Button>
      </div>
      <CardDescription>Gestiona los planes de suscripción disponibles en la plataforma.</CardDescription>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plansData.map((plan, index) => (
          <PlanCard key={plan.name} plan={plan} index={index} />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: plansData.length * 0.1 }}
      >
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Historial de Pagos y Facturación</CardTitle>
            <CardDescription>Resumen de transacciones recientes (placeholder).</CardDescription>
          </CardHeader>
          <CardContent className="h-48 flex items-center justify-center bg-muted/30 rounded-b-lg">
            <p className="text-muted-foreground">Aquí se mostrará una tabla o lista de facturas y pagos.</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PlansSubscriptionsPage;
  