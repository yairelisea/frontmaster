
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { History, Search, Download, CalendarDays, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';

const logsData = [
  { id: 'LOG001', timestamp: '2025-05-22 11:30:15', user: 'Alice Wonderland (USR001)', action: 'Creó nueva campaña "Producto X"', details: 'Campaña ID: CMP001', ipAddress: '192.168.1.10' },
  { id: 'LOG002', timestamp: '2025-05-22 11:05:00', user: 'admin@blackbox.com (ADM001)', action: 'Actualizó configuración general', details: 'Cambio de logo', ipAddress: '203.0.113.45' },
  { id: 'LOG003', timestamp: '2025-05-22 10:45:22', user: 'Bob The Builder (USR002)', action: 'Conectó cuenta de Twitter', details: 'Handle: @BobBuilds', ipAddress: '198.51.100.12' },
  { id: 'LOG004', timestamp: '2025-05-21 15:20:00', user: 'Alice Wonderland (USR001)', action: 'Inició sesión', details: 'Desde Chrome en Windows', ipAddress: '192.168.1.10' },
  { id: 'LOG005', timestamp: '2025-05-21 09:00:50', user: 'Charlie Brown (USR003)', action: 'Intento de acceso fallido', details: 'Contraseña incorrecta', ipAddress: '172.16.0.5' },
];


const LogsActivityPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUser, setFilterUser] = useState('all');
  
  const uniqueUsers = ['all', ...new Set(logsData.map(log => log.user))];

  const filteredLogs = logsData.filter(log =>
    (log.action.toLowerCase().includes(searchTerm.toLowerCase()) || log.details.toLowerCase().includes(searchTerm.toLowerCase()) || log.user.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterUser === 'all' || log.user === filterUser)
  );

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
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Logs y Actividad</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">Registro de actividad del sistema y usuarios.</CardDescription>
            </div>
            <Button className="bg-brand-green hover:bg-brand-green/90 text-primary-foreground w-full md:w-auto">
              <Download className="mr-2 h-4 w-4" /> Exportar Log
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-center">
            <div className="relative flex-grow w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar en logs..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger className="w-full md:w-[200px]">
                <UserCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filtrar por usuario" />
              </SelectTrigger>
              <SelectContent>
                {uniqueUsers.map(user => (
                  <SelectItem key={user} value={user}>{user === 'all' ? 'Todos los Usuarios' : user}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="w-full md:w-auto">
              <CalendarDays className="mr-2 h-4 w-4" /> Filtrar por Fecha
            </Button>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Detalles</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length > 0 ? filteredLogs.map((log, index) => (
                  <motion.tr 
                    key={log.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <TableCell className="font-medium text-foreground text-xs whitespace-nowrap">{log.timestamp}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{log.user}</TableCell>
                    <TableCell className="text-foreground text-sm">{log.action}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{log.details}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{log.ipAddress}</TableCell>
                  </motion.tr>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No se encontraron registros.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {filteredLogs.length > 0 && (
            <p className="text-sm text-muted-foreground pt-2">
              Mostrando {filteredLogs.length} de {logsData.length} registros.
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LogsActivityPage;
  