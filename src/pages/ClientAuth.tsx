import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import logo from '@/assets/logo.png';

const emailSchema = z.string().email('Email inválido');
const passwordSchema = z.string().min(6, 'Senha deve ter no mínimo 6 caracteres');

type Step = 'email' | 'password' | 'login';

export function ClientAuth() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientExists, setClientExists] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
  
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user && !loading) {
      navigate('/cliente');
    }
  }, [user, loading, navigate]);

  const handleEmailCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(email);
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({ email: error.errors[0].message });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Verifica se o email existe na tabela de clientes
      const response = await api.getClients();
      
      if (response.success && response.data) {
        const client = response.data.find(
          (c: any) => c.email.toLowerCase() === email.toLowerCase()
        );
        
        if (client) {
          setClientExists(true);
          // Tenta fazer login para ver se já tem conta
          const { error } = await signIn(email, 'test-password-check');
          
          if (error?.message?.includes('Invalid login credentials')) {
            // Email existe, verificar se já tem conta no Supabase
            // Tenta criar conta - se falhar com "User already registered", vai para login
            setStep('login');
          } else {
            setStep('login');
          }
        } else {
          toast({
            title: 'Email não cadastrado',
            description: 'Este email não está cadastrado. Solicite ao barbeiro para realizar seu cadastro.',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível verificar o email. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      passwordSchema.parse(password);
      if (password !== confirmPassword) {
        setErrors({ confirmPassword: 'As senhas não coincidem' });
        return;
      }
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({ password: error.errors[0].message });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await signUp(email, password);
      
      if (error) {
        if (error.message.includes('User already registered')) {
          toast({
            title: 'Conta já existe',
            description: 'Você já possui uma conta. Faça login com sua senha.',
          });
          setStep('login');
          setPassword('');
        } else {
          toast({
            title: 'Erro ao criar conta',
            description: error.message,
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Conta criada!',
          description: 'Sua conta foi criada com sucesso.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      passwordSchema.parse(password);
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({ password: error.errors[0].message });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          // Pode ser que não tenha conta ainda
          toast({
            title: 'Credenciais inválidas',
            description: 'Se é seu primeiro acesso, clique em "Criar senha".',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Erro no login',
            description: error.message,
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Bem-vindo!',
          description: 'Login realizado com sucesso.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md glass-card animate-scale-in relative z-10">
        <CardHeader className="text-center space-y-4">
          <img src={logo} alt="Salão do Ratinho" className="mx-auto h-20 w-20 object-contain" />
          <div>
            <CardTitle className="text-2xl">
              <span className="text-foreground">Área do </span>
              <span className="text-primary">Cliente</span>
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              {step === 'email' && 'Digite seu email cadastrado'}
              {step === 'password' && 'Crie sua senha de acesso'}
              {step === 'login' && 'Entre com sua senha'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {step === 'email' && (
            <form onSubmit={handleEmailCheck} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full gold-gradient text-primary-foreground font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Continuar'
                )}
              </Button>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => navigate('/auth')}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Sou barbeiro? <span className="text-primary font-medium">Acessar painel</span>
                </button>
              </div>
            </form>
          )}

          {step === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg mb-4">
                <p className="text-sm text-muted-foreground">Email: <span className="text-foreground font-medium">{email}</span></p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full gold-gradient text-primary-foreground font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>

              <div className="flex flex-col gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setStep('password')}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Primeiro acesso? <span className="text-primary font-medium">Criar senha</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setPassword('');
                    setErrors({});
                  }}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Voltar
                </button>
              </div>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={handleCreatePassword} className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg mb-4">
                <p className="text-sm text-muted-foreground">Email: <span className="text-foreground font-medium">{email}</span></p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full gold-gradient text-primary-foreground font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  'Criar conta'
                )}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep('login');
                  setPassword('');
                  setConfirmPassword('');
                  setErrors({});
                }}
                className="w-full text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                Já tenho senha
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
