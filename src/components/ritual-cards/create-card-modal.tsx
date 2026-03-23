import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { X, Mail, Palette, Calendar } from 'lucide-react';
import { cn } from '@lib/utils';
import { Modal } from '@components/modal/modal';
import { useAuth } from '@lib/context/auth-context';
import { BounceButton } from '@components/animations/bounce-button';
import type { CreateRitualCardRequest } from '@lib/types/ritual-card';

interface CreateCardModalProps {
  open: boolean;
  closeModal: () => void;
  onSuccess?: (cardId: string) => void;
}

const cardTypes = [
  { value: 'birthday', label: '🎂 Birthday', icon: '🎂' },
  { value: 'anniversary', label: '💍 Anniversary', icon: '💍' },
  { value: 'holiday', label: '🎉 Holiday', icon: '🎉' },
  { value: 'celebration', label: '🎊 Celebration', icon: '🎊' },
  { value: 'custom', label: '✨ Custom', icon: '✨' }
];

const patterns = [
  { value: 'solid', label: 'Solid' },
  { value: 'dots', label: 'Dots' },
  { value: 'stripes', label: 'Stripes' },
  { value: 'hearts', label: 'Hearts' },
  { value: 'stars', label: 'Stars' }
];

const colorPresets = [
  { bg: '#fff8e1', border: '#f59e0b', name: 'Warm Yellow' },
  { bg: '#fce4ec', border: '#ec4899', name: 'Pink' },
  { bg: '#e3f2fd', border: '#3b82f6', name: 'Blue' },
  { bg: '#f3e5f5', border: '#9333ea', name: 'Purple' },
  { bg: '#e8f5e9', border: '#10b981', name: 'Green' }
];

export function CreateCardModal({
  open,
  closeModal,
  onSuccess
}: CreateCardModalProps): JSX.Element {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cardType, setCardType] = useState<'birthday' | 'anniversary' | 'holiday' | 'celebration' | 'custom'>('birthday');
  const [recipientName, setRecipientName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [selectedColor, setSelectedColor] = useState(colorPresets[0]);
  const [pattern, setPattern] = useState<'solid' | 'dots' | 'stripes' | 'hearts' | 'stars'>('solid');

  const handleAddEmail = (): void => {
    const email = emailInput.trim();
    if (!email) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (invitedEmails.includes(email)) {
      toast.error('This email is already added');
      return;
    }

    setInvitedEmails([...invitedEmails, email]);
    setEmailInput('');
  };

  const handleRemoveEmail = (email: string): void => {
    setInvitedEmails(invitedEmails.filter(e => e !== email));
  };

  const handleSubmit = async (): Promise<void> => {
    if (!user?.id) {
      toast.error('Please sign in to create a card');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    if (invitedEmails.length === 0) {
      toast.error('Please add at least one email address to invite');
      return;
    }

    setLoading(true);
    try {
      const request: CreateRitualCardRequest = {
        userId: user.id,
        title: title.trim(),
        description: description.trim(),
        cardType,
        recipientName: recipientName.trim() || undefined,
        eventDate: eventDate || undefined,
        invitedEmails,
        cardDesign: {
          backgroundColor: selectedColor.bg,
          borderColor: selectedColor.border,
          pattern
        }
      };

      const response = await fetch('/api/ritual-cards/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create card');
      }

      toast.success('Card created! Invitations sent! 🎉');
      closeModal();
      onSuccess?.(data.cardId);
      
      // Reset form
      setTitle('');
      setDescription('');
      setRecipientName('');
      setEventDate('');
      setInvitedEmails([]);
      setEmailInput('');
    } catch (error) {
      console.error('Error creating card:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create card');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      modalClassName='max-w-3xl bg-white dark:bg-gray-900 w-full p-6 rounded-2xl max-h-[90vh] overflow-y-auto'
      open={open}
      closeModal={closeModal}
    >
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
              Create a Ritual Card 💌
            </h2>
            <p className='mt-1 text-sm text-gray-600 dark:text-gray-400'>
              Invite friends to sign a beautiful greeting card
            </p>
          </div>
          <button
            onClick={closeModal}
            className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        {/* Card Type */}
        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
            Card Type
          </label>
          <div className='grid grid-cols-5 gap-2'>
            {cardTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setCardType(type.value as any)}
                className={cn(
                  'p-3 rounded-lg border-2 transition-all',
                  cardType === type.value
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                )}
              >
                <div className='text-2xl mb-1'>{type.icon}</div>
                <div className='text-xs font-medium'>{type.label.replace(/^[^\s]+\s/, '')}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
            Card Title *
          </label>
          <input
            type='text'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='e.g., Join me in wishing Paul a very happy birthday'
            className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none'
            maxLength={100}
          />
        </div>

        {/* Description */}
        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
            Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Add a message or description for the card...'
            className='w-full h-24 px-4 py-2 border-2 border-gray-300 rounded-lg resize-none focus:border-purple-500 focus:outline-none'
            maxLength={500}
          />
        </div>

        {/* Recipient Name */}
        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
            Recipient Name (Optional)
          </label>
          <input
            type='text'
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder='e.g., Paul'
            className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none'
          />
        </div>

        {/* Event Date */}
        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
            Event Date (Optional)
          </label>
          <input
            type='date'
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none'
          />
        </div>

        {/* Invited Emails */}
        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
            Invite People by Email *
          </label>
          <div className='flex gap-2 mb-2'>
            <input
              type='email'
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
              placeholder='Enter email address'
              className='flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none'
            />
            <BounceButton variant='primary' onClick={handleAddEmail}>
              Add
            </BounceButton>
          </div>
          {invitedEmails.length > 0 && (
            <div className='flex flex-wrap gap-2 mt-2'>
              {invitedEmails.map((email) => (
                <span
                  key={email}
                  className='inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm'
                >
                  {email}
                  <button
                    onClick={() => handleRemoveEmail(email)}
                    className='hover:text-purple-900'
                  >
                    <X className='h-3 w-3' />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Card Design */}
        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
            Card Design
          </label>
          <div className='space-y-4'>
            {/* Color Presets */}
            <div>
              <p className='text-xs text-gray-600 dark:text-gray-400 mb-2'>Color Theme</p>
              <div className='flex gap-2'>
                {colorPresets.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      'w-16 h-16 rounded-lg border-4 transition-all',
                      selectedColor.name === color.name
                        ? 'border-purple-500 scale-110'
                        : 'border-gray-300 hover:scale-105'
                    )}
                    style={{
                      background: `linear-gradient(135deg, ${color.bg} 0%, ${color.bg} 50%, ${color.border} 50%, ${color.border} 100%)`
                    }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Pattern */}
            <div>
              <p className='text-xs text-gray-600 dark:text-gray-400 mb-2'>Pattern</p>
              <div className='flex gap-2'>
                {patterns.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPattern(p.value as any)}
                    className={cn(
                      'px-4 py-2 rounded-lg border-2 transition-all',
                      pattern === p.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className='flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700'>
          <BounceButton variant='secondary' onClick={closeModal} disabled={loading}>
            Cancel
          </BounceButton>
          <BounceButton
            variant='primary'
            onClick={handleSubmit}
            disabled={loading || !title.trim() || !description.trim() || invitedEmails.length === 0}
          >
            {loading ? 'Creating...' : 'Create Card & Send Invites 📧'}
          </BounceButton>
        </div>
      </div>
    </Modal>
  );
}
