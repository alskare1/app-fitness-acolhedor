'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isOnboardingCompleted } from '@/lib/storage';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redireciona para onboarding se não completou
    if (!isOnboardingCompleted()) {
      router.push('/onboarding');
    } else {
      router.push('/home');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#5B8DEF] to-[#B7A6D8]">
      <div className="text-white text-2xl animate-pulse">Carregando...</div>
    </div>
  );
}
