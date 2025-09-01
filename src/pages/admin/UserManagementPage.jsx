import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, MoreHorizontal, Search, UserX, Edit3, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

const initialUsers = [
  { id: 'USR001', name: 'Alice Wonderland', email: 'alice@example.com', role: 'Admin', status: 'Active', lastActivity: '2025-05-21 10:00 AM', plan: 'Empresarial' },
  { id: 'USR002', name: 'Bob The Builder', email: 'bob@example.com', role: 'Analista', status: 'Active', lastActivity: '2025-05-22 08:30 AM', plan: 'Profesional' },
  { id: 'USR003', name: 'Charlie Brown', email: 'charlie@example.com', role: 'Cliente', status: 'Inactive', lastActivity: '2025-05-15 03:00 PM', plan: 'Básico' },
  { id: 'USR004', name: 'Diana Prince', email: 'diana@example.com', role: 'Analista', status: 'Active', lastActivity: '2025-05-22 11:15 AM', plan: 'Profesional' },
  { id: 'USR005', name: 'Edward Scissorhands', email: 'edward@example.com', role: 'Cliente', status: 'Pending', lastActivity: '2025-05-20 01:00 PM', plan: 'Básico' },
];

const UserForm = ({ onSubmit, existingUser, onCancel }) => {
  const [name, setName] = useState(existingUser?.name || '');
  const [email, setEmail] = useState(existingUser?.email || '');
  const [role, setRole] = useState(existingUser?.role || 'Cliente');
  const [plan, setPlan] = useState(existingUser?.plan || 'Básico');
  const [status, setStatus] = useState(existingUser?.status || 'Active');
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email) {
      toast({ title: "Error", description: "Nombre y correo son requeridos.", variant: "destructive" });
      return;
    }
    onSubmit({ id: existingUser?.id, name, email, role, plan, status });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name-form">Nombre Completo</Label>
        <Input id="name-form" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Juan Pérez" className="mt-1"/>
      </div>
      <div>
        <Label htmlFor="email-form">Correo Electrónico</Label>
        <Input id="email-form" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ej. juan.perez@example.com" className="mt-1"/>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="role-form">Rol</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger id="role-form" className="mt-1"><SelectValue placeholder="Seleccionar rol" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Analista">Analista</SelectItem>
              <SelectItem value="Cliente">Cliente</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="plan-form">Plan</Label>
          <Select value={plan} onValueChange={setPlan}>
            <SelectTrigger id="plan-form" className="mt-1"><SelectValue placeholder="Seleccionar plan" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Básico">Básico</SelectItem>
              <SelectItem value="Profesional">Profesional</SelectItem>
              <SelectItem value="Empresarial">Empresarial</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {existingUser && (
        <div>
          <Label htmlFor="status-form">Estado</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="status-form" className="mt-1"><SelectValue placeholder="Seleccionar estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Activo</SelectItem>
              <SelectItem value="Inactive">Inactivo</SelectItem>
              <SelectItem value="Pending">Pendiente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" className="bg-brand-green hover:bg-brand-green/90 text-primary-foreground">
          {existingUser ? 'Guardar Cambios' : 'Crear Usuario'}
        </Button>
      </DialogFooter>
    </form>
  );
};

const UserTable = ({ users, onEdit, onToggleStatus }) => (
  <div className="rounded-md border overflow-x-auto">
    <Table>
      <TableHeader className="bg-muted/50">
        <TableRow>
          <TableHead className="w-[150px]">Nombre</TableHead>
          <TableHead>Correo</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Última Actividad</TableHead>
          <TableHead className="text-right w-[50px]">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <AnimatePresence>
          {users.length > 0 ? users.map((user) => (
            <motion.tr 
              key={user.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="hover:bg-muted/20 transition-colors"
            >
              <TableCell className="font-medium text-foreground">{user.name}</TableCell>
              <TableCell className="text-muted-foreground">{user.email}</TableCell>
              <TableCell><span className={`px-2 py-0.5 text-xs rounded-full ${user.role === 'Admin' ? 'bg-red-100 text-red-700' : user.role === 'Analista' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{user.role}</span></TableCell>
              <TableCell className="text-muted-foreground">{user.plan}</TableCell>
              <TableCell>
                <span className={`px-2 py-0.5 text-xs rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-700' : user.status === 'Inactive' ? 'bg-gray-100 text-gray-700' : 'bg-orange-100 text-orange-700'}`}>
                  {user.status}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">{user.lastActivity}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menú</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onEdit(user)}>
                      <Edit3 className="mr-2 h-4 w-4" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { /* View details logic */ }}>
                      <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onToggleStatus(user.id)} className={user.status === 'Active' ? 'text-orange-600 focus:text-orange-600' : 'text-green-600 focus:text-green-600'}>
                      <UserX className="mr-2 h-4 w-4" /> {user.status === 'Active' ? 'Desactivar' : 'Activar'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </motion.tr>
          )) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                No se encontraron usuarios.
              </TableCell>
            </TableRow>
          )}
        </AnimatePresence>
      </TableBody>
    </Table>
  </div>
);


