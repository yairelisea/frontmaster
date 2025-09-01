import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!fullName || !email || !password || !confirmPassword) {
      toast({
        title: "Campos incompletos",
        description: "Por favor, completa todos los campos.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Las contraseñas no coinciden",
        description: "Por favor, verifica tus contraseñas.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Simulación de registro
    setTimeout(() => {
      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada. Ahora puedes iniciar sesión.",
        className: "bg-brand-green text-white",
      });
      navigate('/auth/login'); 
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
        <CardTitle className="text-3xl font-bold text-gray-800">Crear Cuenta</CardTitle>
        <CardDescription className="text-muted-foreground">Únete a BLACKBOX MONITOR.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="fullName">Nombre Completo</Label>
          <div className="relative mt-1">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="fullName" type="text" placeholder="Tu nombre completo" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="pl-10 focus-visible:ring-brand-green"/>
          </div>
        </div>
        <div>
          <Label htmlFor="email-register">Correo Electrónico</Label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="email-register" type="email" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10 focus-visible:ring-brand-green"/>
          </div>
        </div>
        <div>
          <Label htmlFor="password-register">Contraseña</Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="password-register" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-10 focus-visible:ring-brand-green"/>
          </div>
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="pl-10 focus-visible:ring-brand-green"/>
          </div>
        </div>
        <Button type="submit" className="w-full bg-brand-green hover:bg-brand-green/90 text-lg py-6" disabled={isLoading}>
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          ) : (
            <UserPlus className="mr-2 h-5 w-5" />
          )}
          {isLoading ? "Registrando..." : "Crear Cuenta"}
        </Button>
      </form>
      <CardFooter className="mt-6 p-0">
        <p className="text-sm text-muted-foreground text-center w-full">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/auth/login" className="font-semibold text-brand-green hover:underline">
            Inicia sesión aquí
          </Link>
        </p>
      </CardFooter>
    </motion.div>
  );
};

export default RegisterPage;