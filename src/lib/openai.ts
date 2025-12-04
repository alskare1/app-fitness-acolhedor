import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Sistema de fallback com treinos inteligentes locais
function generateLocalWorkout(params: {
  gender: string;
  feeling: string;
  goal: string;
  equipment: string[];
  trainingTime: number;
  trainingLocation: string;
  menstrualPhase?: string;
}): any {
  const { gender, feeling, goal, equipment, trainingTime, trainingLocation, menstrualPhase } = params;

  // Determinar intensidade baseada no estado emocional
  let intensity: 'low' | 'medium' | 'high' = 'medium';
  let emotionalTone = 'motivadora';

  const lowEnergyStates = ['Cólica', 'Inchada', 'Sem energia', 'Cansado mentalmente', 'Cansado fisicamente', 'Estressado', 'Desmotivado'];
  const highEnergyStates = ['Energia máxima', 'Motivação máxima', 'Disposta'];
  
  if (lowEnergyStates.includes(feeling)) {
    intensity = 'low';
    emotionalTone = 'acolhedora';
  } else if (highEnergyStates.includes(feeling)) {
    intensity = 'high';
    emotionalTone = 'energética';
  }

  // Templates de exercícios por intensidade
  const exerciseTemplates = {
    low: [
      { name: 'Alongamento de Gato-Vaca', description: 'De quatro apoios, alterne entre arquear e arredondar as costas suavemente. Respire profundamente.', duration: 120, sets: 2, reps: 10, intensity: 'low' },
      { name: 'Caminhada no Lugar', description: 'Caminhe no lugar em ritmo confortável, movimentando os braços naturalmente.', duration: 180, sets: 1, reps: 1, intensity: 'low' },
      { name: 'Respiração Profunda com Braços', description: 'Inspire levantando os braços, expire descendo. Movimento suave e consciente.', duration: 120, sets: 3, reps: 8, intensity: 'low' },
      { name: 'Rotação de Quadril', description: 'Em pé, faça círculos suaves com o quadril. Relaxe e respire.', duration: 90, sets: 2, reps: 10, intensity: 'low' },
      { name: 'Alongamento de Pernas Sentada', description: 'Sentada, estenda as pernas e alcance os pés suavemente. Sem forçar.', duration: 120, sets: 2, reps: 8, intensity: 'low' }
    ],
    medium: [
      { name: 'Agachamento Livre', description: 'Pés na largura dos ombros, desça como se fosse sentar. Mantenha as costas retas.', duration: 90, sets: 3, reps: 12, intensity: 'medium' },
      { name: 'Flexão de Joelhos', description: 'Apoie os joelhos no chão, desça o peito mantendo o corpo alinhado.', duration: 90, sets: 3, reps: 10, intensity: 'medium' },
      { name: 'Prancha Modificada', description: 'Apoie antebraços e joelhos, mantenha o corpo reto por 20-30 segundos.', duration: 90, sets: 3, reps: 3, intensity: 'medium' },
      { name: 'Afundo Alternado', description: 'Dê um passo à frente, dobre os joelhos em 90°. Alterne as pernas.', duration: 120, sets: 3, reps: 10, intensity: 'medium' },
      { name: 'Elevação de Quadril', description: 'Deitada de costas, joelhos dobrados, eleve o quadril contraindo o glúteo.', duration: 90, sets: 3, reps: 15, intensity: 'medium' }
    ],
    high: [
      { name: 'Burpee Modificado', description: 'Agache, apoie as mãos, estenda as pernas para trás, volte e pule.', duration: 120, sets: 4, reps: 12, intensity: 'high' },
      { name: 'Agachamento com Salto', description: 'Agachamento tradicional seguido de um salto explosivo.', duration: 90, sets: 4, reps: 15, intensity: 'high' },
      { name: 'Mountain Climbers', description: 'Posição de prancha, traga os joelhos alternadamente em direção ao peito rapidamente.', duration: 90, sets: 4, reps: 20, intensity: 'high' },
      { name: 'Flexão Completa', description: 'Flexão tradicional com corpo totalmente alinhado, descendo até o peito quase tocar o chão.', duration: 90, sets: 4, reps: 12, intensity: 'high' },
      { name: 'Prancha com Toque no Ombro', description: 'Posição de prancha, toque alternadamente cada ombro mantendo o corpo estável.', duration: 90, sets: 3, reps: 16, intensity: 'high' }
    ]
  };

  // Selecionar exercícios baseados na intensidade e tempo disponível
  const availableExercises = exerciseTemplates[intensity];
  const exercisesCount = Math.min(Math.floor(trainingTime / 3), availableExercises.length);
  const selectedExercises = availableExercises.slice(0, exercisesCount);

  // Calcular duração total
  const totalDuration = selectedExercises.reduce((sum, ex) => sum + (ex.duration * ex.sets), 0);

  // Mensagens emocionais personalizadas
  const emotionalMessages = {
    low: [
      'Hoje é um dia para cuidar de você com carinho. Cada movimento suave é um ato de amor próprio. 💜',
      'Seu corpo está pedindo gentileza, e você está ouvindo. Isso é força de verdade. 🌸',
      'Não importa a intensidade, você está aqui. E isso já é uma vitória. 🌙'
    ],
    medium: [
      'Você está encontrando seu ritmo! Continue assim, respeitando seu corpo e sua mente. ✨',
      'Cada repetição é um passo em direção à melhor versão de você. Siga em frente! 💪',
      'Seu esforço de hoje está construindo a força de amanhã. Continue! 🌟'
    ],
    high: [
      'Que energia incrível! Aproveite esse momento e dê o seu melhor. Você é capaz! 🔥',
      'Sua determinação está brilhando hoje! Continue assim, você está arrasando! ⚡',
      'Esse é o seu momento! Mostre para você mesma do que é capaz! 🚀'
    ]
  };

  const emotionalMessage = emotionalMessages[intensity][Math.floor(Math.random() * emotionalMessages[intensity].length)];

  // Sugestões de refeição pós-treino
  const mealSuggestions = {
    low: 'Smoothie de banana com aveia e mel. Leve, nutritivo e reconfortante. 🍌',
    medium: 'Omelete com legumes e uma fatia de pão integral. Proteína e energia balanceadas. 🥚',
    high: 'Frango grelhado com batata doce e salada. Reponha suas energias com qualidade! 🍗'
  };

  return {
    exercises: selectedExercises,
    totalDuration,
    emotionalMessage,
    mealSuggestion: mealSuggestions[intensity],
    generatedBy: 'local' // Indicador de que foi gerado localmente
  };
}

