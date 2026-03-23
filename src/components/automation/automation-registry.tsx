import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Share2, Sparkles, TrendingUp } from 'lucide-react';
import { useAuth } from '@lib/context/auth-context';
import { toast } from 'react-hot-toast';
import { BounceButton } from '@components/animations/bounce-button';
import { AutomationCard } from './automation-card';
import { cn } from '@lib/utils';
import type { AutomationRegistryEntry } from '@lib/types/automation';

interface AutomationRegistryProps {
  onAutomationSelect?: (automation: AutomationRegistryEntry) => void;
}

const categories: Array<{ value: string; label: string; icon: string }> = [
  { value: 'all', label: 'All', icon: '🌟' },
  { value: 'wellness', label: 'Wellness', icon: '🧘' },
  { value: 'productivity', label: 'Productivity', icon: '⚡' },
  { value: 'relationships', label: 'Relationships', icon: '💝' },
  { value: 'health', label: 'Health', icon: '🏥' },
  { value: 'finance', label: 'Finance', icon: '💰' },
  { value: 'learning', label: 'Learning', icon: '📚' },
  { value: 'other', label: 'Other', icon: '✨' }
];

export function AutomationRegistry({
  onAutomationSelect
}: AutomationRegistryProps): JSX.Element {
  const { user } = useAuth();
  const [automations, setAutomations] = useState<AutomationRegistryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const inFlightRef = useRef(false);
  const lastCategoryRef = useRef<string>('all');
  const lastAttemptRef = useRef<number>(0);

  useEffect(() => {
    void fetchAutomations();
    return () => {
      abortRef.current?.abort();
    };
  }, [selectedCategory]);

  const fetchAutomations = async (): Promise<void> => {
    const now = Date.now();
    const sameCategory = lastCategoryRef.current === selectedCategory;
    const tooSoon = now - lastAttemptRef.current < 1500;
    if (inFlightRef.current && sameCategory) return;
    if (sameCategory && tooSoon) return;

    if (typeof window !== 'undefined' && !navigator.onLine) {
      setLoading(false);
      toast.error('You appear to be offline');
      return;
    }

    lastAttemptRef.current = now;
    lastCategoryRef.current = selectedCategory;
    inFlightRef.current = true;
    setLoading(true);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const categoryParam = selectedCategory === 'all' ? '' : `&category=${selectedCategory}`;
      const response = await fetch(`/api/automations/registry?limit=50${categoryParam}`, {
        signal: controller.signal
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch automations');
      }

      if (!controller.signal.aborted) {
        setAutomations(data.automations || []);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      console.error('Error fetching automations:', error);
      toast.error('Failed to load automations');
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
      inFlightRef.current = false;
    }
  };

  const filteredAutomations = automations.filter(entry => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      entry.automation.title.toLowerCase().includes(query) ||
      entry.automation.description.toLowerCase().includes(query) ||
      entry.creator.name.toLowerCase().includes(query) ||
      entry.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <div className='mb-2 flex items-center gap-2'>
          <Sparkles className='h-5 w-5 text-purple-600 dark:text-purple-400' />
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
            Simulate and prepare
          </h2>
        </div>
        <p className='text-sm text-gray-600 dark:text-gray-400'>
          See what's possible — success pathways and strategies you can adopt from the community.
        </p>
      </div>

      {/* Search */}
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400' />
        <input
          type='text'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder='Search automations...'
          className='w-full rounded-lg border-2 border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-purple-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white'
        />
      </div>

      {/* Category Filter */}
      <div className='flex flex-wrap gap-2'>
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => setSelectedCategory(category.value)}
            className={cn(
              'flex items-center gap-2 rounded-lg border-2 px-3 py-1.5 text-sm font-medium transition-all',
              selectedCategory === category.value
                ? 'border-purple-500 bg-purple-50 text-purple-700 dark:border-purple-600 dark:bg-purple-900/30 dark:text-purple-300'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600'
            )}
          >
            <span>{category.icon}</span>
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      {/* Automations Grid */}
      {loading ? (
        <div className='flex items-center justify-center py-12'>
          <div className='h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent' />
        </div>
      ) : filteredAutomations.length === 0 ? (
        <div className='rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-900/50'>
          <Sparkles className='mx-auto mb-3 h-12 w-12 text-gray-400' />
          <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
            {searchQuery ? 'No automations found matching your search' : 'No automations in this category yet'}
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {filteredAutomations.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <AutomationCard
                entry={entry}
                onSelect={onAutomationSelect}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