const UserManagementPage = () => {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { toast } = useToast();

  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterRole === 'all' || user.role === filterRole) &&
      (filterStatus === 'all' || user.status === filterStatus)
    );
  }, [users, searchTerm, filterRole, filterStatus]);

  const handleCreateUser = (newUser) => {
    setUsers(prev => [{ ...newUser, id: `USR${String(prev.length + 1).padStart(3, '0')}`, lastActivity: new Date().toLocaleString() }, ...prev]);
    toast({ title: "Usuario creado", description: `El usuario ${newUser.name} ha sido creado exitosamente.`, className: "bg-brand-green text-white" });
    setIsCreateUserDialogOpen(false);
  };
  
  const handleEditUser = (updatedUser) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser, lastActivity: new Date().toLocaleString() } : u));
    toast({ title: "Usuario actualizado", description: `El usuario ${updatedUser.name} ha sido actualizado.`, className: "bg-brand-green text-white" });
    setIsEditUserDialogOpen(false);
    setCurrentUser(null);
  };

  const openEditDialog = (user) => {
    setCurrentUser(user);
    setIsEditUserDialogOpen(true);
  };
  
  const toggleUserStatus = (userId) => {
    const user = users.find(u => u.id === userId);
    setUsers(prevUsers =>
      prevUsers.map(u =>
        u.id === userId
          ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active', lastActivity: new Date().toLocaleString() }
          : u
      )
    );
    toast({ title: "Estado actualizado", description: `Estado del usuario ${user.name} cambiado a ${user.status === 'Active' ? 'Inactivo' : 'Activo'}.`, className: "bg-brand-green text-white" });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="border-b bg-muted/20 p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Gestión de Usuarios</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">Administra los usuarios de la plataforma.</CardDescription>
            </div>
            <Button onClick={() => setIsCreateUserDialogOpen(true)} className="bg-brand-green hover:bg-brand-green/90 text-primary-foreground w-full md:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Crear Usuario
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-2 md:gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nombre o correo..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="grid grid-cols-2 md:flex md:flex-row gap-2 md:gap-4">
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-full md:w-[150px]"><SelectValue placeholder="Filtrar por rol" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Roles</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Analista">Analista</SelectItem>
                  <SelectItem value="Cliente">Cliente</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-[150px]"><SelectValue placeholder="Filtrar por estado" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Estados</SelectItem>
                  <SelectItem value="Active">Activo</SelectItem>
                  <SelectItem value="Inactive">Inactivo</SelectItem>
                  <SelectItem value="Pending">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

         <UserTable users={filteredUsers} onEdit={openEditDialog} onToggleStatus={toggleUserStatus} />

          {filteredUsers.length > 0 && (
            <p className="text-sm text-muted-foreground pt-2">
              Mostrando {filteredUsers.length} de {users.length} usuarios.
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
        <DialogContent className="sm:max-w-[425px] md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Crear Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Completa la información para agregar un nuevo usuario al sistema.
            </DialogDescription>
          </DialogHeader>
          <UserForm onSubmit={handleCreateUser} onCancel={() => setIsCreateUserDialogOpen(false)} />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent className="sm:max-w-[425px] md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Editar Usuario</DialogTitle>
            <DialogDescription>
              Actualiza la información del usuario seleccionado.
            </DialogDescription>
          </DialogHeader>
          {currentUser && <UserForm existingUser={currentUser} onSubmit={handleEditUser} onCancel={() => {setIsEditUserDialogOpen(false); setCurrentUser(null);}} />}
        </DialogContent>
      </Dialog>

    </motion.div>
  );
};

export default UserManagementPage;