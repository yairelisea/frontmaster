import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Zap, Star, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge'; // Assuming you have a Badge component

// Placeholder for Badge component if not already created
const BadgeFallback = ({ className, variant, ...props }) => {
  const baseStyle = "px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  let variantStyle = "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80"; // default
  if (variant === "secondary") variantStyle = "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80";
  if (variant === "outline") variantStyle = "text-foreground";
  if (variant === "destructive") variantStyle = "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80";
  
  return <div className={`${baseStyle} ${variantStyle} ${className}`} {...props} />;
};


const plans = [
  {
    name: "Básico",
    priceMonthly: 19,
    priceYearly: 190, // 2 months free
    features: [
      "1 Campaña activa",
      "1,000 Menciones/mes",
      "Análisis de Sentimiento IA (Estándar)",
      "Actualizaciones diarias",
      "Soporte por Email"
    ],
    icon: Zap,
    color: "text-sky-500",
    popular: false,
    current: false,
  },
  {
    name: "Profesional",
    priceMonthly: 49,
    priceYearly: 490, // 2 months free
    features: [
      "5 Campañas activas",
      "10,000 Menciones/mes",
      "Análisis de Sentimiento IA (Avanzado)",
      "Resumen IA y Opinión IA Detallados",
      "Actualizaciones cada hora",
      "Reportes PDF personalizables",
      "Comparación de hasta 3 perfiles",
      "Soporte Prioritario por Email y Chat"
    ],
    icon: Star,
    color: "text-brand-green",
    popular: true,
    current: true, // Assuming this is the user's current plan for demo
  },
  {
    name: "Empresarial",
    priceMonthly: 99,
    priceYearly: 990, // 2 months free
    features: [
      "Campañas Ilimitadas",
      "Menciones Ilimitadas",
      "Análisis de Sentimiento IA (Premium con fine-tuning)",
      "Todos los reportes y analíticas avanzadas",
      "Actualizaciones en tiempo real (beta)",
      "Comparación de perfiles ilimitada",
      "Acceso API",
      "Manager de Cuenta Dedicado",
      "Soporte VIP 24/7"
    ],
    icon: ShieldCheck,
    color: "text-purple-500",
    popular: false,
    current: false,
  }
];

const UserPlansPage = () => {
  const [billingCycle, setBillingCycle] = React.useState('monthly'); // 'monthly' or 'yearly'

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 md:space-y-8"
    >
      <div className="text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold tracking-tight text-foreground"
        >
          Elige el Plan Perfecto para Ti
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          Escala tus capacidades de monitoreo y análisis con el plan que mejor se adapte a tus necesidades.
          ¡Ahorra con nuestros planes anuales!
        </motion.p>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="flex justify-center my-6"
      >
        <div className="inline-flex rounded-lg shadow-sm bg-muted p-1">
          <Button 
            variant={billingCycle === 'monthly' ? 'default': 'ghost'}
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-md ${billingCycle === 'monthly' ? 'bg-brand-green text-white' : 'text-muted-foreground'}`}
          >
            Mensual
          </Button>
          <Button 
            variant={billingCycle === 'yearly' ? 'default' : 'ghost'}
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-md relative ${billingCycle === 'yearly' ? 'bg-brand-green text-white' : 'text-muted-foreground'}`}
          >
            Anual
            <BadgeFallback variant="secondary" className="absolute -top-2 -right-3 bg-yellow-400 text-yellow-900 text-xs px-1.5 py-0.5 rounded-full transform scale-90">
              Ahorra 2 meses
            </BadgeFallback>
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
        {plans.map((plan, index) => {
          const PlanIcon = plan.icon;
          const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;
          const period = billingCycle === 'monthly' ? '/mes' : '/año';
          
          return (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 + 0.3 }}
              className={`flex flex-col rounded-xl shadow-2xl ${plan.popular ? 'border-2 border-brand-green ring-4 ring-brand-green/20' : 'border border-border'} bg-card overflow-hidden`}
            >
              {plan.popular && (
                <div className="py-1.5 px-4 bg-brand-green text-center text-sm font-semibold text-white">
                  Más Popular
                </div>
              )}
              <CardHeader className="text-center items-center pt-8">
                <div className={`p-3 rounded-full bg-gradient-to-br from-${plan.color.replace('text-','')}-400 to-${plan.color.replace('text-','')}-600 mb-3 inline-block`}>
                   <PlanIcon className={`h-8 w-8 text-white`} />
                </div>
                <CardTitle className={`text-2xl font-bold ${plan.color}`}>{plan.name}</CardTitle>
                <div className="my-2">
                  <span className="text-4xl font-extrabold text-foreground">${price}</span>
                  <span className="text-sm text-muted-foreground">{period}</span>
                </div>
                {plan.current && <Badge className="bg-gray-200 text-gray-700">Plan Actual</Badge>}
              </CardHeader>
              <CardContent className="flex-grow px-6 pb-6 space-y-3">
                <ul className="space-y-2.5">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="p-6 bg-muted/30 mt-auto">
                {plan.current ? (
                  <Button size="lg" className="w-full bg-gray-500 hover:bg-gray-600 text-white cursor-not-allowed" disabled>
                    Este es tu Plan Actual
                  </Button>
                ) : (
                  <Button size="lg" className={`w-full ${plan.popular ? 'bg-brand-green hover:bg-brand-green/90' : 'bg-gray-700 hover:bg-gray-800'} text-white`}>
                    {plan.priceMonthly > plans.find(p=>p.current)?.priceMonthly ? 'Actualizar Plan' : 'Cambiar Plan'} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-center pt-6"
      >
        <Card className="inline-block p-6 shadow-lg bg-card max-w-2xl mx-auto">
            <CardHeader className="p-0 pb-3">
                 <CardTitle className="text-xl flex items-center justify-center text-foreground">
                    <HelpCircle className="h-6 w-6 mr-2 text-brand-green" /> ¿Necesitas Ayuda para Elegir?
                 </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                 <p className="text-muted-foreground mb-3">
                    Nuestro equipo está listo para ayudarte a encontrar el plan que se ajuste perfectamente a tus objetivos.
                    Ofrecemos soluciones personalizadas para grandes empresas y necesidades específicas.
                 </p>
                 <Button variant="outline" className="border-brand-green text-brand-green hover:bg-brand-green hover:text-white">
                    Contactar con Ventas
                 </Button>
            </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default UserPlansPage;