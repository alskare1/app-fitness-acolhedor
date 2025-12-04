'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Heart, TrendingUp, Award, Calendar, Sparkles, Activity, Flame, Target, Droplet, ChevronRight } from 'lucide-react';
import { getUserProfile, getTodayCheckIn, saveDailyCheckIn, saveWorkout, getWorkouts, getProgress } from '@/lib/storage';
import { calculateMenstrualPhase, getMenstrualPhaseInfo } from '@/lib/cycle-tracker';
import { generateWorkout } from '@/lib/openai';
import { UserProfile, Feeling, FemaleFeeling, MaleFeeling } from '@/lib/types';

const femaleFeelingsOptions: { value: FemaleFeeling; label: string; emoji: string }[] = [
  { value: 'cramps', label: 'Cólica', emoji: '😣' },
  { value: 'bloated', label: 'Inchada', emoji: '😔' },
  { value: 'no-energy', label: 'Sem energia', emoji: '😴' },
  { value: 'stable', label: 'Estável', emoji: '😊' },
  { value: 'energized', label: 'Disposta', emoji: '😄' },
  { value: 'max-energy', label: 'Energia máxima', emoji: '🔥' }
];

const maleFeelingsOptions: { value: MaleFeeling; label: string; emoji: string }[] = [
  { value: 'mentally-tired', label: 'Cansado mentalmente', emoji: '🧠' },
  { value: 'physically-tired', label: 'Cansado fisicamente', emoji: '😓' },
  { value: 'stressed', label: 'Estressado', emoji: '😤' },
  { value: 'unmotivated', label: 'Desmotivado', emoji: '😐' },
  { value: 'stable', label: 'Estável', emoji: '😊' },
  { value: 'max-motivation', label: 'Motivação máxima', emoji: '💪' }
];

interface WeekDay {
  day: string;
  date: number;
  status: 'completed' | 'rest' | 'pending' | 'today';
  workoutType?: string;
}

// Função para determinar o tipo de dia baseado em múltiplos fatores
function getDayType(
  feeling: Feeling | null,
  menstrualPhase: string | undefined,
  weekWorkouts: number,
  gender: 'male' | 'female'
): { name: string; description: string; color: string } {
  // Para mulheres, considerar fase menstrual
  if (gender === 'female' && menstrualPhase) {
    if (menstrualPhase === 'menstrual' || feeling === 'cramps' || feeling === 'bloated') {
      return {
        name: 'Dia de Recuperação',
        description: 'Seu corpo pede descanso ativo. Vamos focar em movimentos suaves e alongamentos.',
        color: 'from-[#E8CFC8] to-[#B7A6D8]'
      };
    }
    if (menstrualPhase === 'follicular' || feeling === 'max-energy' || feeling === 'energized') {
      return {
        name: 'Dia de Força',
        description: 'Você está no seu auge! Hora de desafiar seus limites com treino intenso.',
        color: 'from-[#9DB8A0] to-[#5B8DEF]'
      };
    }
    if (menstrualPhase === 'ovulatory') {
      return {
        name: 'Dia de Fluxo',
        description: 'Energia equilibrada. Treino moderado com foco em resistência e cardio.',
        color: 'from-[#5B8DEF] to-[#B7A6D8]'
      };
    }
  }

  // Para homens ou quando não há fase menstrual
  if (feeling === 'max-motivation' || feeling === 'max-energy') {
    return {
      name: 'Dia de Força',
      description: 'Motivação máxima! Vamos aproveitar essa energia para um treino intenso.',
      color: 'from-[#9DB8A0] to-[#5B8DEF]'
    };
  }

  if (feeling === 'mentally-tired' || feeling === 'physically-tired' || feeling === 'stressed' || feeling === 'no-energy') {
    return {
      name: 'Dia de Recuperação',
      description: 'Seu corpo precisa de cuidado. Treino leve com foco em bem-estar.',
      color: 'from-[#E8CFC8] to-[#B7A6D8]'
    };
  }

  // Considerar constância da semana
  if (weekWorkouts >= 4) {
    return {
      name: 'Dia de Recuperação',
      description: 'Você está arrasando! Que tal um treino mais leve para recuperar?',
      color: 'from-[#E8CFC8] to-[#B7A6D8]'
    };
  }

  // Padrão: Dia de Fluxo
  return {
    name: 'Dia de Fluxo',
    description: 'Equilíbrio perfeito entre desafio e cuidado. Treino moderado e eficiente.',
    color: 'from-[#5B8DEF] to-[#B7A6D8]'
  };
}

