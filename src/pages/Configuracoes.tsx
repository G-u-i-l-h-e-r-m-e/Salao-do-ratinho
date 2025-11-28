import { useState, useEffect, useCallback } from 'react';
import { User, Bell, Shield, Clock, Save, Scissors, Plus, Edit, Trash2, Loader2, AlertTriangle, Megaphone, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useServices, Service } from '@/hooks/useServices';
import { ServiceDialog } from '@/components/ServiceDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useBusinessHours, BusinessHours, DayHours } from '@/hooks/useBusinessHours';
import { api } from '@/lib/api';

interface SalonInfo {
  name: string;
  owner: string;
  email: string;
  phone: string;
}

interface NotificationSettings {
  appointmentReminder: boolean;
  reminderMinutes: number;
}

interface ConflictingAppointment {
  clientName: string;
  date: string;
  time: string;
  dayName: string;
}

const defaultSalonInfo: SalonInfo = {
  name: 'Salão do Ratinho',
  owner: '',
  email: '',
  phone: '',
};

const defaultNotifications: NotificationSettings = {
  appointmentReminder: true,
  reminderMinutes: 10,
};

export function Configuracoes() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  
  // Settings state
  const [salonInfo, setSalonInfo] = useState<SalonInfo>(defaultSalonInfo);
  const [localBusinessHours, setLocalBusinessHours] = useState<BusinessHours | null>(null);
  const [notifications, setNotifications] = useState<NotificationSettings>(defaultNotifications);
  const [promotionTitle, setPromotionTitle] = useState('🎉 Promoção Especial!');
  const [promotionText, setPromotionText] = useState('Traga um amigo e ganhe 10% de desconto no próximo corte. Aproveite!');
  const [promotionActive, setPromotionActive] = useState(true);
  
  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  
  // Conflict state
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
  const [conflictingAppointments, setConflictingAppointments] = useState<ConflictingAppointment[]>([]);

  const { services, loading, createService, updateService, deleteService } = useServices();
  const { toast } = useToast();
  const { user } = useAuth();
  const { businessHours, saveBusinessHours } = useBusinessHours();

  // Initialize local business hours from hook
  useEffect(() => {
    setLocalBusinessHours(businessHours);
  }, [businessHours]);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSalonInfo = localStorage.getItem('salonInfo');
    const savedNotifications = localStorage.getItem('notifications');
    const savedPromotion = localStorage.getItem('promotion');
    
    if (savedSalonInfo) setSalonInfo(JSON.parse(savedSalonInfo));
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    if (savedPromotion) {
      const promo = JSON.parse(savedPromotion);
      setPromotionTitle(promo.title || '🎉 Promoção Especial!');
      setPromotionText(promo.text || '');
      setPromotionActive(promo.active !== false);
    }
    
    // Set email from auth user
    if (user?.email) {
      setSalonInfo(prev => ({ ...prev, email: prev.email || user.email || '' }));
    }
  }, [user]);

  const getDayName = (dayOfWeek: number): string => {
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    return days[dayOfWeek];
  };

  const isTimeWithinHours = (time: string, dayHours: DayHours): boolean => {
    if (dayHours.closed) return false;
    if (!dayHours.open || !dayHours.close) return false;

    const [timeHour, timeMin] = time.split(':').map(Number);
    const [openHour, openMin] = dayHours.open.split(':').map(Number);
    const [closeHour, closeMin] = dayHours.close.split(':').map(Number);

    const timeInMinutes = timeHour * 60 + timeMin;
    const openInMinutes = openHour * 60 + openMin;
    const closeInMinutes = closeHour * 60 + closeMin;

    return timeInMinutes >= openInMinutes && timeInMinutes < closeInMinutes;
  };

  const checkForConflicts = useCallback(async (newHours: BusinessHours): Promise<ConflictingAppointment[]> => {
    try {
      // Busca agendamentos dos próximos 30 dias
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + 30);
      
      const startStr = today.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];
      
      const response = await api.getAppointments();
      
      if (!response.success || !response.data) return [];
      
      const conflicts: ConflictingAppointment[] = [];
      
      response.data.forEach((apt: any) => {
        // Ignora agendamentos cancelados ou concluídos
        if (apt.status === 'cancelled' || apt.status === 'completed') return;
        
        const aptDate = new Date(apt.date + 'T12:00:00');
        const dayOfWeek = aptDate.getDay();
        
        let dayHours: DayHours;
        if (dayOfWeek === 0) {
          dayHours = newHours.sunday;
        } else if (dayOfWeek === 6) {
          dayHours = newHours.saturday;
        } else {
          dayHours = newHours.weekdays;
        }
        
        // Verifica se o horário está fora do novo horário de funcionamento
        if (!isTimeWithinHours(apt.time, dayHours)) {
          conflicts.push({
            clientName: apt.clientName,
            date: apt.date,
            time: apt.time,
            dayName: getDayName(dayOfWeek),
          });
        }
      });
      
      return conflicts;
    } catch (error) {
      console.error('Error checking conflicts:', error);
      return [];
    }
  }, []);

  const handleSaveSettings = async () => {
    if (!localBusinessHours) return;
    
    setSavingSettings(true);
    try {
      // Verifica conflitos com agendamentos
      const conflicts = await checkForConflicts(localBusinessHours);
      
      if (conflicts.length > 0) {
        setConflictingAppointments(conflicts);
        setConflictDialogOpen(true);
        setSavingSettings(false);
        return;
      }
      
      // Salva as configurações
      localStorage.setItem('salonInfo', JSON.stringify(salonInfo));
      localStorage.setItem('notifications', JSON.stringify(notifications));
      localStorage.setItem('appointmentReminderMinutes', notifications.reminderMinutes.toString());
      localStorage.setItem('promotion', JSON.stringify({
        title: promotionTitle,
        text: promotionText,
        active: promotionActive
      }));
      saveBusinessHours(localBusinessHours);
      
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

  const updateLocalBusinessHours = (
    day: 'weekdays' | 'saturday' | 'sunday',
    field: 'open' | 'close' | 'closed',
    value: string | boolean
  ) => {
    if (!localBusinessHours) return;
    setLocalBusinessHours(prev => prev ? ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }) : null);
  };

  if (!localBusinessHours) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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

      {/* Promotions Section */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold/10">
              <Megaphone className="h-5 w-5 text-gold" />
            </div>
            <h2 className="font-serif text-xl font-bold text-foreground">Promoções</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Ativo</span>
            <Switch 
              checked={promotionActive}
              onCheckedChange={setPromotionActive}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Título da Promoção</label>
            <div className="flex gap-2 mt-1.5">
              <Input 
                value={promotionTitle}
                onChange={(e) => setPromotionTitle(e.target.value)}
                placeholder="🎉 Promoção Especial!"
                className="bg-secondary border-border"
                disabled={!promotionActive}
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" disabled={!promotionActive}>
                    <Smile className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" align="end">
                  <div className="grid grid-cols-6 gap-1">
                    {['🎉', '🔥', '⭐', '💈', '✨', '💇', '🎁', '💰', '🏆', '❤️', '👑', '💎', '🌟', '🎊', '🤩', '💪', '👏', '🙌'].map((emoji) => (
                      <Button
                        key={emoji}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-lg"
                        onClick={() => setPromotionTitle(prev => prev + emoji)}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Mensagem</label>
            <Textarea 
              value={promotionText}
              onChange={(e) => setPromotionText(e.target.value)}
              placeholder="Descreva sua promoção aqui..."
              className="mt-1.5 bg-secondary border-border min-h-[80px]"
              disabled={!promotionActive}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Esta mensagem será exibida para os clientes na área do cliente.
          </p>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-border gap-4">
            <div className="flex items-center gap-3">
              <Switch 
                checked={!localBusinessHours.weekdays.closed}
                onCheckedChange={(checked) => updateLocalBusinessHours('weekdays', 'closed', !checked)}
              />
              <span className="font-medium text-foreground">Segunda a Sexta</span>
            </div>
            <div className="flex items-center gap-4">
              <Input 
                type="time"
                value={localBusinessHours.weekdays.open}
                onChange={(e) => updateLocalBusinessHours('weekdays', 'open', e.target.value)}
                className="w-28 bg-secondary border-border text-center"
                disabled={localBusinessHours.weekdays.closed}
              />
              <span className="text-muted-foreground">até</span>
              <Input 
                type="time"
                value={localBusinessHours.weekdays.close}
                onChange={(e) => updateLocalBusinessHours('weekdays', 'close', e.target.value)}
                className="w-28 bg-secondary border-border text-center"
                disabled={localBusinessHours.weekdays.closed}
              />
            </div>
          </div>

          {/* Sábado */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-border gap-4">
            <div className="flex items-center gap-3">
              <Switch 
                checked={!localBusinessHours.saturday.closed}
                onCheckedChange={(checked) => updateLocalBusinessHours('saturday', 'closed', !checked)}
              />
              <span className="font-medium text-foreground">Sábado</span>
            </div>
            <div className="flex items-center gap-4">
              <Input 
                type="time"
                value={localBusinessHours.saturday.open}
                onChange={(e) => updateLocalBusinessHours('saturday', 'open', e.target.value)}
                className="w-28 bg-secondary border-border text-center"
                disabled={localBusinessHours.saturday.closed}
              />
              <span className="text-muted-foreground">até</span>
              <Input 
                type="time"
                value={localBusinessHours.saturday.close}
                onChange={(e) => updateLocalBusinessHours('saturday', 'close', e.target.value)}
                className="w-28 bg-secondary border-border text-center"
                disabled={localBusinessHours.saturday.closed}
              />
            </div>
          </div>

          {/* Domingo */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-4">
            <div className="flex items-center gap-3">
              <Switch 
                checked={!localBusinessHours.sunday.closed}
                onCheckedChange={(checked) => updateLocalBusinessHours('sunday', 'closed', !checked)}
              />
              <span className="font-medium text-foreground">Domingo</span>
            </div>
            <div className="flex items-center gap-4">
              {localBusinessHours.sunday.closed ? (
                <span className="text-muted-foreground italic">Fechado</span>
              ) : (
                <>
                  <Input 
                    type="time"
                    value={localBusinessHours.sunday.open}
                    onChange={(e) => updateLocalBusinessHours('sunday', 'open', e.target.value)}
                    className="w-28 bg-secondary border-border text-center"
                  />
                  <span className="text-muted-foreground">até</span>
                  <Input 
                    type="time"
                    value={localBusinessHours.sunday.close}
                    onChange={(e) => updateLocalBusinessHours('sunday', 'close', e.target.value)}
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-4">
            <div className="flex items-center gap-3">
              <Switch 
                checked={notifications.appointmentReminder}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, appointmentReminder: checked }))}
              />
              <div>
                <p className="font-medium text-foreground">Lembrete de próximo cliente</p>
                <p className="text-sm text-muted-foreground">Popup avisando sobre o próximo agendamento</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input 
                type="number"
                min={1}
                max={60}
                value={notifications.reminderMinutes}
                onChange={(e) => setNotifications(prev => ({ ...prev, reminderMinutes: parseInt(e.target.value) || 10 }))}
                className="w-20 bg-secondary border-border text-center"
                disabled={!notifications.appointmentReminder}
              />
              <span className="text-sm text-muted-foreground">min antes</span>
            </div>
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

      {/* Conflict Dialog */}
      <AlertDialog open={conflictDialogOpen} onOpenChange={setConflictDialogOpen}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Conflito com Agendamentos
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  Não é possível alterar o horário de funcionamento pois existem {conflictingAppointments.length} agendamento(s) 
                  que ficariam fora do novo horário:
                </p>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {conflictingAppointments.map((apt, index) => (
                    <div key={index} className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                      <p className="font-medium text-foreground">{apt.clientName}</p>
                      <p className="text-sm text-muted-foreground">
                        {apt.dayName}, {new Date(apt.date + 'T12:00:00').toLocaleDateString('pt-BR')} às {apt.time}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Cancele ou remarque esses agendamentos antes de alterar o horário de funcionamento.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Entendi</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
