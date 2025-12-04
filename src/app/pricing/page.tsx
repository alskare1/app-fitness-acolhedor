'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Crown } from 'lucide-react';
import { setHasSubscription } from '@/lib/storage';

const plans = [
  {
    name: 'Mensal',
    price: 'R$ 29,90',
    period: '/mês',
    description: 'Perfeito para começar',
    features: [
      'Treinos personalizados diários',
      'Adaptação ao ciclo menstrual',
      'Mini-questionário de humor',
      'Vídeos demonstrativos',
      'Acompanhamento de progresso',
      'Sugestões de refeições'
    ],
    popular: false
  },
  {
    name: 'Trimestral',
    price: 'R$ 69,90',
    period: '/3 meses',
    description: 'Mais popular',
    features: [
      'Tudo do plano mensal',
      'Economia de 22%',
      'Desafios exclusivos',
      'Medalhas especiais',
      'Suporte prioritário',
      'Acesso antecipado a novidades'
    ],
    popular: true
  },
  {
    name: 'Anual',
    price: 'R$ 199,90',
    period: '/ano',
    description: 'Melhor investimento',
    features: [
      'Tudo do plano trimestral',
      'Economia de 44%',
      'Plano nutricional personalizado',
      'Consultoria mensal',
      'Comunidade VIP',
      'Garantia de 30 dias'
    ],
    popular: false
  }
];

export default function PricingPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState(1);

  const handleSubscribe = () => {
    setHasSubscription(true);
    router.push('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5B8DEF] via-[#B7A6D8] to-[#E8CFC8] p-6 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Escolha seu plano
          </h1>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">
            Invista em você. Cancele quando quiser, sem burocracia.
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              onClick={() => setSelectedPlan(index)}
              className={`relative bg-white/10 backdrop-blur-md rounded-3xl p-8 space-y-6 cursor-pointer transition-all hover:scale-105 ${
                selectedPlan === index
                  ? 'ring-4 ring-white shadow-2xl'
                  : 'hover:bg-white/15'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    Mais popular
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                <p className="text-white/70 text-sm">{plan.description}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-white">{plan.price}</span>
                </div>
                <p className="text-white/70 text-sm">{plan.period}</p>
              </div>

              <div className="space-y-3">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white/90 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {selectedPlan === index && (
                <div className="absolute inset-0 rounded-3xl ring-4 ring-white pointer-events-none" />
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="max-w-md mx-auto space-y-4">
          <Button
            onClick={handleSubscribe}
            size="lg"
            className="w-full bg-white text-[#2E2E2E] hover:bg-white/90 font-semibold text-lg py-6 rounded-2xl shadow-xl"
          >
            Começar agora
          </Button>
          <div className="text-center space-y-2">
            <p className="text-white/70 text-sm">
              ✓ Cancele quando quiser
            </p>
            <p className="text-white/70 text-sm">
              ✓ Garantia de 7 dias
            </p>
            <p className="text-white/70 text-sm">
              ✓ Pagamento 100% seguro
            </p>
          </div>
        </div>

        {/* Skip option */}
        <div className="text-center">
          <button
            onClick={() => router.push('/home')}
            className="text-white/80 hover:text-white text-sm font-medium transition-colors underline"
          >
            Continuar com versão gratuita
          </button>
        </div>
      </div>
    </div>
  );
}
