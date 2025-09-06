// src/layouts/AuthLayout.jsx
import React, { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

const AuthLayout = () => {
  const logoUrl =
    "https://storage.googleapis.com/hostinger-horizons-assets-prod/9ebf8f0b-cde8-498c-9fdd-b05fe177914b/a1d5c6f61f6fb2061a4a88537284d3ff.png";

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Si el usuario ya está logueado y entra a /auth, lo mandamos a /user/dashboard
  useEffect(() => {
    if (isAuthenticated && location.pathname.startsWith("/auth")) {
      navigate("/user/dashboard", { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 via-gray-50 to-slate-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex justify-center items-center mb-10">
          <img
            src={logoUrl}
            alt="BLACKBOX MONITOR Logo"
            className="h-16 object-contain"
          />
        </div>

        {/* Contenedor del formulario */}
        <div className="bg-card p-8 rounded-xl shadow-2xl border border-gray-200">
          <Outlet />
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} BLACKBOX MONITOR. Todos los derechos
          reservados.
        </p>
      </motion.div>
    </div>
  );
};

export default AuthLayout;