export async function generateWorkout(params: {
  gender: string;
  feeling: string;
  goal: string;
  equipment: string[];
  trainingTime: number;
  trainingLocation: string;
  menstrualPhase?: string;
}): Promise<any> {
  const { gender, feeling, goal, equipment, trainingTime, trainingLocation, menstrualPhase } = params;

  // Tentar usar OpenAI primeiro
  try {
    const systemPrompt = `Você é um personal trainer especializado em treinos personalizados e empáticos.
Crie um treino COMPLETO e FUNCIONAL baseado no estado emocional e físico do usuário.

REGRAS IMPORTANTES:
- NUNCA force o usuário
- Adapte a intensidade ao estado atual
- Seja acolhedor e motivador
- Respeite limitações físicas e emocionais
- Treinar deve parecer um presente, não uma punição

Retorne APENAS um JSON válido no seguinte formato:
{
  "exercises": [
    {
      "name": "Nome do exercício",
      "description": "Descrição detalhada de como executar",
      "duration": 60,
      "sets": 3,
      "reps": 12,
      "intensity": "low|medium|high"
    }
  ],
  "totalDuration": 900,
  "emotionalMessage": "Mensagem motivadora e acolhedora personalizada",
  "mealSuggestion": "Sugestão de refeição pós-treino"
}`;

    const userPrompt = `
Gênero: ${gender === 'female' ? 'Feminino' : 'Masculino'}
Estado atual: ${feeling}
${menstrualPhase ? `Fase do ciclo: ${menstrualPhase}` : ''}
Objetivo: ${goal}
Local: ${trainingLocation}
Equipamentos: ${equipment.join(', ') || 'Nenhum'}
Tempo disponível: ${trainingTime} minutos

Crie um treino personalizado que respeite o estado atual da pessoa.
Se ela está em um dia difícil, adapte para exercícios mais leves e acolhedores.
Se está com energia, pode intensificar.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error('Resposta vazia da OpenAI');

    const result = JSON.parse(content);
    result.generatedBy = 'openai';
    return result;
  } catch (error: any) {
    console.warn('OpenAI indisponível, usando geração local:', error?.message);
    
    // Fallback para geração local
    return generateLocalWorkout(params);
  }
}

export async function generateEmotionalMessage(params: {
  feeling: string;
  workoutCompleted: boolean;
}): Promise<string> {
  const { feeling, workoutCompleted } = params;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Você é um mentor fitness empático. Crie uma mensagem curta, acolhedora e motivadora.'
        },
        {
          role: 'user',
          content: `A pessoa estava se sentindo: ${feeling}. ${workoutCompleted ? 'Ela completou o treino!' : 'Ela não completou o treino hoje.'} Escreva uma mensagem de 2-3 frases.`
        }
      ],
      temperature: 0.9,
      max_tokens: 150
    });

    return completion.choices[0].message.content || 'Você está no caminho certo! Continue assim.';
  } catch (error) {
    console.warn('OpenAI indisponível para mensagem emocional, usando mensagem local');
    
    // Fallback local
    if (workoutCompleted) {
      return 'Você completou seu treino! Cada passo conta, e você está construindo algo incrível. Continue assim! 💜';
    } else {
      return 'Tudo bem não ter treinado hoje. O importante é que você está aqui, cuidando de si. Amanhã é um novo dia! 🌸';
    }
  }
}
