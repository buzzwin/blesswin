import { NextApiRequest, NextApiResponse } from 'next';

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

interface ChatMessage {
  role: 'user' | 'assistant' | 'curator';
  content: string;
  curatorName?: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  userId?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { messages, userId } = req.body as ChatRequest;

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: 'Messages are required' });
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage.role !== 'user') {
      return res.status(400).json({ error: 'Last message must be from user' });
    }

    // Build context from conversation history
    const conversationContext = messages
      .map((msg) => {
        if (msg.role === 'user') return `User: ${msg.content}`;
        if (msg.role === 'curator') return `${msg.curatorName}: ${msg.content}`;
        return '';
      })
      .filter(Boolean)
      .join('\n');

    // RAG: Fetch user's ratings and preferences if authenticated
    let userContext = '';
    if (userId) {
      try {
        const { getUserRatings } = await import('@lib/firebase/utils/admin-rating');
        const ratings = await getUserRatings(userId);
        
        if (ratings.length > 0) {
          // Analyze user preferences from ratings
          const loved = ratings.filter((r) => r.rating === 'love').slice(0, 10);
          const hated = ratings.filter((r) => r.rating === 'hate').slice(0, 5);
          
          const lovedTitles = loved.map((r) => r.title).join(', ');
          const hatedTitles = hated.map((r) => r.title).join(', ');
          
          userContext = `\n\nUser's Wellness Profile (from ${ratings.length} activities):
- Loved practices/deeds: ${lovedTitles || 'None yet'}
- Practices they didn't enjoy: ${hatedTitles || 'None yet'}
- Total activities: ${ratings.length}

Use this to provide personalized wellness recommendations that match their journey.`;
        } else {
          userContext = '\n\nThe user has no wellness activities yet. Ask about their wellness goals and preferences to understand their journey.';
        }
      } catch (error) {
        console.error('Error fetching user ratings:', error);
        // Continue without user context if there's an error
      }
    }

    // Determine which curator should respond
    const curatorName = messages.filter((m) => m.role === 'curator').length % 2 === 0 
      ? 'CineWolf-93' 
      : 'FilmSnob.AI';

    const currentYear = new Date().getFullYear();
    const recentYears = `${currentYear - 3}-${currentYear}`;

    const prompt = `You are ${curatorName}, an AI wellness and positive action curator focused on helping users improve their wellbeing and do good deeds.${userId ? ' You have access to the user\'s wellness journey and preferences.' : ''}

${curatorName === 'CineWolf-93' 
  ? 'Your personality: Confident, playful, supportive of your human. You have a win streak of 7 and a 95% match rate. You\'re encouraging but fun. You specialize in finding practical wellness practices, mindfulness activities, and impactful good deeds. Keep responses short (1-3 sentences max). Always focus on recommending specific wellness practices or good deeds based on what the user wants.' 
  : 'Your personality: Thoughtful and holistic, thinks mainstream wellness is "basic". You debate with CineWolf-93 and push for more nuanced, deeply transformative wellness practices. Keep responses short (1-3 sentences max). Always focus on recommending specific wellness practices or good deeds.'}

Your goal: Help the user find their next wellness practice or good deed. Ask about:
- Current mood/energy level (energetic, calm, stressed, motivated)
- Wellness goals (physical health, mental health, spiritual growth, community impact)
- Time available (quick 5-minute practices vs longer rituals)
- Interests and values
- Wellness practices or good deeds they've enjoyed before
${userId ? '- Reference their wellness journey to suggest similar practices they\'ll love' : ''}

After your response, suggest 3 specific wellness practices or good deeds (one per line, formatted as "• [Practice/Deed]").

${userContext}

Conversation so far:
${conversationContext}

User: ${lastMessage.content}

Respond as ${curatorName} would - short, in-character, and focused on finding the perfect wellness practice or good deed. ${userId && userContext ? 'Reference their wellness profile and activity history when relevant.' : ''} If the user mentions preferences, suggest specific wellness practices or good deeds. Be conversational, not formal.`;

    const response = await callGeminiAPI(prompt, 300, 0.8);

    // Extract suggestions from response (lines starting with • or bullet points)
    const lines = response.split('\n');
    const message = lines
      .filter((line) => !line.match(/^[•\-*]\s/) && !line.trim().match(/^\(20\d{2}\)$/))
      .join('\n')
      .trim();
    
    const suggestions = lines
      .filter((line) => line.match(/^[•\-*]\s/))
      .map((line) => line.replace(/^[•\-*]\s*/, '').trim())
      .filter(Boolean)
      .slice(0, 3);

    // Generate default suggestions if none were extracted
    const defaultSuggestions = suggestions.length === 0 
      ? ['5-minute morning meditation', 'Evening gratitude practice', 'Random act of kindness']
      : suggestions;

    res.status(200).json({
      message,
      curatorName,
      suggestions: defaultSuggestions
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to generate response' 
    });
  }
}
