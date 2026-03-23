import type { NextApiRequest, NextApiResponse } from 'next';
import { callGeminiAPI, extractJSONFromResponse } from '@lib/api/gemini';
import type { ConversationMessage, Automation } from '@lib/types/automation';
import type { AgentPreferences } from '@lib/types/agent';

interface ChatRequest {
  userId: string;
  message: string;
  conversationHistory: ConversationMessage[];
  agentPreferences?: AgentPreferences;
}

interface ChatResponse {
  success: boolean;
  response: string;
  suggestedAutomation?: Partial<Automation>;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ success: false, response: 'Method not allowed', error: 'Method not allowed' });
    return;
  }

  try {
    const { userId, message, conversationHistory, agentPreferences } = req.body as ChatRequest;

    if (!userId || !message) {
      res.status(400).json({ success: false, response: 'User ID and message are required', error: 'Missing required fields' });
      return;
    }

    // Build conversation context
    const conversationContext = conversationHistory
      .slice(-10) // Last 10 messages for context
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    const memoryBlock =
      agentPreferences &&
      (agentPreferences.dietary ||
        agentPreferences.typicalOutingDay ||
        (agentPreferences.venueStyles && agentPreferences.venueStyles.length) ||
        agentPreferences.notes)
        ? `\nUser preferences (respect these when relevant):\n${JSON.stringify(agentPreferences, null, 2)}\n`
        : '';

    const prompt = `You are Buzzwin's AI assistant. You help users clarify desires into plans (Desire → Plan with AI), see believable paths (Expectation), and turn that into automations and next steps (Belief → Execute). You are practical: you rearrange decisions and actions, not mystical outcomes.

${memoryBlock}
Conversation history:
${conversationContext}

User's latest request: ${message}

Your task:
1. Understand what the user wants — goals, habits, trips, scheduling, or life automations.
2. When appropriate, identify triggers (time, location, event, condition) and actions (rituals, reminders, notifications).
3. Always end your main advice with a short "Next steps" section: 1–3 concrete actions. When useful, include real https:// links (OpenTable, Google Maps, official sites) so the user can act immediately. Plain URLs only, one per line in the next steps if needed.
4. If the request maps cleanly to a structured automation, include it in the JSON. If the user is only exploring plans or options, focus your JSON "response" on that and omit "automation" if unclear.

Return a JSON object with this structure:
{
  "response": "A friendly response explaining what automation you're suggesting",
  "automation": {
    "title": "Short, clear title (max 50 chars)",
    "description": "Brief description of what this automation does",
    "category": "wellness" | "productivity" | "relationships" | "health" | "finance" | "learning" | "other",
    "triggers": [
      {
        "type": "time" | "location" | "event" | "condition" | "manual",
        "config": {
          "time": "HH:MM format if time trigger",
          "frequency": "daily" | "weekly" | "monthly" | "custom",
          "daysOfWeek": [0-6] if weekly,
          "location": { "name": "location name" } if location trigger,
          "condition": { "field": "...", "operator": "...", "value": "..." } if condition trigger
        }
      }
    ],
    "actions": [
      {
        "type": "ritual" | "reminder" | "notification" | "message" | "api_call" | "custom",
        "config": {
          "message": "Message text if reminder/notification",
          "ritualTitle": "Ritual title if ritual action",
          "channel": "app" | "email" | "sms" if notification
        }
      }
    ],
    "isPublic": false
  }
}

If the user's request is unclear or needs more information, ask clarifying questions in the "response" field and don't include an "automation" object.

Return ONLY valid JSON, no markdown formatting.`;

    const response = await callGeminiAPI(prompt);
    const jsonData = extractJSONFromResponse(response) as {
      response: string;
      automation?: Partial<Automation>;
    };

    if (!jsonData || !jsonData.response) {
      throw new Error('Invalid response from AI');
    }

    res.status(200).json({
      success: true,
      response: jsonData.response,
      suggestedAutomation: jsonData.automation
    });
  } catch (error) {
    console.error('Error processing automation chat:', error);
    res.status(500).json({
      success: false,
      response: 'I apologize, but I encountered an error processing your request. Could you try rephrasing?',
      error: error instanceof Error ? error.message : 'Failed to process automation request'
    });
  }
}
