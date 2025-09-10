import { Outlet, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function AdminLayout() {
  const nav = useNavigate();
  useEffect(() => {
    const role =
      localStorage.getItem("role") ||
      (JSON.parse(localStorage.getItem("user") || "{}")?.role ?? "");
    if (String(role).toLowerCase() !== "admin") nav("/");
  }, [nav]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="font-semibold">Panel Admin</div>
          <nav className="flex gap-4 text-sm">
            <Link to="/admin/campaigns" className="hover:underline">Mis campañas</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6"><Outlet /></main>
    </div>
  );
}