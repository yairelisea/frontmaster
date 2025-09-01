import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  LayoutDashboard, Users, CreditCard, BarChart3, Share2, History, Settings, Menu, X as LucideX, MonitorPlay
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SidebarNavLink = ({ to, icon: Icon, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      cn(
        'flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out',
        isActive
          ? 'bg-brand-green text-primary-foreground shadow-md'
          : 'text-gray-300 hover:bg-secondary hover:text-primary-foreground'
      )
    }
  >
    <Icon className="mr-3 h-5 w-5" />
    {children}
  </NavLink>
);

const SidebarContent = ({ isOpen, toggleSidebar }) => {
  const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'Gestión de usuarios' },
    { to: '/admin/plans', icon: CreditCard, label: 'Planes y suscripciones' },
    { to: '/admin/campaigns', icon: BarChart3, label: 'Campañas activas' },
    { to: '/admin/social', icon: Share2, label: 'Conexiones sociales' },
    { to: '/admin/logs', icon: History, label: 'Logs y actividad' },
    { to: '/admin/settings', icon: Settings, label: 'Configuración general' },
  ];

  return (
    <div className="flex flex-col h-full bg-brand-black p-4 space-y-2">
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <div className="flex items-center text-brand-green">
          <MonitorPlay className="h-8 w-8 mr-2" />
          <h1 className="text-2xl font-bold text-white">BLACKBOX</h1>
        </div>
        {/* Close button for mobile sheet, only shown if toggleSidebar is provided */}
        {toggleSidebar && (
          <Button variant="ghost" size="icon" className="lg:hidden text-gray-300 hover:text-white" onClick={toggleSidebar}>
            <LucideX className="h-6 w-6" />
          </Button>
        )}
      </div>
      <nav className="flex-grow space-y-1.5">
        {navItems.map((item) => (
          <SidebarNavLink 
            key={item.to} 
            to={item.to} 
            icon={item.icon} 
            onClick={toggleSidebar ? toggleSidebar : undefined}
          >
            {item.label}
          </SidebarNavLink>
        ))}
      </nav>
      <div className="mt-auto pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center">&copy; {new Date().getFullYear()} BLACKBOX MONITOR</p>
      </div>
    </div>
  );
};


const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen bg-background">
      {/* Static Sidebar for large screens */}
      <div className="hidden lg:block w-64 shadow-xl z-20">
        <SidebarContent isOpen={true} />
      </div>

      {/* Sheet-based Sidebar for small screens */}
      <div className="lg:hidden">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            {/* This button is part of the header now */}
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 bg-brand-black border-r-0 z-50">
             <SidebarContent isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
          </SheetContent>
        </Sheet>
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border p-4 flex items-center justify-between lg:justify-end sticky top-0 z-30">
          {/* Hamburger menu button for mobile, triggers the Sheet */}
          <Button variant="ghost" size="icon" className="lg:hidden text-foreground" onClick={toggleSidebar}>
            <Menu className="h-6 w-6" />
          </Button>
          <div className="text-sm text-foreground">Admin Panel</div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;