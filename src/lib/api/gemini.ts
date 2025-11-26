// Note: These interfaces are no longer used since we unified the prompts.
// The trending content now uses the same structure as recommendations.

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  // Gemini API key not found. Trending data will be limited.
}

// Simple rate limiter: track requests per minute
const requestTimestamps: number[] = [];
const MAX_REQUESTS_PER_MINUTE = 12; // Keep under 15 to be safe
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds

// Clean old timestamps
function cleanOldTimestamps(): void {
  const now = Date.now();
  while (requestTimestamps.length > 0 && requestTimestamps[0] < now - RATE_LIMIT_WINDOW) {
    requestTimestamps.shift();
  }
}

// Check if we can make a request
function canMakeRequest(): boolean {
  cleanOldTimestamps();
  return requestTimestamps.length < MAX_REQUESTS_PER_MINUTE;
}

// Add a request timestamp
function recordRequest(): void {
  requestTimestamps.push(Date.now());
}

// Wait for rate limit to clear
async function waitForRateLimit(retryAfterSeconds?: number): Promise<void> {
  const waitTime = retryAfterSeconds 
    ? Math.min(retryAfterSeconds * 1000, 20000) // Max 20 seconds
    : 5000; // Default 5 seconds
  await new Promise(resolve => setTimeout(resolve, waitTime));
}

// Utility function for making Gemini API calls with retry logic
export async function callGeminiAPI(
  prompt: string,
  maxOutputTokens = 2048,
  temperature = 0.7,
  retryCount = 0,
  maxRetries = 3
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  // Check rate limit before making request
  if (!canMakeRequest()) {
    console.warn('Rate limit reached, waiting before making request...');
    await waitForRateLimit();
  }

  try {
    recordRequest();
    
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
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: { message: errorText } };
      }

      // Handle 429 rate limit errors with retry
      if (response.status === 429 && retryCount < maxRetries) {
        const retryAfter = errorData.error?.details?.find((d: any) => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo')?.retryDelay;
        const retryAfterSeconds = retryAfter ? parseFloat(retryAfter) : undefined;
        
        console.warn(`Rate limit exceeded (429), retrying in ${retryAfterSeconds || 5} seconds... (attempt ${retryCount + 1}/${maxRetries})`);
        
        // Wait before retrying
        await waitForRateLimit(retryAfterSeconds);
        
        // Retry with exponential backoff
        return callGeminiAPI(prompt, maxOutputTokens, temperature, retryCount + 1, maxRetries);
      }

      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            text?: string
          }>
        }
      }>
    };
    
    // Only log in development to reduce noise
    if (process.env.NODE_ENV === 'development') {
      console.log('Gemini API response structure:', JSON.stringify(data, null, 2));
    }
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Invalid response structure:', data);
      throw new Error('Invalid response from Gemini API');
    }

    return data.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    // If it's a rate limit error and we haven't exceeded retries, retry
    if (error instanceof Error && error.message.includes('429') && retryCount < maxRetries) {
      console.warn(`Rate limit error caught, retrying... (attempt ${retryCount + 1}/${maxRetries})`);
      await waitForRateLimit();
      return callGeminiAPI(prompt, maxOutputTokens, temperature, retryCount + 1, maxRetries);
    }
    throw error;
  }
}

// Utility function to extract JSON from Gemini response
export function extractJSONFromResponse(responseText: string): Record<string, unknown> {
  // Remove markdown code blocks if present
  let cleanedText = responseText.trim();
  if (cleanedText.startsWith('```json')) {
    cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleanedText.startsWith('```')) {
    cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  
  // Find JSON object
  const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No valid JSON found in Gemini response');
  }
  
  let jsonString = jsonMatch[0];
  
  // Try to fix truncated JSON by closing arrays and objects
  try {
    return JSON.parse(jsonString) as Record<string, unknown>;
  } catch (parseError) {
    // If parsing fails, try to fix truncated JSON
    // Count open braces and brackets
    const openBraces = (jsonString.match(/\{/g) || []).length;
    const closeBraces = (jsonString.match(/\}/g) || []).length;
    const openBrackets = (jsonString.match(/\[/g) || []).length;
    const closeBrackets = (jsonString.match(/\]/g) || []).length;
    
    // Close arrays first, then objects
    let fixedJson = jsonString;
    for (let i = 0; i < openBrackets - closeBrackets; i++) {
      fixedJson += ']';
    }
    for (let i = 0; i < openBraces - closeBraces; i++) {
      fixedJson += '}';
    }
    
    try {
      return JSON.parse(fixedJson) as Record<string, unknown>;
    } catch {
      // If still failing, try to extract partial data
      // Look for wellnessContent array
      const wellnessContentMatch = jsonString.match(/"wellnessContent"\s*:\s*\[([\s\S]*)/);
      if (wellnessContentMatch) {
        // Try to extract individual items
        const items = [];
        const itemRegex = /\{[^{}]*"tmdbId"[^{}]*\}/g;
        let match;
        while ((match = itemRegex.exec(jsonString)) !== null) {
          try {
            items.push(JSON.parse(match[0]));
          } catch {
            // Skip invalid items
          }
        }
        if (items.length > 0) {
          return { wellnessContent: items } as Record<string, unknown>;
        }
      }
      
      throw new Error(`Invalid JSON format in Gemini response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }
  }
}

// Note: fetchGeminiTrends function has been removed in favor of using the unified prompt
// from the recommendations API for both trending content and personalized recommendations. 