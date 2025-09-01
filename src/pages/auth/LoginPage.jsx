import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { LogIn, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      toast({
        title: "Campos incompletos",
        description: "Por favor, ingresa tu correo y contraseña.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Simulación de inicio de sesión
    setTimeout(() => {
      if (email === "usuario@blackbox.com" && password === "password") {
        toast({
          title: "Inicio de sesión exitoso",
          description: "Bienvenido de nuevo.",
          className: "bg-brand-green text-white",
        });
        navigate('/user/dashboard'); 
      } else {
        toast({
          title: "Error de autenticación",
          description: "Correo o contraseña incorrectos.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <CardHeader className="text-center p-0 mb-6">
        <CardTitle className="text-3xl font-bold text-gray-800">Iniciar Sesión</CardTitle>
        <CardDescription className="text-muted-foreground">Accede a tu panel de BLACKBOX MONITOR.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Correo Electrónico</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              id="email" 
              type="email" 
              placeholder="tu@correo.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="pl-10 focus-visible:ring-brand-green"
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Contraseña</Label>
            <Link to="#" className="text-sm text-brand-green hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="pl-10 focus-visible:ring-brand-green"
            />
          </div>
        </div>
        <Button type="submit" className="w-full bg-brand-green hover:bg-brand-green/90 text-lg py-6" disabled={isLoading}>
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          ) : (
            <LogIn className="mr-2 h-5 w-5" />
          )}
          {isLoading ? "Ingresando..." : "Ingresar"}
        </Button>
      </form>
      <CardFooter className="mt-6 p-0">
        <p className="text-sm text-muted-foreground text-center w-full">
          ¿No tienes una cuenta?{' '}
          <Link to="/auth/register" className="font-semibold text-brand-green hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </CardFooter>
    </motion.div>
  );
};

export default LoginPage;