import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  LayoutDashboard, BarChart3, MessageSquare, PieChart, Link as LinkIcon, CreditCard, Users, FileText, PlusCircle, Settings, Menu, X as LucideX, MonitorPlay, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const UserSidebarNavLink = ({ to, icon: Icon, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      cn(
        'flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out group',
        isActive
          ? 'bg-brand-green text-primary-foreground shadow-lg'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      )
    }
  >
    <Icon className={cn(
      'mr-3 h-5 w-5 transition-colors duration-150 ease-in-out',
      'text-gray-500 group-hover:text-brand-green'
      )} />
    {children}
  </NavLink>
);

const UserSidebarContent = ({ isOpen, toggleSidebar }) => {
  const navItems = [
    { to: '/user/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/user/campaigns', icon: BarChart3, label: 'Mis Campañas' },
    { to: '/user/posts', icon: MessageSquare, label: 'Posts y Menciones' },
    { to: '/user/analytics', icon: PieChart, label: 'Resumen IA' },
    { to: '/user/compare', icon: Users, label: 'Comparar Perfiles' },
    { to: '/user/connect', icon: LinkIcon, label: 'Conectar Redes' },
    { to: '/user/plans', icon: CreditCard, label: 'Mi Plan' },
  ];

  return (
    <div className="flex flex-col h-full bg-card text-card-foreground p-4 space-y-2 border-r border-border shadow-sm">
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <div className="flex items-center text-brand-green">
          <MonitorPlay className="h-8 w-8 mr-2 text-brand-green" />
          <h1 className="text-2xl font-bold text-gray-800">BLACKBOX</h1>
        </div>
        {toggleSidebar && (
          <Button variant="ghost" size="icon" className="lg:hidden text-gray-600 hover:text-gray-900" onClick={toggleSidebar}>
            <LucideX className="h-6 w-6" />
          </Button>
        )}
      </div>
      <nav className="flex-grow space-y-1.5">
        {navItems.map((item) => (
          <UserSidebarNavLink 
            key={item.to} 
            to={item.to} 
            icon={item.icon} 
            onClick={toggleSidebar ? toggleSidebar : undefined}
          >
            {item.label}
          </UserSidebarNavLink>
        ))}
      </nav>
      <div className="mt-auto pt-4 border-t border-border">
        <UserSidebarNavLink to="/user/settings" icon={Settings} onClick={toggleSidebar ? toggleSidebar : undefined}>
          Configuración
        </UserSidebarNavLink>
         <UserSidebarNavLink to="/auth/logout" icon={LogOut} onClick={toggleSidebar ? toggleSidebar : undefined}>
          Cerrar Sesión
        </UserSidebarNavLink>
        <p className="text-xs text-muted-foreground text-center pt-4">&copy; {new Date().getFullYear()} BLACKBOX MONITOR</p>
      </div>
    </div>
  );
};

const UserLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen bg-background">
      {/* Static Sidebar for large screens */}
      <div className="hidden lg:block w-64">
        <UserSidebarContent isOpen={true} />
      </div>

      {/* Sheet-based Sidebar for small screens */}
      <div className="lg:hidden">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            {/* Button is in header */}
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 bg-card border-r-0 z-50">
             <UserSidebarContent isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
          </SheetContent>
        </Sheet>
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border p-3 sticky top-0 z-30">
          <div className="container mx-auto flex items-center justify-between">
            <Button variant="ghost" size="icon" className="lg:hidden text-foreground" onClick={toggleSidebar}>
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-x-4 ml-auto">
              <Button variant="outline" size="sm" className="border-brand-green text-brand-green hover:bg-brand-green hover:text-white">
                <FileText className="mr-2 h-4 w-4" /> Generar PDF
              </Button>
              <NavLink to="/user/campaigns/new">
                <Button size="sm" className="bg-brand-green hover:bg-brand-green/90 text-primary-foreground">
                  <PlusCircle className="mr-2 h-4 w-4" /> Agregar Campaña
                </Button>
              </NavLink>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde" alt="Usuario" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-foreground">Usuario Blackbox</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        usuario@blackbox.com
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configuración</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-6 lg:p-8">
          <div className="container mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.25 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserLayout;