import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, profile, progress } = body;

    if (!question || !question.trim()) {
      return NextResponse.json(
        { error: 'Pergunta não fornecida' },
        { status: 400 }
      );
    }

    const goalLabels: Record<string, string> = {
      'lose-weight': 'Perder peso',
      'gain-muscle': 'Ganhar massa',
      'maintain': 'Manter forma',
      'improve-health': 'Melhorar saúde'
    };

    const equipmentLabels: Record<string, string> = {
      'none': 'Sem equipamento',
      'basic': 'Equipamentos básicos',
      'full-gym': 'Academia completa'
    };

    const prompt = `Você é um assistente de fitness especializado. O usuário tem o seguinte perfil:
- Nome: ${profile?.name || 'Usuário'}
- Objetivo: ${goalLabels[profile?.goal] || 'Não especificado'}
- Equipamentos: ${equipmentLabels[profile?.equipment] || 'Não especificado'}
- Tempo de treino: ${profile?.trainingTime || '30-45'} minutos
- Gênero: ${profile?.gender === 'female' ? 'Feminino' : 'Masculino'}
- Dias seguidos: ${progress?.currentStreak || 0}
- Total de treinos: ${progress?.totalWorkouts || 0}

Pergunta do usuário: ${question}

Responda de forma útil, motivadora e personalizada baseada no perfil do usuário. Mantenha a resposta concisa e prática (máximo 3-4 parágrafos).`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.8,
    });

    const response = completion.choices[0].message.content || 'Desculpe, não consegui gerar uma resposta.';

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('Erro na API OpenAI:', error);
    return NextResponse.json(
      { error: 'Erro ao processar sua pergunta. Tente novamente.' },
      { status: 500 }
    );
  }
}
