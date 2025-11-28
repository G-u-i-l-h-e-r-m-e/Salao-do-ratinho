import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/hooks/useAuth';
import { useAppointments } from '@/hooks/useAppointments';
import { api } from '@/lib/api';
import { ClientAppointmentDialog } from '@/components/ClientAppointmentDialog';
import { 
  User, 
  Calendar, 
  LogOut, 
  Loader2, 
  Phone, 
  Mail, 
  FileText,
  Edit,
  Save,
  X,
  Plus,
  Clock,
  Megaphone
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Função para formatar telefone
const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

export function ClientPortal() {
  const { role, loading, clientData, user } = useUserRole();
  const { signOut } = useAuth();
  const { appointments, loading: appointmentsLoading, fetchAppointments, createAppointment } = useAppointments();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);

  // Filtra agendamentos do cliente
  const clientAppointments = appointments.filter(
    (apt) => apt.clientName.toLowerCase() === clientData?.name?.toLowerCase()
  );

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/cliente/auth');
      } else if (role === 'admin') {
        navigate('/');
      }
    }
  }, [loading, user, role, navigate]);

  useEffect(() => {
    if (clientData) {
      setFormData({
        name: clientData.name || '',
        phone: clientData.phone || '',
        email: clientData.email || '',
        notes: clientData.notes || ''
      });
    }
  }, [clientData]);

  const handleSaveProfile = async () => {
    if (!clientData?._id) return;
    
    setIsSaving(true);
    try {
      const response = await api.updateClient(clientData._id, {
        name: formData.name,
        phone: formData.phone,
        notes: formData.notes
      });

      if (response.success) {
        toast({
          title: 'Sucesso',
          description: 'Seus dados foram atualizados!'
        });
        setIsEditing(false);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar seus dados.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/cliente/auth');
  };

  const handleCreateAppointment = async (data: any) => {
    if (!clientData) return;
    
    await createAppointment({
      ...data,
      clientName: clientData.name
    });
    
    setAppointmentDialogOpen(false);
    fetchAppointments();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      pending: { variant: 'secondary', label: 'Pendente' },
      confirmed: { variant: 'default', label: 'Confirmado' },
      completed: { variant: 'outline', label: 'Concluído' },
      cancelled: { variant: 'destructive', label: 'Cancelado' }
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Dados do cliente não encontrados.</p>
            <Button onClick={handleSignOut} variant="outline" className="mt-4">
              Sair
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Olá, {clientData.name?.split(' ')[0]}</h1>
              <p className="text-xs text-muted-foreground">Área do Cliente</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Banner de Promoções */}
        {(() => {
          const savedPromotion = localStorage.getItem('promotion');
          if (!savedPromotion) return null;
          const promo = JSON.parse(savedPromotion);
          if (!promo.active || !promo.title || !promo.text) return null;
          return (
            <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Megaphone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{promo.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{promo.text}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })()}

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Meus Dados
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Agendamentos
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Meus Dados</CardTitle>
                  <CardDescription>Gerencie suas informações pessoais</CardDescription>
                </div>
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          name: clientData.name || '',
                          phone: clientData.phone || '',
                          email: clientData.email || '',
                          notes: clientData.notes || ''
                        });
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Salvar
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="pl-10"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                        className="pl-10"
                        maxLength={16}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        value={formData.email}
                        className="pl-10"
                        disabled
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">O email não pode ser alterado</p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="notes">Observações</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="pl-10 min-h-[100px]"
                        disabled={!isEditing}
                        placeholder="Preferências, alergias, etc."
                      />
                    </div>
                  </div>
                </div>

                {/* Estatísticas */}
                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-medium mb-3">Estatísticas</h3>
                  <div className="p-4 bg-muted/50 rounded-lg text-center max-w-xs">
                    <p className="text-2xl font-bold text-primary">{clientData.visits || 0}</p>
                    <p className="text-xs text-muted-foreground">Visitas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <Card>
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Meus Agendamentos</CardTitle>
                  <CardDescription>Visualize e agende novos horários</CardDescription>
                </div>
                <Button variant="gold" size="sm" className="w-full sm:w-auto" onClick={() => setAppointmentDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Agendamento
                </Button>
              </CardHeader>
              <CardContent>
                {appointmentsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : clientAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">Nenhum agendamento encontrado</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => setAppointmentDialogOpen(true)}
                    >
                      Fazer primeiro agendamento
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {clientAppointments
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((appointment) => (
                        <div
                          key={appointment._id}
                          className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <p className="font-medium">{appointment.service}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {format(parseISO(appointment.date), "dd 'de' MMMM", { locale: ptBR })}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {appointment.time}
                              </div>
                            </div>
                            {getStatusBadge(appointment.status)}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Appointment Dialog */}
      <ClientAppointmentDialog
        open={appointmentDialogOpen}
        onOpenChange={setAppointmentDialogOpen}
        onSave={handleCreateAppointment}
        clientName={clientData?.name || ''}
      />
    </div>
  );
}
