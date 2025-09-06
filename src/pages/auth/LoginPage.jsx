// src/pages/auth/LoginPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { LogIn, Mail, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { login, setAuthToken, getAuthToken } from "@/lib/api";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Si te mandaron aquí desde una ruta protegida, volvemos ahí tras loguear:
  const redirectTo = (location.state && location.state.from) || null;

  // ---- GUARD: si ya hay token, redirige sin mostrar el formulario ----
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const isAdmin =
          storedUser?.is_admin === true ||
          storedUser?.role === "admin" ||
          storedUser?.isAdmin === true;

        const dest = redirectTo || (isAdmin ? "/admin/dashboard" : "/user/dashboard");
        navigate(dest, { replace: true });
      } catch {
        // si hubiera algo raro en localStorage, manda a user por defecto
        navigate(redirectTo || "/user/dashboard", { replace: true });
      } finally {
        setCheckingSession(false);
      }
    } else {
      setCheckingSession(false);
    }
  }, [navigate, redirectTo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (!email || !password) {
      toast({
        title: "Campos incompletos",
        description: "Por favor ingresa tu correo y contraseña.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Llama a /auth/login (usa VITE_API_URL)
      const data = await login({ email, password });

      // Refuerza guardado del token por si el backend usa otra clave
      const token = data?.access_token || data?.token || null;
      if (token) setAuthToken(token);

      // Guarda usuario (para saber si es admin)
      if (data?.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido${data?.user?.name ? `, ${data.user.name}` : ""}.`,
        className: "bg-brand-green text-white",
      });

      const isAdmin =
        data?.user?.is_admin === true ||
        data?.user?.role === "admin" ||
        data?.user?.isAdmin === true;

      if (redirectTo) {
        navigate(redirectTo, { replace: true });
      } else if (isAdmin) {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/user/dashboard", { replace: true });
      }
    } catch (err) {
      const msg =
        err?.message ||
        "No se pudo iniciar sesión. Verifica tus credenciales o intenta más tarde.";
      toast({
        title: "Error de autenticación",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Mientras verificamos si ya había sesión, no mostramos el form (evita parpadeo doble layout)
  if (checkingSession) {
    return (
      <div className="min-h-[40vh] grid place-content-center text-muted-foreground">
        Cargando…
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-md mx-auto w-full"
    >
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Iniciar Sesión</h1>
        <p className="text-muted-foreground">
          Accede a tu panel de BLACKBOX MONITOR.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
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
              autoComplete="email"
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
              autoComplete="current-password"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-brand-green hover:bg-brand-green/90 text-lg py-6"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
              Ingresando...
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-5 w-5" />
              Ingresar
            </>
          )}
        </Button>
      </form>

      <CardFooter className="mt-6 p-0">
        <p className="text-sm text-muted-foreground text-center w-full">
          ¿No tienes una cuenta?{" "}
          <Link
            to="/auth/register"
            className="font-semibold text-brand-green hover:underline"
          >
            Regístrate aquí
          </Link>
        </p>
      </CardFooter>
    </motion.div>
  );
};

export default LoginPage;