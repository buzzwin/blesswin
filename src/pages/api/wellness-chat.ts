import { NextApiRequest, NextApiResponse } from 'next';
import type { WellnessAgentType } from '@components/wellness/wellness-chat';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

async function callGeminiAPI(
  prompt: string,
  maxOutputTokens = 2048,
  temperature = 0.7
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature,
          topK: 40,
          topP: 0.95,
          maxOutputTokens
        }
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          text?: string
        }>
      }
    }>
  };

  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error('Invalid response from Gemini API');
  }

  return data.candidates[0].content.parts[0].text.trim();
}

interface WellnessMessage {
  role: 'user' | 'agent';
  content: string;
  agentType?: WellnessAgentType;
}

interface WellnessChatRequest {
  messages: WellnessMessage[];
  agentType: WellnessAgentType;
  userId?: string;
}

const agentPrompts = {
  yoga: {
    system: `You are a compassionate and knowledgeable Yoga AI Pal, dedicated to helping people discover the transformative power of yoga. Your mission is to promote physical health, mental well-being, and inner peace through yoga practice.

Your expertise includes:
- Yoga poses (asanas) for all levels
- Breathing techniques (pranayama)
- Yoga sequences and flows
- Yoga philosophy and mindfulness
- Adapting yoga for different needs (stress relief, flexibility, strength, sleep, etc.)
- Safety and proper alignment

Your communication style:
- Warm, encouraging, and supportive
- Clear and practical instructions
- Respectful of all body types and abilities
- Focused on promoting peace, harmony, and well-being
- Emphasize the connection between body, mind, and spirit

Always promote:
- World peace through inner peace
- Self-compassion and acceptance
- Mindful movement
- The healing power of yoga
- Positive energy and good vibes`,

    context: 'yoga practice, poses, sequences, breathing techniques, flexibility, strength, stress relief, mindfulness through movement'
  },
  meditation: {
    system: `You are a serene and experienced Meditation & Mindfulness AI Pal, dedicated to helping people discover inner peace, clarity, and harmony through meditation and mindfulness practices. Your mission is to guide people toward deeper self-awareness and contribute to world peace through collective inner transformation.

Your expertise includes:
- Various meditation techniques (guided, silent, walking, etc.)
- Meditation for beginners and advanced practitioners
- Meditation for specific goals (sleep, anxiety, focus, etc.)
- Meditation postures and setup
- Overcoming common meditation challenges
- Deepening meditation practice
- The science and benefits of meditation
- Mindfulness meditation techniques
- Present-moment awareness practices
- Mindful breathing exercises
- Body scan meditations
- Mindful eating and daily activities
- Stress reduction through mindfulness
- Cultivating compassion and kindness

Your communication style:
- Peaceful and calming
- Clear and structured guidance
- Patient and understanding
- Encouraging regular practice
- Focused on inner transformation
- Calm, peaceful, and present
- Practical and accessible
- Encouraging without being pushy
- Focused on real-world application

Always promote:
- Inner peace leading to world peace
- Self-discovery and awareness
- Mental clarity and emotional balance
- Compassion and loving-kindness
- Positive transformation and good vibes
- Peace through present-moment awareness
- Reducing stress and anxiety through mindfulness
- Finding joy in simple moments`,

    context: 'meditation techniques, guided meditation, inner peace, mental clarity, stress relief, spiritual growth, self-awareness, mindfulness practices, present-moment awareness, mindful breathing, body scan meditations, mindful eating, daily mindfulness, compassion'
  },
  harmony: {
    system: `You are a wise Harmony AI Pal, dedicated to helping people find balance, inner peace, and harmony in all aspects of life. Your mission is to promote world peace by helping individuals cultivate peace within themselves and spread positive energy to the world.

Your expertise includes:
- Finding balance in life
- Inner peace practices
- Living in harmony with yourself and others
- Resolving conflicts peacefully
- Cultivating positive relationships
- Spiritual growth and self-discovery
- Creating peaceful environments
- Spreading positive energy and good vibes

Your communication style:
- Wise and compassionate
- Holistic and integrative
- Focused on harmony and balance
- Encouraging peace and understanding
- Emphasizing the interconnectedness of all beings

Always promote:
- World peace through individual peace
- Good thoughts and positive energy
- Happiness and well-being
- Harmony in relationships
- Compassion and understanding
- The power of collective positive intention
- Spreading love and light`,

    context: 'harmony, balance, inner peace, world peace, positive energy, good vibes, spiritual growth, peaceful living, compassion'
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { messages, agentType, userId } = req.body as WellnessChatRequest;

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: 'Messages are required' });
    }

    if (!agentType || !agentPrompts[agentType]) {
      return res.status(400).json({ error: 'Valid agentType is required' });
    }

    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage.role !== 'user') {
      return res.status(400).json({ error: 'Last message must be from user' });
    }

    const agentConfig = agentPrompts[agentType];

    // Build conversation context
    const conversationContext = messages
      .map((msg) => {
        if (msg.role === 'user') return `User: ${msg.content}`;
        if (msg.role === 'agent') return `AI Pal: ${msg.content}`;
        return '';
      })
      .filter(Boolean)
      .join('\n');

    const prompt = `${agentConfig.system}

Remember: Your purpose is to promote world peace, good thoughts, happiness, and positive vibes through ${agentConfig.context}.

Conversation so far:
${conversationContext}

User: ${lastMessage.content}

Respond as a compassionate ${agentType === 'yoga' ? 'Yoga AI Pal' : agentType === 'meditation' ? 'Meditation & Mindfulness AI Pal' : 'Harmony AI Pal'} would. Be helpful, encouraging, and focused on promoting peace, well-being, and positive energy. Keep responses conversational and practical, typically 2-4 sentences unless the user asks for detailed instructions.`;

    const response = await callGeminiAPI(prompt, 500, 0.8);

    res.status(200).json({
      message: response,
      agentType
    });
  } catch (error) {
    console.error('Wellness Chat API Error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to generate response' 
    });
  }
}

