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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/clientes" element={<Layout><Clientes /></Layout>} />
          <Route path="/agendamentos" element={<Layout><Agendamentos /></Layout>} />
          <Route path="/financeiro" element={<Layout><Financeiro /></Layout>} />
          <Route path="/configuracoes" element={<Layout><Configuracoes /></Layout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
