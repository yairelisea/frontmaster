// src/admin/AdminLayout.jsx
import { Outlet, Link, useNavigate } from "react-router-dom";

export default function AdminLayout() {
  const nav = useNavigate();
  const logout = () => { localStorage.removeItem("access_token"); nav("/"); };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link to="/admin/campaigns" className="font-semibold">Admin</Link>
          <nav className="text-sm flex gap-3">
            <Link to="/admin/campaigns" className="hover:underline">Campañas</Link>
          </nav>
          <div className="ml-auto">
            <button onClick={logout} className="text-sm px-3 py-1.5 rounded bg-gray-200">Salir</button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}