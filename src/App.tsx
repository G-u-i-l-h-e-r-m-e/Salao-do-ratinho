import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { Layout } from "./components/Layout";
import { Clientes } from "./pages/Clientes";
import { Agendamentos } from "./pages/Agendamentos";
import { Financeiro } from "./pages/Financeiro";
import { Configuracoes } from "./pages/Configuracoes";
import { Auth } from "./pages/Auth";
import { ClientAuth } from "./pages/ClientAuth";
import { ClientPortal } from "./pages/ClientPortal";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth routes */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/cliente/auth" element={<ClientAuth />} />
          
          {/* Client portal */}
          <Route path="/cliente" element={<ProtectedRoute><ClientPortal /></ProtectedRoute>} />
          
          {/* Admin routes */}
          <Route path="/" element={<AdminRoute><Index /></AdminRoute>} />
          <Route path="/clientes" element={<AdminRoute><Layout><Clientes /></Layout></AdminRoute>} />
          <Route path="/agendamentos" element={<AdminRoute><Layout><Agendamentos /></Layout></AdminRoute>} />
          <Route path="/financeiro" element={<AdminRoute><Layout><Financeiro /></Layout></AdminRoute>} />
          <Route path="/configuracoes" element={<AdminRoute><Layout><Configuracoes /></Layout></AdminRoute>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
