import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Service } from '@/hooks/useServices';

interface ServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: Service | null;
  onSave: (data: Omit<Service, '_id'>) => Promise<void>;
}

export function ServiceDialog({ open, onOpenChange, service, onSave }: ServiceDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    duration: 30,
    active: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        price: service.price,
        duration: service.duration,
        active: service.active,
      });
    } else {
      setFormData({
        name: '',
        price: 0,
        duration: 30,
        active: true,
      });
    }
  }, [service, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-serif">
            {service ? 'Editar Serviço' : 'Novo Serviço'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Serviço *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Corte + Barba"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (min)</Label>
              <Input
                id="duration"
                type="number"
                min="5"
                step="5"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="active">Serviço ativo</Label>
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="gold" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
