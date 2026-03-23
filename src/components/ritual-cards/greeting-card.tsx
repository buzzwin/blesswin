import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@lib/utils';
import { Heart, Star, Sparkles, Image as ImageIcon, X } from 'lucide-react';
import type { RitualCard, CardSignature } from '@lib/types/ritual-card';

interface GreetingCardProps {
  card: RitualCard;
  signatures: CardSignature[];
  currentUserId?: string;
  onSign?: (message: string, imageFile?: File) => void;
  canSign?: boolean;
  isPreview?: boolean;
}

const patternStyles = {
  solid: '',
  dots: 'bg-[radial-gradient(circle,_#000_1px,_transparent_1px)] bg-[length:20px_20px]',
  stripes: 'bg-[repeating-linear-gradient(45deg,_transparent,_transparent_10px,_rgba(0,0,0,0.1)_10px,_rgba(0,0,0,0.1)_20px)]',
  hearts: 'bg-[radial-gradient(circle_at_50%_50%,_transparent_20px,_rgba(255,192,203,0.3)_20px,_rgba(255,192,203,0.3)_25px,_transparent_25px)]',
  stars: 'bg-[radial-gradient(circle_at_50%_50%,_transparent_15px,_rgba(255,215,0,0.2)_15px,_rgba(255,215,0,0.2)_20px,_transparent_20px)]'
};

export function GreetingCard({
  card,
  signatures,
  currentUserId,
  onSign,
  canSign = false,
  isPreview = false
}: GreetingCardProps): JSX.Element {
  const [showSignForm, setShowSignForm] = useState(false);
  const [message, setMessage] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const backgroundColor = card.cardDesign?.backgroundColor || '#fff8e1';
  const borderColor = card.cardDesign?.borderColor || '#f59e0b';
  const pattern = card.cardDesign?.pattern || 'solid';

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSign = async (): Promise<void> => {
    if (!message.trim() || !onSign) return;
    void onSign(message.trim(), imageFile || undefined);
    setMessage('');
    setImageFile(null);
    setImagePreview(null);
    setShowSignForm(false);
  };

  const hasSigned = signatures.some(sig => sig.userId === currentUserId);

  return (
    <div className='flex flex-col items-center gap-6 p-4 md:p-6'>
      {/* The Actual Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        className={cn(
          'relative w-full max-w-2xl aspect-[4/3] rounded-lg shadow-2xl',
          'border-4 overflow-hidden',
          patternStyles[pattern]
        )}
        style={{
          backgroundColor,
          borderColor
        }}
      >
        {/* Card Content */}
        <div className='relative h-full p-8 md:p-12 flex flex-col'>
          {/* Card Header */}
          <div className='text-center mb-6'>
            <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-2'>
              {card.title}
            </h2>
            {card.recipientName && (
              <p className='text-lg md:text-xl text-gray-700'>
                For {card.recipientName}
              </p>
            )}
          </div>

          {/* Signatures Area */}
          <div className='flex-1 relative overflow-hidden'>
            {signatures.length === 0 ? (
              <div className='h-full flex items-center justify-center text-gray-400'>
                <p className='text-center'>
                  Be the first to sign this card! 💌
                </p>
              </div>
            ) : (
              <div className='grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4'>
                {signatures.map((signature) => (
                  <motion.div
                    key={signature.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      'bg-white/80 backdrop-blur-sm rounded-lg p-3 md:p-4',
                      'border-2 border-gray-200 shadow-md',
                      'hover:shadow-lg transition-shadow'
                    )}
                  >
                    {signature.imageURL && (
                      <img
                        src={signature.imageURL}
                        alt={`${signature.userName}'s signature`}
                        className='w-full h-24 md:h-32 object-cover rounded mb-2'
                      />
                    )}
                    <p className='text-xs md:text-sm font-semibold text-gray-900 mb-1'>
                      {signature.userName}
                    </p>
                    <p className='text-xs text-gray-700 line-clamp-3'>
                      {signature.message}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Card Footer */}
          <div className='mt-4 text-center text-sm text-gray-600'>
            {signatures.length} {signatures.length === 1 ? 'signature' : 'signatures'}
          </div>
        </div>
      </motion.div>

      {/* Sign Card Button/Form */}
      {canSign && !hasSigned && !isPreview && (
        <div className='w-full max-w-2xl'>
          {!showSignForm ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSignForm(true)}
              className='w-full rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-4 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-shadow'
            >
              ✍️ Sign This Card
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border-2 border-purple-200'
            >
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-xl font-bold text-gray-900 dark:text-white'>
                  Sign the Card
                </h3>
                <button
                  onClick={() => {
                    setShowSignForm(false);
                    setMessage('');
                    setImagePreview(null);
                    setImageFile(null);
                  }}
                  className='text-gray-400 hover:text-gray-600'
                >
                  <X className='h-5 w-5' />
                </button>
              </div>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder='Write your message...'
                className='w-full h-32 p-3 border-2 border-gray-300 rounded-lg resize-none focus:border-purple-500 focus:outline-none mb-4'
                maxLength={500}
              />

              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Add a Photo (Optional)
                </label>
                <div className='flex items-center gap-4'>
                  <label className='cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors'>
                    <ImageIcon className='h-5 w-5' />
                    <span className='text-sm font-medium'>Choose Image</span>
                    <input
                      type='file'
                      accept='image/*'
                      onChange={handleImageSelect}
                      className='hidden'
                    />
                  </label>
                  {imagePreview && (
                    <div className='relative'>
                      <img
                        src={imagePreview}
                        alt='Preview'
                        className='h-20 w-20 object-cover rounded-lg'
                      />
                      <button
                        onClick={() => {
                          setImagePreview(null);
                          setImageFile(null);
                        }}
                        className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1'
                      >
                        <X className='h-3 w-3' />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleSign}
                disabled={!message.trim()}
                className={cn(
                  'w-full rounded-lg px-6 py-3 font-bold text-white',
                  'bg-gradient-to-r from-pink-500 to-purple-600',
                  'hover:from-pink-600 hover:to-purple-700',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'transition-all shadow-lg hover:shadow-xl'
                )}
              >
                Add My Signature ✍️
              </button>
            </motion.div>
          )}
        </div>
      )}

      {hasSigned && (
        <div className='text-center text-green-600 font-semibold'>
          ✓ You've already signed this card!
        </div>
      )}
    </div>
  );
}
