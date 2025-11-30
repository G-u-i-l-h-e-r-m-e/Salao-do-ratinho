import { useState, useEffect } from 'react';
import { Search, Plus, Phone, Mail, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/PaginationControls';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useClients, Client } from '@/hooks/useClients';
import { useAppointments } from '@/hooks/useAppointments';
import { ClientDialog } from '@/components/ClientDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function Clientes() {
  const { clients, loading, createClient, updateClient, deleteClient } = useClients();
  const { appointments } = useAppointments();
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [hasAppointments, setHasAppointments] = useState(false);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination for clients
  const clientsPagination = usePagination(filteredClients, { itemsPerPage: 6 });

  const handleSave = async (data: Parameters<typeof createClient>[0]) => {
    if (editingClient) {
      return updateClient(editingClient._id, data);
    }
    return createClient(data);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setDialogOpen(true);
  };

  const handleDelete = (client: Client) => {
    const clientAppointments = appointments.filter(
      apt => apt.clientName.toLowerCase() === client.name.toLowerCase() && 
             apt.status !== 'completed' && 
             apt.status !== 'cancelled'
    );
    setHasAppointments(clientAppointments.length > 0);
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (clientToDelete) {
      await deleteClient(clientToDelete._id);
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-10 lg:pt-0">
        <div>
          <h1 className="text-3xl lg:text-4xl font-serif font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground mt-2">Gerencie sua base de clientes</p>
        </div>
        <Button variant="gold" size="lg" onClick={() => { setEditingClient(null); setDialogOpen(true); }}>
          <Plus className="h-5 w-5" />
          Novo Cliente
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, telefone ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-card border-border"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-xl p-6 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clients Grid */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {clientsPagination.paginatedItems.map((client, index) => (
              <div 
                key={client._id} 
                className="glass-card rounded-xl p-6 hover-lift cursor-pointer animate-slide-up opacity-0 group"
                style={{ animationDelay: `${0.05 * (index + 1)}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-foreground font-bold text-lg">
                      {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif font-bold text-lg text-foreground truncate">{client.name}</h3>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(client)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(client)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 text-gold" />
                        <span>{client.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4 text-gold" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-gold">{client.visits}</p>
                    <p className="text-xs text-muted-foreground">Visitas</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(client.updatedAt).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs text-muted-foreground">Última visita</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-400">{formatCurrency(client.totalSpent)}</p>
                    <p className="text-xs text-muted-foreground">Total gasto</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {clientsPagination.showPagination && (
            <PaginationControls
              currentPage={clientsPagination.currentPage}
              totalPages={clientsPagination.totalPages}
              onPageChange={clientsPagination.goToPage}
              hasNextPage={clientsPagination.hasNextPage}
              hasPreviousPage={clientsPagination.hasPreviousPage}
            />
          )}
        </>
      )}

      {!loading && filteredClients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {clients.length === 0 
              ? 'Nenhum cliente cadastrado. Clique em "Novo Cliente" para começar.'
              : 'Nenhum cliente encontrado'}
          </p>
        </div>
      )}

      {/* Dialogs */}
      <ClientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        client={editingClient}
        onSave={handleSave}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {hasAppointments && <AlertTriangle className="h-5 w-5 text-amber-500" />}
              Confirmar exclusão
            </AlertDialogTitle>
            <AlertDialogDescription>
              {hasAppointments ? (
                <>
                  <span className="text-amber-500 font-medium">Atenção:</span> O cliente "{clientToDelete?.name}" possui agendamentos pendentes ou confirmados. 
                  Excluir este cliente não cancelará os agendamentos existentes.
                </>
              ) : (
                <>Tem certeza que deseja excluir o cliente "{clientToDelete?.name}"? Esta ação não pode ser desfeita.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
