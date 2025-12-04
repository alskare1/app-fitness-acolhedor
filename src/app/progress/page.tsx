'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, TrendingUp, Award, Flame, Target, Calendar, Activity, Heart, Zap } from 'lucide-react';
import { getProgress, getWorkouts, getUserProfile } from '@/lib/storage';
import { UserProfile } from '@/lib/types';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  unlocked: boolean;
  color: string;
}

export default function ProgressPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState({ currentStreak: 0, totalWorkouts: 0, bestStreak: 0 });
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<number[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [totalCalories, setTotalCalories] = useState(0);

  useEffect(() => {
    const userProfile = getUserProfile();
    if (!userProfile) {
      router.push('/onboarding');
      return;
    }
    setProfile(userProfile);

    const userProgress = getProgress();
    setProgress(userProgress);

    const userWorkouts = getWorkouts();
    setWorkouts(userWorkouts);

    // Calcular calorias totais
    const calories = userWorkouts.reduce((acc, w) => acc + (w.exercises.length * 50), 0);
    setTotalCalories(calories);

    // Gerar dados semanais
    generateWeeklyData(userWorkouts);

    // Gerar conquistas
    generateAchievements(userProgress, userWorkouts);
  }, [router]);

  const generateWeeklyData = (workouts: any[]) => {
    const today = new Date();
    const weekData = [0, 0, 0, 0, 0, 0, 0];

    workouts.forEach(workout => {
      const workoutDate = new Date(workout.date);
      const daysDiff = Math.floor((today.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff >= 0 && daysDiff < 7) {
        weekData[6 - daysDiff]++;
      }
    });

    setWeeklyData(weekData);
  };

  const generateAchievements = (progress: any, workouts: any[]) => {
    const allAchievements: Achievement[] = [
      {
        id: 'first-workout',
        title: 'Primeiro Passo',
        description: 'Complete seu primeiro treino',
        icon: Zap,
        unlocked: workouts.length >= 1,
        color: '#5B8DEF'
      },
      {
        id: 'streak-3',
        title: 'Consistência',
        description: '3 dias seguidos de treino',
        icon: Flame,
        unlocked: progress.currentStreak >= 3,
        color: '#9DB8A0'
      },
      {
        id: 'streak-7',
        title: 'Semana Completa',
        description: '7 dias seguidos de treino',
        icon: Award,
        unlocked: progress.currentStreak >= 7,
        color: '#B7A6D8'
      },
      {
        id: 'workouts-10',
        title: 'Dedicação',
        description: 'Complete 10 treinos',
        icon: Target,
        unlocked: progress.totalWorkouts >= 10,
        color: '#5B8DEF'
      },
      {
        id: 'workouts-25',
        title: 'Atleta',
        description: 'Complete 25 treinos',
        icon: Activity,
        unlocked: progress.totalWorkouts >= 25,
        color: '#9DB8A0'
      },
      {
        id: 'workouts-50',
        title: 'Lenda',
        description: 'Complete 50 treinos',
        icon: Award,
        unlocked: progress.totalWorkouts >= 50,
        color: '#E8CFC8'
      }
    ];

    setAchievements(allAchievements);
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#F6F7F8] flex items-center justify-center">
        <div className="text-[#2E2E2E] text-xl animate-pulse">Carregando...</div>
      </div>
    );
  }

  const maxWeeklyWorkouts = Math.max(...weeklyData, 1);
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

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
            <h1 className="text-2xl font-bold text-[#2E2E2E]">Progresso</h1>
            <div className="w-10 h-10" />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Card de resumo */}
        <div className="bg-gradient-to-br from-[#5B8DEF] to-[#B7A6D8] rounded-3xl p-6 shadow-lg text-white">
          <h2 className="text-lg font-semibold mb-4">Seu Progresso</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5" />
                <span className="text-sm opacity-80">Sequência</span>
              </div>
              <p className="text-3xl font-bold">{progress.currentStreak}</p>
              <p className="text-xs opacity-80 mt-1">dias seguidos</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5" />
                <span className="text-sm opacity-80">Total</span>
              </div>
              <p className="text-3xl font-bold">{progress.totalWorkouts}</p>
              <p className="text-xs opacity-80 mt-1">treinos</p>
            </div>
          </div>
        </div>

        {/* Estatísticas adicionais */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#9DB8A0]/20 flex items-center justify-center mb-3">
              <Award className="w-5 h-5 text-[#9DB8A0]" />
            </div>
            <p className="text-2xl font-bold text-[#2E2E2E]">{progress.bestStreak}</p>
            <p className="text-[#2E2E2E]/60 text-xs mt-1">Melhor sequência</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#E8CFC8]/40 flex items-center justify-center mb-3">
              <Flame className="w-5 h-5 text-[#E8CFC8]" />
            </div>
            <p className="text-2xl font-bold text-[#2E2E2E]">{totalCalories}</p>
            <p className="text-[#2E2E2E]/60 text-xs mt-1">Calorias gastas</p>
          </div>
        </div>

        {/* Gráfico semanal */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-lg font-bold text-[#2E2E2E] mb-4">Treinos da Semana</h3>
          
          <div className="flex items-end justify-between gap-2 h-40 mb-3">
            {weeklyData.map((count, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center h-32">
                  <div
                    className="w-full bg-gradient-to-t from-[#5B8DEF] to-[#B7A6D8] rounded-t-lg transition-all"
                    style={{ 
                      height: `${(count / maxWeeklyWorkouts) * 100}%`,
                      minHeight: count > 0 ? '20%' : '0%'
                    }}
                  />
                </div>
                <span className="text-xs text-[#2E2E2E]/60">{weekDays[index]}</span>
              </div>
            ))}
          </div>

          <div className="bg-[#F6F7F8] rounded-xl p-3 flex items-center justify-between">
            <span className="text-sm text-[#2E2E2E]/60">Total esta semana</span>
            <span className="text-lg font-bold text-[#5B8DEF]">
              {weeklyData.reduce((a, b) => a + b, 0)} treinos
            </span>
          </div>
        </div>

        {/* Medalhas e Conquistas */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-[#2E2E2E]">Medalhas e Conquistas</h3>
          
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div
                  key={achievement.id}
                  className={`
                    rounded-2xl p-4 shadow-sm transition-all
                    ${achievement.unlocked 
                      ? 'bg-white' 
                      : 'bg-[#2E2E2E]/5 opacity-50'
                    }
                  `}
                >
                  <div 
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center mb-3
                      ${achievement.unlocked ? 'bg-opacity-20' : 'bg-[#2E2E2E]/10'}
                    `}
                    style={{ 
                      backgroundColor: achievement.unlocked 
                        ? `${achievement.color}33` 
                        : undefined 
                    }}
                  >
                    <Icon 
                      className="w-6 h-6" 
                      style={{ 
                        color: achievement.unlocked 
                          ? achievement.color 
                          : '#2E2E2E40' 
                      }}
                    />
                  </div>
                  <h4 className="font-semibold text-[#2E2E2E] text-sm mb-1">
                    {achievement.title}
                  </h4>
                  <p className="text-xs text-[#2E2E2E]/60">
                    {achievement.description}
                  </p>
                  {achievement.unlocked && (
                    <div className="mt-2 inline-flex items-center gap-1 bg-[#9DB8A0]/20 text-[#9DB8A0] text-xs font-medium px-2 py-1 rounded-full">
                      ✓ Desbloqueada
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Histórico recente */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-[#2E2E2E]">Histórico Recente</h3>
          
          {workouts.slice(0, 5).map((workout, index) => (
            <div key={workout.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#5B8DEF]/20 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-[#5B8DEF]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#2E2E2E]">
                      Treino {workouts.length - index}
                    </h4>
                    <p className="text-xs text-[#2E2E2E]/60">
                      {new Date(workout.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                {workout.completed && (
                  <div className="bg-[#9DB8A0]/20 text-[#9DB8A0] text-xs font-medium px-3 py-1 rounded-full">
                    Concluído
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-[#2E2E2E]/60">
                <span>{workout.exercises.length} exercícios</span>
                <span>•</span>
                <span>{workout.totalDuration} min</span>
                <span>•</span>
                <span>~{workout.exercises.length * 50} cal</span>
              </div>
            </div>
          ))}

          {workouts.length === 0 && (
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <div className="w-16 h-16 rounded-full bg-[#5B8DEF]/10 flex items-center justify-center mx-auto mb-3">
                <Activity className="w-8 h-8 text-[#5B8DEF]" />
              </div>
              <p className="text-[#2E2E2E]/60">
                Nenhum treino realizado ainda.
                <br />
                Comece agora!
              </p>
            </div>
          )}
        </div>
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
          <button className="flex flex-col items-center gap-1 text-[#5B8DEF]">
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
          <button 
            onClick={() => router.push('/profile')}
            className="flex flex-col items-center gap-1 text-[#2E2E2E]/40 hover:text-[#5B8DEF] transition-colors"
          >
            <Heart className="w-6 h-6" />
            <span className="text-xs font-medium">Perfil</span>
          </button>
        </div>
      </div>
    </div>
  );
}
