import { MenstrualPhase } from './types';

export function calculateMenstrualPhase(lastPeriodDate: string): MenstrualPhase {
  const lastPeriod = new Date(lastPeriodDate);
  const today = new Date();
  const daysSinceLastPeriod = Math.floor((today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24));
  
  // Ciclo médio de 28 dias
  const cycleDay = daysSinceLastPeriod % 28;
  
  if (cycleDay >= 0 && cycleDay <= 5) {
    return 'menstrual'; // Menstruação (dias 1-5)
  } else if (cycleDay >= 6 && cycleDay <= 13) {
    return 'follicular'; // Fase folicular (dias 6-13)
  } else if (cycleDay >= 14 && cycleDay <= 16) {
    return 'ovulation'; // Ovulação (dias 14-16)
  } else {
    return 'luteal'; // Fase lútea (dias 17-28)
  }
}

export function getMenstrualPhaseInfo(phase: MenstrualPhase): {
  name: string;
  description: string;
  workoutTips: string;
} {
  const phaseInfo = {
    menstrual: {
      name: 'Menstruação',
      description: 'Seu corpo está em um período de renovação. É normal sentir mais cansaço.',
      workoutTips: 'Treinos leves como alongamento, yoga ou caminhada são perfeitos agora.'
    },
    follicular: {
      name: 'Fase Folicular',
      description: 'Sua energia está aumentando! Aproveite esse momento.',
      workoutTips: 'Ótimo período para treinos mais intensos e desafiadores.'
    },
    ovulation: {
      name: 'Ovulação',
      description: 'Você está no pico de energia! Aproveite ao máximo.',
      workoutTips: 'Momento ideal para treinos de alta intensidade e novos desafios.'
    },
    luteal: {
      name: 'Fase Lútea',
      description: 'Seu corpo está se preparando para o próximo ciclo.',
      workoutTips: 'Mantenha treinos moderados e ouça seu corpo com carinho.'
    }
  };

  return phaseInfo[phase];
}

export function getNotificationMessage(phase: MenstrualPhase): string {
  const messages = {
    menstrual: 'Que tal um alongamento suave hoje? Seu corpo vai agradecer 💜',
    follicular: 'Você está radiante! Hora de um treino energizante ✨',
    ovulation: 'Sua energia está no máximo! Vamos aproveitar? 🔥',
    luteal: 'Um treino equilibrado te espera hoje. Vamos juntas? 🌸'
  };

  return messages[phase];
}