export default function HomePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [selectedFeeling, setSelectedFeeling] = useState<Feeling | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [stats, setStats] = useState({ streak: 0, totalWorkouts: 0, calories: 0, weekWorkouts: 0 });
  const [weekDays, setWeekDays] = useState<WeekDay[]>([]);
  const [menstrualInfo, setMenstrualInfo] = useState<any>(null);
  const [todayCheckIn, setTodayCheckIn] = useState<any>(null);
  const [dayType, setDayType] = useState<{ name: string; description: string; color: string } | null>(null);

  useEffect(() => {
    const userProfile = getUserProfile();
    if (!userProfile) {
      router.push('/onboarding');
      return;
    }
    setProfile(userProfile);

    // Carregar estatísticas
    const progress = getProgress();
    const workouts = getWorkouts();
    
    // Calcular treinos da semana
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const weekWorkouts = workouts.filter(w => {
      const workoutDate = new Date(w.date);
      return workoutDate >= startOfWeek;
    });

    setStats({
      streak: progress.currentStreak,
      totalWorkouts: progress.totalWorkouts,
      calories: workouts.reduce((acc, w) => acc + (w.exercises.length * 50), 0),
      weekWorkouts: weekWorkouts.length
    });

    // Gerar prévia da semana
    generateWeekPreview(workouts);

    // Calcular fase menstrual se for mulher
    let menstrualPhase;
    if (userProfile.gender === 'female' && userProfile.lastPeriodDate) {
      menstrualPhase = calculateMenstrualPhase(userProfile.lastPeriodDate);
      const phaseInfo = getMenstrualPhaseInfo(menstrualPhase);
      setMenstrualInfo({ phase: menstrualPhase, ...phaseInfo });
    }

    // Verificar se já fez check-in hoje
    const checkIn = getTodayCheckIn();
    setTodayCheckIn(checkIn);
    
    if (!checkIn) {
      setShowCheckIn(true);
    } else {
      // Calcular tipo de dia baseado no check-in
      const type = getDayType(checkIn.feeling, menstrualPhase, weekWorkouts.length, userProfile.gender);
      setDayType(type);
    }
  }, [router]);

  const generateWeekPreview = (workouts: any[]) => {
    const today = new Date();
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const week: WeekDay[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - today.getDay() + i);
      
      const dateStr = date.toISOString().split('T')[0];
      const hasWorkout = workouts.some(w => w.date.startsWith(dateStr) && w.completed);
      
      const isToday = date.toDateString() === today.toDateString();
      const isPast = date < today && !isToday;
      
      let status: 'completed' | 'rest' | 'pending' | 'today' = 'pending';
      if (isToday) status = 'today';
      else if (hasWorkout) status = 'completed';
      else if (isPast) status = 'rest';

      week.push({
        day: days[i],
        date: date.getDate(),
        status,
        workoutType: hasWorkout ? 'Treino' : i === 0 || i === 6 ? 'Descanso' : 'Pendente'
      });
    }

    setWeekDays(week);
  };

  const handleCheckIn = async () => {
    if (!selectedFeeling || !profile) return;

    setIsGenerating(true);

    try {
      // Calcular fase menstrual se for mulher
      let menstrualPhase;
      if (profile.gender === 'female' && profile.lastPeriodDate) {
        menstrualPhase = calculateMenstrualPhase(profile.lastPeriodDate);
      }

      // Salvar check-in
      saveDailyCheckIn({
        date: new Date().toISOString().split('T')[0],
        feeling: selectedFeeling,
        menstrualPhase
      });

      // Gerar treino via OpenAI
      const workoutData = await generateWorkout({
        gender: profile.gender,
        feeling: selectedFeeling,
        goal: profile.goal,
        equipment: profile.equipment,
        trainingTime: profile.trainingTime,
        trainingLocation: profile.trainingLocation,
        menstrualPhase
      });

      // Salvar treino
      const workout = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        exercises: workoutData.exercises,
        totalDuration: workoutData.totalDuration,
        feeling: selectedFeeling,
        completed: false,
        emotionalMessage: workoutData.emotionalMessage,
        mealSuggestion: workoutData.mealSuggestion
      };

      saveWorkout(workout);

      // Redirecionar para treino
      router.push(`/workout?id=${workout.id}`);
    } catch (error) {
      console.error('Erro ao gerar treino:', error);
      alert('Erro ao gerar treino. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#F6F7F8] flex items-center justify-center">
        <div className="text-[#2E2E2E] text-xl animate-pulse">Carregando...</div>
      </div>
    );
  }

  const feelingsOptions = profile.gender === 'female' ? femaleFeelingsOptions : maleFeelingsOptions;

  // Check-in diário
  if (showCheckIn) {
    return (
      <div className="min-h-screen bg-[#F6F7F8] p-6 flex items-center justify-center">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#B7A6D8]/20 rounded-full">
              <Heart className="w-10 h-10 text-[#B7A6D8]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#2E2E2E]">
                Como você está se sentindo hoje?
              </h1>
              <p className="text-[#2E2E2E]/70 mt-2">
                Vamos criar o treino perfeito para o seu momento
              </p>
            </div>

            {/* Fase menstrual (se aplicável) */}
            {menstrualInfo && (
              <div className="bg-[#E8CFC8]/30 rounded-2xl p-4">
                <div className="flex items-center gap-2 justify-center mb-2">
                  <Droplet className="w-4 h-4 text-[#E8CFC8]" />
                  <p className="text-[#2E2E2E] text-sm font-medium">
                    {menstrualInfo.name}
                  </p>
                </div>
                <p className="text-[#2E2E2E]/70 text-xs">
                  {menstrualInfo.workoutTips}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {feelingsOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedFeeling(option.value)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                  selectedFeeling === option.value
                    ? 'bg-[#5B8DEF] text-white shadow-xl scale-105'
                    : 'bg-white text-[#2E2E2E] hover:bg-[#5B8DEF]/10 shadow-sm'
                }`}
              >
                <span className="text-3xl">{option.emoji}</span>
                <span className="font-semibold text-lg">{option.label}</span>
              </button>
            ))}
          </div>

          <Button
            onClick={handleCheckIn}
            disabled={!selectedFeeling || isGenerating}
            size="lg"
            className="w-full bg-[#5B8DEF] text-white hover:bg-[#5B8DEF]/90 font-semibold text-lg py-6 rounded-2xl shadow-xl disabled:opacity-50"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 animate-spin" />
                Criando seu treino...
              </span>
            ) : (
              'Gerar meu treino'
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Dashboard principal
  return (
    <div className="min-h-screen bg-[#F6F7F8] pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#2E2E2E]">
              FlowFit
            </h1>
            <p className="text-[#2E2E2E]/60 text-sm">Olá, {profile.name || 'Atleta'}!</p>
          </div>
          <button
            onClick={() => router.push('/profile')}
            className="w-10 h-10 rounded-full bg-[#5B8DEF]/10 flex items-center justify-center hover:bg-[#5B8DEF]/20 transition-all"
          >
            <Heart className="w-5 h-5 text-[#5B8DEF]" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Card do Tipo de Dia - SUBSTITUI "Exercícios Populares" */}
        {dayType && (
          <div className={`bg-gradient-to-br ${dayType.color} rounded-3xl p-6 shadow-lg`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 mb-3">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span className="text-white text-xs font-medium">Treino Personalizado</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {dayType.name}
                </h2>
                <p className="text-white/90 text-sm leading-relaxed">
                  {dayType.description}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowCheckIn(true)}
              size="lg"
              className="w-full bg-white text-[#5B8DEF] hover:bg-white/90 font-semibold rounded-xl shadow-md"
            >
              Iniciar treino ideal de hoje
            </Button>
          </div>
        )}

        {/* Grid de estatísticas */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#9DB8A0]/20 flex items-center justify-center mb-3">
              <Flame className="w-5 h-5 text-[#9DB8A0]" />
            </div>
            <p className="text-2xl font-bold text-[#2E2E2E]">{stats.streak}</p>
            <p className="text-[#2E2E2E]/60 text-xs mt-1">Dias seguidos</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#B7A6D8]/20 flex items-center justify-center mb-3">
              <Target className="w-5 h-5 text-[#B7A6D8]" />
            </div>
            <p className="text-2xl font-bold text-[#2E2E2E]">{stats.totalWorkouts}</p>
            <p className="text-[#2E2E2E]/60 text-xs mt-1">Treinos</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#5B8DEF]/20 flex items-center justify-center mb-3">
              <Award className="w-5 h-5 text-[#5B8DEF]" />
            </div>
            <p className="text-2xl font-bold text-[#2E2E2E]">{stats.calories}</p>
            <p className="text-[#2E2E2E]/60 text-xs mt-1">Calorias</p>
          </div>
        </div>

        {/* Prévia da Semana */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#2E2E2E]">Semana em Visão Rápida</h3>
            <button 
              onClick={() => router.push('/agenda')}
              className="text-[#5B8DEF] text-sm font-medium flex items-center gap-1"
            >
              Ver agenda
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Dias da semana */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((day, index) => (
              <div key={index} className="flex flex-col items-center">
                <span className="text-xs text-[#2E2E2E]/60 mb-2">{day.day}</span>
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                    ${day.status === 'today' ? 'bg-[#5B8DEF] text-white ring-4 ring-[#5B8DEF]/20' : ''}
                    ${day.status === 'completed' ? 'bg-[#9DB8A0] text-white' : ''}
                    ${day.status === 'rest' ? 'bg-[#2E2E2E]/10 text-[#2E2E2E]/40' : ''}
                    ${day.status === 'pending' ? 'bg-[#F6F7F8] text-[#2E2E2E]/60 border-2 border-[#2E2E2E]/10' : ''}
                  `}
                >
                  {day.date}
                </div>
                {day.status === 'completed' && (
                  <div className="w-1 h-1 rounded-full bg-[#9DB8A0] mt-1" />
                )}
              </div>
            ))}
          </div>

          {/* Barra de progresso semanal */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#2E2E2E]/60">Progresso da semana</span>
              <span className="font-semibold text-[#5B8DEF]">{stats.weekWorkouts}/5 treinos</span>
            </div>
            <div className="w-full h-2 bg-[#F6F7F8] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#5B8DEF] to-[#9DB8A0] rounded-full transition-all"
                style={{ width: `${(stats.weekWorkouts / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card do Ciclo Menstrual (apenas para mulheres) */}
        {menstrualInfo && (
          <div className="bg-gradient-to-br from-[#E8CFC8]/40 to-[#B7A6D8]/40 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center">
                  <Droplet className="w-5 h-5 text-[#E8CFC8]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2E2E2E]">{menstrualInfo.name}</h3>
                  <p className="text-xs text-[#2E2E2E]/60">Fase do ciclo</p>
                </div>
              </div>
              <button 
                onClick={() => router.push('/profile')}
                className="text-[#5B8DEF] text-xs font-medium"
              >
                Editar
              </button>
            </div>
            <div className="bg-white/60 rounded-xl p-3">
              <p className="text-sm text-[#2E2E2E]/80 mb-2">
                💡 {menstrualInfo.workoutTips}
              </p>
              <p className="text-xs text-[#2E2E2E]/60">
                {menstrualInfo.description}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#2E2E2E]/10 shadow-lg">
        <div className="flex items-center justify-around p-4">
          <button className="flex flex-col items-center gap-1 text-[#5B8DEF]">
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
