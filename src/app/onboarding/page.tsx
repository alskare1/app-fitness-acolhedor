'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Heart, Sparkles, Target } from 'lucide-react';
import { setOnboardingCompleted } from '@/lib/storage';

const onboardingSteps = [
  {
    icon: Heart,
    title: 'Seu corpo merece respeito',
    description: 'Treinar não é punição. É um presente que você dá para si mesmo, no seu ritmo, do seu jeito.',
    gradient: 'from-[#E8CFC8] to-[#B7A6D8]'
  },
  {
    icon: Sparkles,
    title: 'Cada dia é único',
    description: 'Alguns dias você vai estar radiante. Outros, cansada. E está tudo bem. Vamos adaptar o treino ao seu momento.',
    gradient: 'from-[#B7A6D8] to-[#5B8DEF]'
  },
  {
    icon: Target,
    title: 'Consistência sem culpa',
    description: 'Não importa se você treinou 5 ou 15 minutos. O que importa é que você apareceu. E isso já é uma vitória.',
    gradient: 'from-[#5B8DEF] to-[#9DB8A0]'
  }
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setOnboardingCompleted();
      router.push('/questionnaire');
    }
  };

  const handleSkip = () => {
    setOnboardingCompleted();
    router.push('/questionnaire');
  };

  const step = onboardingSteps[currentStep];
  const Icon = step.icon;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${step.gradient} flex flex-col items-center justify-between p-6 transition-all duration-700`}>
      {/* Skip button */}
      <div className="w-full flex justify-end">
        <button
          onClick={handleSkip}
          className="text-white/80 hover:text-white text-sm font-medium transition-colors"
        >
          Pular
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 max-w-md">
        <div className="bg-white/20 backdrop-blur-sm rounded-full p-8 animate-pulse">
          <Icon className="w-20 h-20 text-white" strokeWidth={1.5} />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            {step.title}
          </h1>
          <p className="text-lg md:text-xl text-white/90 leading-relaxed">
            {step.description}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="w-full max-w-md space-y-6">
        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/40'
              }`}
            />
          ))}
        </div>

        <Button
          onClick={handleNext}
          size="lg"
          className="w-full bg-white text-[#2E2E2E] hover:bg-white/90 font-semibold text-lg py-6 rounded-2xl shadow-xl"
        >
          {currentStep === onboardingSteps.length - 1 ? 'Começar' : 'Próximo'}
        </Button>
      </div>
    </div>
  );
}
