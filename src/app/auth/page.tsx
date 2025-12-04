'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de autenticação (MVP)
    router.push('/success-stories');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5B8DEF] via-[#B7A6D8] to-[#E8CFC8] flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Icon */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full">
            <Heart className="w-10 h-10 text-white" fill="white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">FlowFit</h1>
            <p className="text-white/80 mt-2">
              Cadastre-se para guardarmos seu treino personalizado
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">
                  Nome
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Como você gostaria de ser chamada?"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                required
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-white text-[#2E2E2E] hover:bg-white/90 font-semibold text-lg py-6 rounded-2xl shadow-xl"
            >
              {isLogin ? 'Entrar' : 'Criar conta'}
            </Button>
          </form>

          <div className="text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-white/90 hover:text-white text-sm font-medium transition-colors"
            >
              {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
            </button>
          </div>
        </div>

        {/* Privacy note */}
        <p className="text-center text-white/60 text-xs">
          Seus dados estão seguros e nunca serão compartilhados
        </p>
      </div>
    </div>
  );
}
