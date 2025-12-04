'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward, CheckCircle, X, ChevronLeft } from 'lucide-react';
import { getWorkouts, updateWorkout, saveProgress, getProgress } from '@/lib/storage';
import { Workout, Exercise } from '@/lib/types';

export default function WorkoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workoutId = searchParams.get('id');

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Garantir que o componente está montado antes de fazer navegação
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!workoutId) {
      router.push('/home');
      return;
    }

    const workouts = getWorkouts();
    const foundWorkout = workouts.find(w => w.id === workoutId);
    
    if (!foundWorkout) {
      router.push('/home');
      return;
    }

    setWorkout(foundWorkout);
    setTimeRemaining(foundWorkout.exercises[0]?.duration || 0);
  }, [workoutId, router, mounted]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isPlaying, timeRemaining]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNextExercise = () => {
    if (!workout) return;

    if (currentExerciseIndex < workout.exercises.length - 1) {
      const nextIndex = currentExerciseIndex + 1;
      setCurrentExerciseIndex(nextIndex);
      setTimeRemaining(workout.exercises[nextIndex].duration);
      setIsPlaying(false);
    } else {
      handleCompleteWorkout();
    }
  };

  const handleCompleteWorkout = () => {
    if (!workout) return;

    // Atualizar workout como completo
    updateWorkout(workout.id, {
      completed: true,
      completedAt: new Date().toISOString()
    });

    // Atualizar progresso
    const progress = getProgress();
    progress.totalWorkouts += 1;
    progress.currentStreak += 1;
    if (progress.currentStreak > progress.longestStreak) {
      progress.longestStreak = progress.currentStreak;
    }
    saveProgress(progress);

    setShowCompletion(true);
  };

  const handleSkipWorkout = () => {
    if (mounted) {
      router.push('/home');
    }
  };

  if (!mounted || !workout) {
    return (
      <div className="min-h-screen bg-[#F6F7F8] flex items-center justify-center">
        <div className="text-[#2E2E2E] text-xl animate-pulse">Carregando treino...</div>
      </div>
    );
  }

  const currentExercise = workout.exercises[currentExerciseIndex];
  const progress = ((currentExerciseIndex + 1) / workout.exercises.length) * 100;

  // Tela de conclusão - Design ULTRAFIT
  if (showCompletion) {
    return (
      <div className="min-h-screen bg-[#F6F7F8] p-6 flex items-center justify-center">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="animate-in zoom-in duration-500">
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-[#9DB8A0] to-[#B7A6D8] flex items-center justify-center shadow-2xl">
              <CheckCircle className="w-16 h-16 text-white" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-[#2E2E2E]">
              Parabéns! 🎉
            </h1>
            <p className="text-[#2E2E2E]/70 text-lg">
              Você completou seu treino
            </p>
            <div className="bg-white rounded-2xl p-6 space-y-4 shadow-sm">
              <p className="text-[#2E2E2E] text-base leading-relaxed">
                {workout.emotionalMessage}
              </p>
            </div>
          </div>

          {workout.mealSuggestion && (
            <div className="bg-[#E8CFC8]/30 rounded-2xl p-6 space-y-2">
              <h3 className="text-[#2E2E2E] font-semibold">Sugestão de refeição:</h3>
              <p className="text-[#2E2E2E]/70 text-sm">
                {workout.mealSuggestion}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={() => router.push('/progress')}
              size="lg"
              className="w-full bg-[#5B8DEF] text-white hover:bg-[#5B8DEF]/90 font-semibold text-lg py-6 rounded-2xl shadow-lg"
            >
              Ver meu progresso
            </Button>
            <Button
              onClick={() => router.push('/home')}
              variant="ghost"
              size="lg"
              className="w-full text-[#2E2E2E]/70 hover:bg-[#2E2E2E]/5"
            >
              Voltar ao início
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Tela de treino - Design ULTRAFIT
  return (
    <div className="min-h-screen bg-[#F6F7F8] flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="p-6 flex items-center justify-between">
          <button
            onClick={handleSkipWorkout}
            className="w-10 h-10 rounded-full bg-[#2E2E2E]/5 flex items-center justify-center hover:bg-[#2E2E2E]/10 transition-all"
          >
            <ChevronLeft className="w-6 h-6 text-[#2E2E2E]" />
          </button>
          <div className="text-[#2E2E2E] text-sm font-medium">
            Exercício {currentExerciseIndex + 1} de {workout.exercises.length}
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Progress bar */}
        <div className="px-6 pb-4">
          <div className="h-2 bg-[#2E2E2E]/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#5B8DEF] to-[#B7A6D8] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Exercise content */}
      <div className="flex-1 p-6 flex flex-col items-center justify-center space-y-8">
        {/* Timer Circle - Estilo ULTRAFIT */}
        <div className="relative">
          <svg className="w-64 h-64 transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="#E8CFC8"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${(timeRemaining / currentExercise.duration) * 754} 754`}
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5B8DEF" />
                <stop offset="100%" stopColor="#B7A6D8" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl font-bold text-[#2E2E2E]">
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-[#2E2E2E]/60 text-sm mt-2">
                {currentExercise.sets && currentExercise.reps
                  ? `${currentExercise.sets}x${currentExercise.reps}`
                  : 'minutos'}
              </div>
            </div>
          </div>
        </div>

        {/* Exercise info */}
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-3xl font-bold text-[#2E2E2E]">
            {currentExercise.name}
          </h2>
          <p className="text-[#2E2E2E]/70 leading-relaxed">
            {currentExercise.description}
          </p>
          <div className="inline-block bg-[#5B8DEF]/10 px-4 py-2 rounded-full">
            <span className="text-[#5B8DEF] text-sm font-medium">
              Intensidade: {currentExercise.intensity === 'low' ? 'Leve' : currentExercise.intensity === 'medium' ? 'Moderada' : 'Alta'}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 space-y-4 bg-white shadow-lg">
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={handlePlayPause}
            size="lg"
            className="w-20 h-20 rounded-full bg-gradient-to-br from-[#5B8DEF] to-[#B7A6D8] text-white hover:opacity-90 shadow-xl"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8 ml-1" />
            )}
          </Button>
        </div>

        <Button
          onClick={handleNextExercise}
          size="lg"
          variant="ghost"
          className="w-full text-[#2E2E2E]/70 hover:bg-[#2E2E2E]/5"
        >
          {currentExerciseIndex === workout.exercises.length - 1 ? (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Finalizar treino
            </>
          ) : (
            <>
              <SkipForward className="w-5 h-5 mr-2" />
              Próximo exercício
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
