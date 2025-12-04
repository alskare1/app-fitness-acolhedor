'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, ChevronLeft, ChevronRight, Activity, Heart, Droplet } from 'lucide-react';
import { getUserProfile, getWorkouts } from '@/lib/storage';
import { calculateMenstrualPhase, getMenstrualPhaseInfo } from '@/lib/cycle-tracker';
import { UserProfile } from '@/lib/types';

interface DayInfo {
  date: Date;
  isCurrentMonth: boolean;
  hasWorkout: boolean;
  workoutType?: string;
  menstrualPhase?: string;
  isToday: boolean;
}

export default function AgendaPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [days, setDays] = useState<DayInfo[]>([]);

  useEffect(() => {
    const userProfile = getUserProfile();
    if (!userProfile) {
      router.push('/onboarding');
      return;
    }
    setProfile(userProfile);
    generateCalendar(currentDate, userProfile);
  }, [currentDate, router]);

  const generateCalendar = (date: Date, userProfile: UserProfile) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const calendarDays: DayInfo[] = [];
    const workouts = getWorkouts();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const currentDay = new Date(startDate);
      currentDay.setDate(startDate.getDate() + i);
      
      const dateStr = currentDay.toISOString().split('T')[0];
      const hasWorkout = workouts.some(w => w.date.startsWith(dateStr));
      
      let menstrualPhase;
      if (userProfile.gender === 'female' && userProfile.lastPeriodDate) {
        menstrualPhase = calculateMenstrualPhase(userProfile.lastPeriodDate, currentDay);
      }

      const dayInfo: DayInfo = {
        date: currentDay,
        isCurrentMonth: currentDay.getMonth() === month,
        hasWorkout,
        menstrualPhase,
        isToday: currentDay.getTime() === today.getTime()
      };

      calendarDays.push(dayInfo);
    }

    setDays(calendarDays);
  };

  const getMenstrualColor = (phase?: string) => {
    if (!phase) return '';
    switch (phase) {
      case 'menstrual': return 'bg-red-100 border-red-300';
      case 'follicular': return 'bg-green-100 border-green-300';
      case 'ovulation': return 'bg-purple-100 border-purple-300';
      case 'luteal': return 'bg-yellow-100 border-yellow-300';
      default: return '';
    }
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#F6F7F8] flex items-center justify-center">
        <div className="text-[#2E2E2E] text-xl animate-pulse">Carregando...</div>
      </div>
    );
  }

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
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
            <h1 className="text-2xl font-bold text-[#2E2E2E]">Agenda</h1>
            <div className="w-10 h-10" />
          </div>

          {/* Navegação do mês */}
          <div className="flex items-center justify-between">
            <button
              onClick={previousMonth}
              className="w-10 h-10 rounded-full bg-[#F6F7F8] flex items-center justify-center hover:bg-[#5B8DEF]/10 transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-[#2E2E2E]" />
            </button>
            <h2 className="text-lg font-semibold text-[#2E2E2E]">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={nextMonth}
              className="w-10 h-10 rounded-full bg-[#F6F7F8] flex items-center justify-center hover:bg-[#5B8DEF]/10 transition-all"
            >
              <ChevronRight className="w-5 h-5 text-[#2E2E2E]" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendário */}
      <div className="p-6 space-y-4">
        {/* Legenda do ciclo menstrual */}
        {profile.gender === 'female' && profile.lastPeriodDate && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-[#2E2E2E] mb-3">Fases do Ciclo</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-100 border-2 border-red-300" />
                <span className="text-[#2E2E2E]/70">Menstruação</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-100 border-2 border-green-300" />
                <span className="text-[#2E2E2E]/70">Folicular</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-purple-100 border-2 border-purple-300" />
                <span className="text-[#2E2E2E]/70">Ovulação</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-100 border-2 border-yellow-300" />
                <span className="text-[#2E2E2E]/70">Lútea</span>
              </div>
            </div>
          </div>
        )}

        {/* Grid do calendário */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          {/* Dias da semana */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-semibold text-[#2E2E2E]/60 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Dias do mês */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => (
              <div
                key={index}
                className={`
                  aspect-square rounded-xl flex flex-col items-center justify-center relative
                  ${day.isCurrentMonth ? 'text-[#2E2E2E]' : 'text-[#2E2E2E]/30'}
                  ${day.isToday ? 'bg-[#5B8DEF] text-white font-bold' : ''}
                  ${day.menstrualPhase && !day.isToday ? getMenstrualColor(day.menstrualPhase) : ''}
                  ${!day.isToday && !day.menstrualPhase ? 'hover:bg-[#F6F7F8]' : ''}
                  transition-all cursor-pointer border-2 border-transparent
                `}
              >
                <span className="text-sm">{day.date.getDate()}</span>
                {day.hasWorkout && (
                  <div className={`absolute bottom-1 w-1 h-1 rounded-full ${day.isToday ? 'bg-white' : 'bg-[#5B8DEF]'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Treinos sugeridos para a semana */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-[#2E2E2E]">Treinos Sugeridos</h3>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#5B8DEF]/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#5B8DEF]" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-[#2E2E2E]">Segunda-feira</h4>
                <p className="text-sm text-[#2E2E2E]/60">Treino de Força</p>
              </div>
              <span className="text-xs text-[#2E2E2E]/60">45 min</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#9DB8A0]/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#9DB8A0]" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-[#2E2E2E]">Quarta-feira</h4>
                <p className="text-sm text-[#2E2E2E]/60">Cardio Moderado</p>
              </div>
              <span className="text-xs text-[#2E2E2E]/60">30 min</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#B7A6D8]/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-[#B7A6D8]" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-[#2E2E2E]">Sexta-feira</h4>
                <p className="text-sm text-[#2E2E2E]/60">Yoga & Alongamento</p>
              </div>
              <span className="text-xs text-[#2E2E2E]/60">20 min</span>
            </div>
          </div>
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
          <button 
            onClick={() => router.push('/progress')}
            className="flex flex-col items-center gap-1 text-[#2E2E2E]/40 hover:text-[#5B8DEF] transition-colors"
          >
            <Activity className="w-6 h-6" />
            <span className="text-xs font-medium">Progresso</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-[#5B8DEF]">
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
