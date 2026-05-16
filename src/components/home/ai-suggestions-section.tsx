import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Brain, Sparkles, ArrowRight, Lightbulb } from 'lucide-react';
import { SectionShell } from '@components/layout/section-shell';
import { Loading } from '@components/ui/loading';

interface AISuggestion {
  title: string;
  description: string;
  category?: string;
}

const fallbackSuggestions: AISuggestion[] = [
  {
    title: 'Morning Gratitude Practice',
    description: 'Start each day by writing down three things you\'re grateful for. This simple ritual can shift your mindset and improve your overall well-being.',
    category: 'Mindfulness'
  },
  {
    title: 'Daily Movement Break',
    description: 'Take 10 minutes for gentle stretching or a short walk. Physical movement boosts energy and mental clarity throughout the day.',
    category: 'Wellness'
  },
  {
    title: 'Evening Reflection',
    description: 'Before bed, reflect on one positive action you took today. Acknowledge your progress and set a small intention for tomorrow.',
    category: 'Self-Improvement'
  },
  {
    title: 'Mindful Breathing',
    description: 'Practice 5 minutes of deep breathing. Focus on your breath to center yourself and reduce stress.',
    category: 'Meditation'
  },
  {
    title: 'Kindness Connection',
    description: 'Reach out to someone in your community today. A simple message or act of kindness strengthens relationships.',
    category: 'Community'
  },
  {
    title: 'Nature Connection',
    description: 'Spend time outside, even if just 5 minutes. Connect with nature to ground yourself and find peace.',
    category: 'Wellness'
  }
];

export function AISuggestionsSection(): JSX.Element {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<AISuggestion[]>(fallbackSuggestions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAISuggestions = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // For now, use fallback suggestions
      // In the future, this can call an AI API endpoint
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use fallback suggestions for now
      setSuggestions(fallbackSuggestions);
    } catch (err) {
      console.error('Error fetching AI suggestions:', err);
      setError('Unable to load suggestions right now');
      setSuggestions(fallbackSuggestions);
    } finally {
      setLoading(false);
    }
  };

  // Load suggestions on mount
  useEffect(() => {
    void fetchAISuggestions();
  }, []);

  return (
    <SectionShell variant='dark'>
      <div className='mx-auto w-full max-w-6xl px-6'>
        <div className='mb-12 text-center'>
          <div className='mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30'>
            <Brain className='h-8 w-8 text-[#C9A96E] dark:text-[#C9A96E]' />
          </div>
          <h2 className='mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl'>
            Get AI Suggestions
          </h2>
          <p className='mx-auto max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-[#C4B5A0]'>
            Get personalized ritual suggestions powered by AI. Discover new ways to improve your life and build meaningful habits.
          </p>
        </div>

        {loading ? (
          <div className='flex justify-center py-12'>
            <Loading />
          </div>
        ) : (
          <>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className='group rounded-xl border-2 border-gray-200 bg-[#faf8f4] p-6 transition-all duration-300 hover:scale-105 hover:border-[#C9A96E] hover:shadow-xl dark:border-[#2a1d10] dark:bg-[#1c1510]'
                >
                  <div className='mb-4 flex items-start gap-3'>
                    <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg'>
                      <Lightbulb className='h-6 w-6 text-white' />
                    </div>
                    <div className='flex-1'>
                      <h3 className='mb-2 text-lg font-bold text-gray-900 dark:text-white'>
                        {suggestion.title}
                      </h3>
                      {suggestion.category && (
                        <span className='inline-block rounded-full bg-[rgba(201,169,110,0.1)] px-3 py-1 text-xs font-medium text-[#8a6520] dark:bg-[rgba(201,169,110,0.08)] dark:text-[#C9A96E]'>
                          {suggestion.category}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className='mb-4 text-gray-700 dark:text-[#C4B5A0]'>
                    {suggestion.description}
                  </p>

                  <button
                    onClick={() => {
                      void router.push({
                        pathname: '/rituals/create',
                        query: {
                          title: suggestion.title,
                          description: suggestion.description
                        }
                      });
                    }}
                    className='w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-lg'
                  >
                    Create This Ritual
                  </button>
                </div>
              ))}
            </div>

            {error && (
              <div className='mt-4 rounded-lg bg-yellow-50 p-4 text-center text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'>
                {error}
              </div>
            )}

            <div className='mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row'>
              <button
                onClick={() => void fetchAISuggestions()}
                className='inline-flex items-center gap-2 rounded-full border-2 border-[#C9A96E] bg-[#faf8f4] px-6 py-3 text-base font-semibold text-[#C9A96E] transition-colors hover:bg-[rgba(201,169,110,0.06)] dark:border-[rgba(201,169,110,0.45)] dark:bg-[#1c1510] dark:text-[#C9A96E] dark:hover:bg-[rgba(201,169,110,0.06)]'
              >
                <Sparkles className='h-4 w-4' />
                Get More Suggestions
              </button>
              <button
                onClick={() => void router.push('/rituals/create')}
                className='inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl'
              >
                Create Custom Ritual
                <ArrowRight className='h-4 w-4' />
              </button>
            </div>
          </>
        )}
      </div>
    </SectionShell>
  );
}

