import { useState, useEffect } from 'react';
import { User, Bell, Shield, Clock, Save, Scissors, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useServices, Service } from '@/hooks/useServices';
import { ServiceDialog } from '@/components/ServiceDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface SalonInfo {
  name: string;
  owner: string;
  email: string;
  phone: string;
}

interface BusinessHours {
  weekdays: { open: string; close: string; closed: boolean };
  saturday: { open: string; close: string; closed: boolean };
  sunday: { open: string; close: string; closed: boolean };
}

interface NotificationSettings {
  newAppointments: boolean;
  appointmentReminder: boolean;
  dailyReport: boolean;
}

const defaultSalonInfo: SalonInfo = {
  name: 'Salão do Ratinho',
  owner: '',
  email: '',
  phone: '',
};

const defaultBusinessHours: BusinessHours = {
  weekdays: { open: '08:00', close: '18:00', closed: false },
  saturday: { open: '08:00', close: '14:00', closed: false },
  sunday: { open: '', close: '', closed: true },
};

const defaultNotifications: NotificationSettings = {
  newAppointments: true,
  appointmentReminder: true,
  dailyReport: false,
};

export function Configuracoes() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  
  // Settings state
  const [salonInfo, setSalonInfo] = useState<SalonInfo>(defaultSalonInfo);
  const [businessHours, setBusinessHours] = useState<BusinessHours>(defaultBusinessHours);
  const [notifications, setNotifications] = useState<NotificationSettings>(defaultNotifications);
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const { services, loading, createService, updateService, deleteService } = useServices();
  const { toast } = useToast();
  const { user } = useAuth();

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSalonInfo = localStorage.getItem('salonInfo');
    const savedBusinessHours = localStorage.getItem('businessHours');
    const savedNotifications = localStorage.getItem('notifications');
    
    if (savedSalonInfo) setSalonInfo(JSON.parse(savedSalonInfo));
    if (savedBusinessHours) setBusinessHours(JSON.parse(savedBusinessHours));
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    
    // Set email from auth user
    if (user?.email) {
      setSalonInfo(prev => ({ ...prev, email: prev.email || user.email || '' }));
    }
  }, [user]);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      localStorage.setItem('salonInfo', JSON.stringify(salonInfo));
      localStorage.setItem('businessHours', JSON.stringify(businessHours));
      localStorage.setItem('notifications', JSON.stringify(notifications));
      
      toast({
        title: 'Sucesso',
        description: 'Configurações salvas com sucesso!',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações',
        variant: 'destructive',
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos de senha',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Erro',
        description: 'A nova senha deve ter no mínimo 6 caracteres',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem',
        variant: 'destructive',
      });
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Senha alterada com sucesso!',
      });
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: 'Erro ao alterar senha',
        description: error.message || 'Não foi possível alterar a senha',
        variant: 'destructive',
      });
    } finally {
      setChangingPassword(false);
    }
  };

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

  const updateBusinessHours = (
    day: 'weekdays' | 'saturday' | 'sunday',
    field: 'open' | 'close' | 'closed',
    value: string | boolean
  ) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
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
          <h2 className="font-serif text-xl font-bold text-foreground">Informações do Salão</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground">Nome do Salão</label>
            <Input 
              value={salonInfo.name}
              onChange={(e) => setSalonInfo(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1.5 bg-secondary border-border" 
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Proprietário</label>
            <Input 
              value={salonInfo.owner}
              onChange={(e) => setSalonInfo(prev => ({ ...prev, owner: e.target.value }))}
              placeholder="Nome do proprietário"
              className="mt-1.5 bg-secondary border-border" 
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Email</label>
            <Input 
              value={salonInfo.email}
              onChange={(e) => setSalonInfo(prev => ({ ...prev, email: e.target.value }))}
              placeholder="contato@salao.com"
              className="mt-1.5 bg-secondary border-border" 
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Telefone</label>
            <Input 
              value={salonInfo.phone}
              onChange={(e) => setSalonInfo(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="(11) 99999-9999"
              className="mt-1.5 bg-secondary border-border" 
            />
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
          {/* Segunda a Sexta */}
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <Switch 
                checked={!businessHours.weekdays.closed}
                onCheckedChange={(checked) => updateBusinessHours('weekdays', 'closed', !checked)}
              />
              <span className="font-medium text-foreground">Segunda a Sexta</span>
            </div>
            <div className="flex items-center gap-4">
              <Input 
                type="time"
                value={businessHours.weekdays.open}
                onChange={(e) => updateBusinessHours('weekdays', 'open', e.target.value)}
                className="w-28 bg-secondary border-border text-center"
                disabled={businessHours.weekdays.closed}
              />
              <span className="text-muted-foreground">até</span>
              <Input 
                type="time"
                value={businessHours.weekdays.close}
                onChange={(e) => updateBusinessHours('weekdays', 'close', e.target.value)}
                className="w-28 bg-secondary border-border text-center"
                disabled={businessHours.weekdays.closed}
              />
            </div>
          </div>

          {/* Sábado */}
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <Switch 
                checked={!businessHours.saturday.closed}
                onCheckedChange={(checked) => updateBusinessHours('saturday', 'closed', !checked)}
              />
              <span className="font-medium text-foreground">Sábado</span>
            </div>
            <div className="flex items-center gap-4">
              <Input 
                type="time"
                value={businessHours.saturday.open}
                onChange={(e) => updateBusinessHours('saturday', 'open', e.target.value)}
                className="w-28 bg-secondary border-border text-center"
                disabled={businessHours.saturday.closed}
              />
              <span className="text-muted-foreground">até</span>
              <Input 
                type="time"
                value={businessHours.saturday.close}
                onChange={(e) => updateBusinessHours('saturday', 'close', e.target.value)}
                className="w-28 bg-secondary border-border text-center"
                disabled={businessHours.saturday.closed}
              />
            </div>
          </div>

          {/* Domingo */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Switch 
                checked={!businessHours.sunday.closed}
                onCheckedChange={(checked) => updateBusinessHours('sunday', 'closed', !checked)}
              />
              <span className="font-medium text-foreground">Domingo</span>
            </div>
            <div className="flex items-center gap-4">
              {businessHours.sunday.closed ? (
                <span className="text-muted-foreground italic">Fechado</span>
              ) : (
                <>
                  <Input 
                    type="time"
                    value={businessHours.sunday.open}
                    onChange={(e) => updateBusinessHours('sunday', 'open', e.target.value)}
                    className="w-28 bg-secondary border-border text-center"
                  />
                  <span className="text-muted-foreground">até</span>
                  <Input 
                    type="time"
                    value={businessHours.sunday.close}
                    onChange={(e) => updateBusinessHours('sunday', 'close', e.target.value)}
                    className="w-28 bg-secondary border-border text-center"
                  />
                </>
              )}
            </div>
          </div>
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
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="font-medium text-foreground">Notificar novos agendamentos</p>
              <p className="text-sm text-muted-foreground">Receba alertas quando houver novos agendamentos</p>
            </div>
            <Switch 
              checked={notifications.newAppointments}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, newAppointments: checked }))}
            />
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="font-medium text-foreground">Lembrete de agendamento</p>
              <p className="text-sm text-muted-foreground">Enviar lembrete para clientes 1 hora antes</p>
            </div>
            <Switch 
              checked={notifications.appointmentReminder}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, appointmentReminder: checked }))}
            />
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-foreground">Relatório diário</p>
              <p className="text-sm text-muted-foreground">Receber resumo do dia por email</p>
            </div>
            <Switch 
              checked={notifications.dailyReport}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, dailyReport: checked }))}
            />
          </div>
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
          <div className="p-4 bg-secondary/50 rounded-lg mb-4">
            <p className="text-sm text-muted-foreground">
              Email da conta: <span className="text-foreground font-medium">{user?.email || 'Não identificado'}</span>
            </p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Nova Senha</label>
            <Input 
              type="password" 
              placeholder="Mínimo 6 caracteres" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1.5 bg-secondary border-border" 
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Confirmar Nova Senha</label>
            <Input 
              type="password" 
              placeholder="Digite novamente a nova senha" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1.5 bg-secondary border-border" 
            />
          </div>
          <Button 
            variant="outline" 
            onClick={handleChangePassword}
            disabled={changingPassword || !newPassword || !confirmPassword}
            className="mt-2"
          >
            {changingPassword ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Alterando...
              </>
            ) : (
              'Alterar Senha'
            )}
          </Button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pb-8">
        <Button 
          variant="gold" 
          size="lg" 
          onClick={handleSaveSettings}
          disabled={savingSettings}
        >
          {savingSettings ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Salvar Alterações
            </>
          )}
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
