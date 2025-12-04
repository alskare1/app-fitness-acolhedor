'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Star, Heart, Sparkles } from 'lucide-react';

const successStories = [
  {
    name: 'Ana Carolina',
    age: 32,
    story: 'Consegui treinar durante a TPM pela primeira vez na vida. O app entendeu que eu precisava de algo mais leve e me motivou sem pressão.',
    result: '3 meses, 8kg perdidos',
    avatar: '👩🏻'
  },
  {
    name: 'Juliana Santos',
    age: 28,
    story: 'Nunca consegui manter uma rotina. Com o FlowFit, treino 15 minutos por dia e já virou hábito. Sem culpa, sem cobrança.',
    result: '2 meses, mais energia',
    avatar: '👩🏽'
  },
  {
    name: 'Mariana Costa',
    age: 35,
    story: 'Como mãe, não tinha tempo. O app se adapta ao meu dia e aos meus hormônios. Finalmente encontrei algo que funciona pra mim.',
    result: '4 meses, corpo definido',
    avatar: '👩🏼'
  }
];

export default function SuccessStoriesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5B8DEF] via-[#B7A6D8] to-[#E8CFC8] p-6">
      <div className="max-w-2xl mx-auto space-y-8 py-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white">
            Elas conseguiram
          </h1>
          <p className="text-white/90 text-lg">
            E você também vai conseguir
          </p>
        </div>

        {/* Stories */}
        <div className="space-y-6">
          {successStories.map((story, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-md rounded-3xl p-6 space-y-4 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{story.avatar}</div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold text-lg">
                      {story.name}, {story.age}
                    </h3>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-white/90 leading-relaxed">
                "{story.story}"
              </p>

              <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                <Heart className="w-4 h-4" />
                <span>{story.result}</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="space-y-4 pt-4">
          <Button
            onClick={() => router.push('/pricing')}
            size="lg"
            className="w-full bg-white text-[#2E2E2E] hover:bg-white/90 font-semibold text-lg py-6 rounded-2xl shadow-xl"
          >
            Quero começar minha jornada
          </Button>
          <p className="text-center text-white/70 text-sm">
            Junte-se a mais de 10.000 mulheres
          </p>
        </div>
      </div>
    </div>
  );
}
