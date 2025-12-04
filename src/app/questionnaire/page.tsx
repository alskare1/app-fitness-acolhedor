'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { saveUserProfile, setQuestionnaireCompleted } from '@/lib/storage';
import { Gender, QuestionnaireData } from '@/lib/types';

const goals = [
  'Perder peso',
  'Ganhar massa muscular',
  'Melhorar condicionamento',
  'Reduzir estresse',
  'Ter mais energia',
  'Melhorar postura'
];

const locations = [
  'Em casa',
  'Academia',
  'Parque/Ar livre',
  'Onde estiver'
];

const equipmentOptions = [
  'Nenhum equipamento',
  'Halteres',
  'Elásticos',
  'Colchonete',
  'Barra fixa',
  'Kettlebell'
];

const timeOptions = [
  { label: '10 minutos', value: 10 },
  { label: '15 minutos', value: 15 },
  { label: '20 minutos', value: 20 },
  { label: '30 minutos', value: 30 },
  { label: '45 minutos', value: 45 },
  { label: '60 minutos', value: 60 }
];

export default function QuestionnairePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<QuestionnaireData>({
    goal: '',
    trainingLocation: '',
    equipment: [],
    trainingTime: 20,
    gender: 'female',
    lastPeriodDate: ''
  });

  const totalSteps = formData.gender === 'female' ? 6 : 5;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Salvar perfil
      const profile = {
        id: Date.now().toString(),
        gender: formData.gender,
        goal: formData.goal,
        trainingLocation: formData.trainingLocation,
        equipment: formData.equipment,
        trainingTime: formData.trainingTime,
        lastPeriodDate: formData.lastPeriodDate,
        createdAt: new Date().toISOString()
      };
      saveUserProfile(profile);
      setQuestionnaireCompleted();
      router.push('/auth');
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return formData.goal !== '';
      case 2: return formData.trainingLocation !== '';
      case 3: return formData.equipment.length > 0;
      case 4: return formData.trainingTime > 0;
      case 5: return formData.gender !== '';
      case 6: return formData.gender === 'male' || formData.lastPeriodDate !== '';
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5B8DEF] via-[#B7A6D8] to-[#E8CFC8] flex flex-col">
      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={step === 1}
          className="text-white/80 hover:text-white disabled:opacity-30 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="text-white/90 text-sm font-medium">
          {step} de {totalSteps}
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-6">
        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="w-full max-w-md space-y-8">
          {/* Step 1: Goal */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white">
                  Qual é o seu objetivo?
                </h2>
                <p className="text-white/80">
                  Vamos personalizar sua jornada
                </p>
              </div>
              <RadioGroup
                value={formData.goal}
                onValueChange={(value) => setFormData({ ...formData, goal: value })}
                className="space-y-3"
              >
                {goals.map((goal) => (
                  <label
                    key={goal}
                    className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm p-4 rounded-xl cursor-pointer hover:bg-white/20 transition-all"
                  >
                    <RadioGroupItem value={goal} className="border-white text-white" />
                    <span className="text-white font-medium">{goal}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white">
                  Onde você vai treinar?
                </h2>
                <p className="text-white/80">
                  Vamos adaptar os exercícios
                </p>
              </div>
              <RadioGroup
                value={formData.trainingLocation}
                onValueChange={(value) => setFormData({ ...formData, trainingLocation: value })}
                className="space-y-3"
              >
                {locations.map((location) => (
                  <label
                    key={location}
                    className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm p-4 rounded-xl cursor-pointer hover:bg-white/20 transition-all"
                  >
                    <RadioGroupItem value={location} className="border-white text-white" />
                    <span className="text-white font-medium">{location}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Step 3: Equipment */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white">
                  Quais equipamentos você tem?
                </h2>
                <p className="text-white/80">
                  Pode selecionar vários
                </p>
              </div>
              <div className="space-y-3">
                {equipmentOptions.map((equipment) => (
                  <label
                    key={equipment}
                    className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm p-4 rounded-xl cursor-pointer hover:bg-white/20 transition-all"
                  >
                    <Checkbox
                      checked={formData.equipment.includes(equipment)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({
                            ...formData,
                            equipment: [...formData.equipment, equipment]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            equipment: formData.equipment.filter(e => e !== equipment)
                          });
                        }
                      }}
                      className="border-white data-[state=checked]:bg-white data-[state=checked]:text-[#5B8DEF]"
                    />
                    <span className="text-white font-medium">{equipment}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Time */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white">
                  Quanto tempo você tem por dia?
                </h2>
                <p className="text-white/80">
                  Seja realista, vamos respeitar seu tempo
                </p>
              </div>
              <RadioGroup
                value={formData.trainingTime.toString()}
                onValueChange={(value) => setFormData({ ...formData, trainingTime: parseInt(value) })}
                className="space-y-3"
              >
                {timeOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm p-4 rounded-xl cursor-pointer hover:bg-white/20 transition-all"
                  >
                    <RadioGroupItem value={option.value.toString()} className="border-white text-white" />
                    <span className="text-white font-medium">{option.label}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Step 5: Gender */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white">
                  Como você se identifica?
                </h2>
                <p className="text-white/80">
                  Isso nos ajuda a personalizar ainda mais
                </p>
              </div>
              <RadioGroup
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value as Gender })}
                className="space-y-3"
              >
                <label className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm p-4 rounded-xl cursor-pointer hover:bg-white/20 transition-all">
                  <RadioGroupItem value="female" className="border-white text-white" />
                  <span className="text-white font-medium">Feminino</span>
                </label>
                <label className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm p-4 rounded-xl cursor-pointer hover:bg-white/20 transition-all">
                  <RadioGroupItem value="male" className="border-white text-white" />
                  <span className="text-white font-medium">Masculino</span>
                </label>
              </RadioGroup>
            </div>
          )}

          {/* Step 6: Last Period (only for females) */}
          {step === 6 && formData.gender === 'female' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white">
                  Quando foi sua última menstruação?
                </h2>
                <p className="text-white/80">
                  Vamos adaptar os treinos ao seu ciclo
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastPeriod" className="text-white">
                  Data da última menstruação
                </Label>
                <Input
                  id="lastPeriod"
                  type="date"
                  value={formData.lastPeriodDate}
                  onChange={(e) => setFormData({ ...formData, lastPeriodDate: e.target.value })}
                  className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/50"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6">
        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          size="lg"
          className="w-full bg-white text-[#2E2E2E] hover:bg-white/90 font-semibold text-lg py-6 rounded-2xl shadow-xl disabled:opacity-50"
        >
          {step === totalSteps ? 'Finalizar' : 'Continuar'}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
