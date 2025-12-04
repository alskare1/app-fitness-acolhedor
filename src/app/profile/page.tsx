'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, User, Target, Dumbbell, Bell, Calendar, Heart, Activity, TrendingUp, MessageCircle, Send } from 'lucide-react';
import { getUserProfile, saveUserProfile, getProgress } from '@/lib/storage';
import { UserProfile } from '@/lib/types';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [lastPeriodDate, setLastPeriodDate] = useState('');
  const [progress, setProgress] = useState({ currentStreak: 0, totalWorkouts: 0, bestStreak: 0 });
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const userProfile = getUserProfile();
    if (!userProfile) {
      router.push('/onboarding');
      return;
    }
    setProfile(userProfile);
    setEditedProfile(userProfile);
    setLastPeriodDate(userProfile.lastPeriodDate || '');
    
    const userProgress = getProgress();
    setProgress(userProgress);
  }, [router]);

  const handleSave = () => {
    if (!editedProfile) return;

    const updatedProfile = {
      ...editedProfile,
      lastPeriodDate: lastPeriodDate || undefined
    };

    saveUserProfile(updatedProfile);
    setProfile(updatedProfile);
    setIsEditing(false);
  };

  const askAI = async () => {
    if (!aiQuestion.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: aiQuestion,
          profile,
          progress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar pergunta');
      }

      setAiResponse(data.response);
    } catch (error: any) {
      console.error('Erro ao consultar assistente:', error);
      setAiResponse('Desculpe, houve um erro ao conectar com o assistente. Tente novamente.');
    }
    setIsLoading(false);
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#F6F7F8] flex items-center justify-center">
        <div className="text-[#2E2E2E] text-xl animate-pulse">Carregando...</div>
      </div>
    );
  }

  const goalLabels: Record<string, string> = {
    'lose-weight': 'Perder Peso',
    'gain-muscle': 'Ganhar Massa',
    'maintain': 'Manter Forma',
    'improve-health': 'Melhorar Saúde'
  };

  const equipmentLabels: Record<string, string> = {
    'none': 'Sem Equipamento',
    'basic': 'Básico',
    'full-gym': 'Academia Completa'
  };

  return (
    <div className="min-h-screen bg-[#F6F7F8] pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/home')}
              className="w-10 h-10 rounded-full bg-[#F6F7F8] flex items-center justify-center hover:bg-[#5B8DEF]/10 transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-[#2E2E2E]" />
            </button>
            <h1 className="text-2xl font-bold text-[#2E2E2E]">Perfil</h1>
            <button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className="text-[#5B8DEF] font-semibold text-sm"
            >
              {isEditing ? 'Salvar' : 'Editar'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Card de perfil */}
        <div className="bg-gradient-to-br from-[#5B8DEF] to-[#B7A6D8] rounded-3xl p-6 shadow-lg text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editedProfile?.name || ''}
                  onChange={(e) => setEditedProfile(prev => prev ? {...prev, name: e.target.value} : null)}
                  className="bg-white/20 text-white placeholder-white/60 rounded-xl px-3 py-2 text-xl font-bold"
                  placeholder="Seu nome"
                />
              ) : (
                <h2 className="text-2xl font-bold">{profile.name || 'Atleta'}</h2>
              )}
              <p className="text-white/80 text-sm mt-1">
                {profile.gender === 'female' ? 'Feminino' : 'Masculino'}
              </p>
            </div>
          </div>

          {/* Stats rápidas */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{progress.currentStreak}</p>
              <p className="text-white/80 text-xs mt-1">Dias seguidos</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{progress.totalWorkouts}</p>
              <p className="text-white/80 text-xs mt-1">Treinos</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{progress.bestStreak}</p>
              <p className="text-white/80 text-xs mt-1">Melhor série</p>
            </div>
          </div>
        </div>

        {/* Objetivo */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#5B8DEF]/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-[#5B8DEF]" />
            </div>
            <h3 className="font-semibold text-[#2E2E2E]">Objetivo</h3>
          </div>
          {isEditing ? (
            <select
              value={editedProfile?.goal ?? 'lose-weight'}
              onChange={(e) => setEditedProfile(prev => prev ? {...prev, goal: e.target.value as any} : null)}
              className="w-full bg-[#F6F7F8] text-[#2E2E2E] rounded-xl px-4 py-3 border-2 border-transparent focus:border-[#5B8DEF] outline-none"
            >
              <option value="lose-weight">Perder Peso</option>
              <option value="gain-muscle">Ganhar Massa</option>
              <option value="maintain">Manter Forma</option>
              <option value="improve-health">Melhorar Saúde</option>
            </select>
          ) : (
            <p className="text-[#2E2E2E]/70">{goalLabels[profile.goal]}</p>
          )}
        </div>

        {/* Equipamentos */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#9DB8A0]/20 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-[#9DB8A0]" />
            </div>
            <h3 className="font-semibold text-[#2E2E2E]">Equipamentos</h3>
          </div>
          {isEditing ? (
            <select
              value={editedProfile?.equipment ?? 'none'}
              onChange={(e) => setEditedProfile(prev => prev ? {...prev, equipment: e.target.value as any} : null)}
              className="w-full bg-[#F6F7F8] text-[#2E2E2E] rounded-xl px-4 py-3 border-2 border-transparent focus:border-[#5B8DEF] outline-none"
            >
              <option value="none">Sem Equipamento</option>
              <option value="basic">Básico (halteres, faixas)</option>
              <option value="full-gym">Academia Completa</option>
            </select>
          ) : (
            <p className="text-[#2E2E2E]/70">{equipmentLabels[profile.equipment]}</p>
          )}
        </div>

        {/* Tempo de treino */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#B7A6D8]/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-[#B7A6D8]" />
            </div>
            <h3 className="font-semibold text-[#2E2E2E]">Tempo de Treino</h3>
          </div>
          {isEditing ? (
            <select
              value={editedProfile?.trainingTime ?? '30-45'}
              onChange={(e) => setEditedProfile(prev => prev ? {...prev, trainingTime: e.target.value as any} : null)}
              className="w-full bg-[#F6F7F8] text-[#2E2E2E] rounded-xl px-4 py-3 border-2 border-transparent focus:border-[#5B8DEF] outline-none"
            >
              <option value="15-30">15-30 minutos</option>
              <option value="30-45">30-45 minutos</option>
              <option value="45-60">45-60 minutos</option>
              <option value="60+">Mais de 60 minutos</option>
            </select>
          ) : (
            <p className="text-[#2E2E2E]/70">{profile.trainingTime} minutos</p>
          )}
        </div>

        {/* Ciclo menstrual (apenas para mulheres) */}
        {profile.gender === 'female' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#E8CFC8]/40 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#E8CFC8]" />
              </div>
              <h3 className="font-semibold text-[#2E2E2E]">Última Menstruação</h3>
            </div>
            {isEditing ? (
              <input
                type="date"
                value={lastPeriodDate}
                onChange={(e) => setLastPeriodDate(e.target.value)}
                className="w-full bg-[#F6F7F8] text-[#2E2E2E] rounded-xl px-4 py-3 border-2 border-transparent focus:border-[#5B8DEF] outline-none"
              />
            ) : (
              <p className="text-[#2E2E2E]/70">
                {profile.lastPeriodDate 
                  ? new Date(profile.lastPeriodDate).toLocaleDateString('pt-BR')
                  : 'Não informado'}
              </p>
            )}
          </div>
        )}

        {/* Assistente de IA */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#5B8DEF]/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-[#5B8DEF]" />
            </div>
            <h3 className="font-semibold text-[#2E2E2E]">Assistente de IA</h3>
          </div>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="Pergunte sobre treinos, dieta, motivação..."
                className="flex-1 bg-[#F6F7F8] text-[#2E2E2E] rounded-xl px-4 py-3 border-2 border-transparent focus:border-[#5B8DEF] outline-none"
                onKeyPress={(e) => e.key === 'Enter' && askAI()}
              />
              <Button
                onClick={askAI}
                disabled={isLoading || !aiQuestion.trim()}
                className="bg-[#5B8DEF] hover:bg-[#4A7BC7] text-white px-4 py-3 rounded-xl"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            {aiResponse && (
              <div className="bg-[#F6F7F8] rounded-xl p-4">
                <p className="text-[#2E2E2E] text-sm leading-relaxed">{aiResponse}</p>
              </div>
            )}
            {isLoading && (
              <div className="bg-[#F6F7F8] rounded-xl p-4">
                <p className="text-[#2E2E2E]/60 text-sm animate-pulse">Pensando na melhor resposta...</p>
              </div>
            )}
          </div>
        </div>

        {/* Notificações */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#5B8DEF]/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-[#5B8DEF]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#2E2E2E]">Notificações</h3>
                <p className="text-xs text-[#2E2E2E]/60">Lembretes de treino</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-[#2E2E2E]/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5B8DEF]"></div>
            </label>
          </div>
        </div>

        {/* Botão de logout */}
        <Button
          onClick={() => {
            if (confirm('Deseja realmente sair?')) {
              localStorage.clear();
              router.push('/');
            }
          }}
          variant="outline"
          className="w-full border-2 border-[#2E2E2E]/20 text-[#2E2E2E] hover:bg-[#2E2E2E]/5 font-semibold py-6 rounded-2xl"
        >
          Sair da Conta
        </Button>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#2E2E2E]/10 shadow-lg">
        <div className="flex items-center justify-around p-4">
          <button 
            onClick={() => router.push('/home')}
            className="flex flex-col items-center gap-1 text-[#2E2E2E]/40 hover:text-[#5B8DEF] transition-colors"
          >
            <Activity className="w-6 h-6" />
            <span className="text-xs font-medium">Início</span>
          </button>
          <button 
            onClick={() => router.push('/progress')}
            className="flex flex-col items-center gap-1 text-[#2E2E2E]/40 hover:text-[#5B8DEF] transition-colors"
          >
            <TrendingUp className="w-6 h-6" />
            <span className="text-xs font-medium">Progresso</span>
          </button>
          <button 
            onClick={() => router.push('/agenda')}
            className="flex flex-col items-center gap-1 text-[#2E2E2E]/40 hover:text-[#5B8DEF] transition-colors"
          >
            <Calendar className="w-6 h-6" />
            <span className="text-xs font-medium">Agenda</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-[#5B8DEF]">
            <Heart className="w-6 h-6" />
            <span className="text-xs font-medium">Perfil</span>
          </button>
        </div>
      </div>
    </div>
  );
}
