import { User, Bell, Shield, Palette, Clock, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

export function Configuracoes() {
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="pt-10 lg:pt-0">
        <h1 className="text-3xl lg:text-4xl font-serif font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-2">Personalize seu sistema</p>
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
    </div>
  );
}
