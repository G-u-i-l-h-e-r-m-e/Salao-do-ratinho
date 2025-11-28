import { useState } from 'react';
import { Search, Plus, Phone, Mail, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const clients = [
  { id: 1, name: 'João Silva', phone: '(11) 98765-4321', email: 'joao@email.com', visits: 12, lastVisit: '28/11/2025', totalSpent: 'R$ 1.440' },
  { id: 2, name: 'Pedro Santos', phone: '(11) 91234-5678', email: 'pedro@email.com', visits: 8, lastVisit: '27/11/2025', totalSpent: 'R$ 960' },
  { id: 3, name: 'Carlos Oliveira', phone: '(11) 99876-5432', email: 'carlos@email.com', visits: 15, lastVisit: '26/11/2025', totalSpent: 'R$ 1.800' },
  { id: 4, name: 'Rafael Costa', phone: '(11) 95555-1234', email: 'rafael@email.com', visits: 5, lastVisit: '21/11/2025', totalSpent: 'R$ 600' },
  { id: 5, name: 'Lucas Ferreira', phone: '(11) 94444-5678', email: 'lucas@email.com', visits: 20, lastVisit: '28/11/2025', totalSpent: 'R$ 2.400' },
  { id: 6, name: 'Marcos Almeida', phone: '(11) 93333-9876', email: 'marcos@email.com', visits: 3, lastVisit: '15/11/2025', totalSpent: 'R$ 360' },
];

export function Clientes() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-10 lg:pt-0">
        <div>
          <h1 className="text-3xl lg:text-4xl font-serif font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground mt-2">Gerencie sua base de clientes</p>
        </div>
        <Button variant="gold" size="lg">
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

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredClients.map((client, index) => (
          <div 
            key={client.id} 
            className="glass-card rounded-xl p-6 hover-lift cursor-pointer animate-slide-up opacity-0"
            style={{ animationDelay: `${0.05 * (index + 1)}s` }}
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground font-bold text-lg">
                  {client.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-serif font-bold text-lg text-foreground truncate">{client.name}</h3>
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
                <p className="text-sm font-medium text-foreground">{client.lastVisit}</p>
                <p className="text-xs text-muted-foreground">Última visita</p>
              </div>
              <div>
                <p className="text-sm font-medium text-green-400">{client.totalSpent}</p>
                <p className="text-xs text-muted-foreground">Total gasto</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum cliente encontrado</p>
        </div>
      )}
    </div>
  );
}
