import { useState } from 'react';
import { User, Bell, Shield, Clock, Save, Scissors, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useServices, Service } from '@/hooks/useServices';
import { ServiceDialog } from '@/components/ServiceDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function Configuracoes() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

  const { services, loading, createService, updateService, deleteService } = useServices();

  const handleNewService = () => {
    setSelectedService(null);
    setDialogOpen(true);
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setDialogOpen(true);
  };

  const handleSaveService = async (data: Omit<Service, '_id'>) => {
    if (selectedService) {
      await updateService(selectedService._id, data);
    } else {
      await createService(data);
    }
  };

  const handleDeleteClick = (id: string) => {
    setServiceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (serviceToDelete) {
      await deleteService(serviceToDelete);
      setServiceToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="pt-10 lg:pt-0">
        <h1 className="text-3xl lg:text-4xl font-serif font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-2">Personalize seu sistema</p>
      </div>

      {/* Services Section */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold/10">
              <Scissors className="h-5 w-5 text-gold" />
            </div>
            <h2 className="font-serif text-xl font-bold text-foreground">Serviços</h2>
          </div>
          <Button variant="gold" size="sm" onClick={handleNewService}>
            <Plus className="h-4 w-4" />
            Novo Serviço
          </Button>
        </div>
        
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum serviço cadastrado</p>
            <Button variant="outline" className="mt-4" onClick={handleNewService}>
              Adicionar serviço
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <div
                key={service._id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border transition-all",
                  service.active 
                    ? "bg-secondary/50 border-border" 
                    : "bg-muted/30 border-muted opacity-60"
                )}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium text-foreground">{service.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {service.duration} min • {service.active ? 'Ativo' : 'Inativo'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-gold">{formatCurrency(service.price)}</span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEditService(service)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteClick(service._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile Section */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gold/10">
            <User className="h-5 w-5 text-gold" />
          </div>
          <h2 className="font-serif text-xl font-bold text-foreground">Perfil</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground">Nome do Salão</label>
            <Input defaultValue="Salão do Ratinho" className="mt-1.5 bg-secondary border-border" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Proprietário</label>
            <Input defaultValue="Guilherme Andrade" className="mt-1.5 bg-secondary border-border" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Email</label>
            <Input defaultValue="contato@salaoratinho.com.br" className="mt-1.5 bg-secondary border-border" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Telefone</label>
            <Input defaultValue="(11) 98765-4321" className="mt-1.5 bg-secondary border-border" />
          </div>
        </div>
      </div>

      {/* Business Hours */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gold/10">
            <Clock className="h-5 w-5 text-gold" />
          </div>
          <h2 className="font-serif text-xl font-bold text-foreground">Horário de Funcionamento</h2>
        </div>
        
        <div className="space-y-4">
          {['Segunda a Sexta', 'Sábado', 'Domingo'].map((day, index) => (
            <div key={day} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <span className="font-medium text-foreground">{day}</span>
              <div className="flex items-center gap-4">
                <Input 
                  defaultValue={index === 2 ? 'Fechado' : index === 1 ? '08:00' : '08:00'} 
                  className="w-24 bg-secondary border-border text-center"
                  disabled={index === 2}
                />
                {index !== 2 && (
                  <>
                    <span className="text-muted-foreground">até</span>
                    <Input 
                      defaultValue={index === 1 ? '14:00' : '18:00'} 
                      className="w-24 bg-secondary border-border text-center"
                    />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gold/10">
            <Bell className="h-5 w-5 text-gold" />
          </div>
          <h2 className="font-serif text-xl font-bold text-foreground">Notificações</h2>
        </div>
        
        <div className="space-y-4">
          {[
            { label: 'Notificar novos agendamentos', description: 'Receba alertas quando houver novos agendamentos' },
            { label: 'Lembrete de agendamento', description: 'Enviar lembrete para clientes 1 hora antes' },
            { label: 'Relatório diário', description: 'Receber resumo do dia por email' },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div>
                <p className="font-medium text-foreground">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <Switch defaultChecked={index < 2} />
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gold/10">
            <Shield className="h-5 w-5 text-gold" />
          </div>
          <h2 className="font-serif text-xl font-bold text-foreground">Segurança</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Senha Atual</label>
            <Input type="password" placeholder="••••••••" className="mt-1.5 bg-secondary border-border" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Nova Senha</label>
            <Input type="password" placeholder="••••••••" className="mt-1.5 bg-secondary border-border" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Confirmar Nova Senha</label>
            <Input type="password" placeholder="••••••••" className="mt-1.5 bg-secondary border-border" />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button variant="gold" size="lg">
          <Save className="h-5 w-5" />
          Salvar Alterações
        </Button>
      </div>

      <ServiceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        service={selectedService}
        onSave={handleSaveService}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
