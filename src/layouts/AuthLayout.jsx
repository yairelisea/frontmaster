// src/layouts/AuthLayout.jsx
import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

const AuthLayout = () => {
  const { isAuthenticated } = useAuth(); // <- tu contexto

  // Si ya hay sesión, salimos de /auth/* y vamos al dashboard
  if (isAuthenticated) {
    return <Navigate to="/user/dashboard" replace />;
  }

  const logoUrl =
    "https://storage.googleapis.com/hostinger-horizons-assets-prod/9ebf8f0b-cde8-498c-9fdd-b05fe177914b/a1d5c6f61f6fb2061a4a88537284d3ff.png";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 via-gray-50 to-slate-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center items-center mb-10">
          <img src={logoUrl} alt="BLACKBOX MONITOR Logo" className="h-16 object-contain" />
        </div>

        <div className="bg-card p-8 rounded-xl shadow-2xl border border-gray-200">
          <Outlet />
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} BLACKBOX MONITOR. Todos los derechos reservados.
        </p>
      </motion.div>
    </div>
  );
};

export default AuthLayout;