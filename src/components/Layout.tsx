import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { useAppointmentReminder } from '@/hooks/useAppointmentReminder';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  // Ativa lembretes de agendamento
  useAppointmentReminder();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-64 min-h-screen">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
