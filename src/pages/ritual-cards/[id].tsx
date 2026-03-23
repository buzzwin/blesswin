import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc, query, where, getDocs, collection } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { usersCollection, ritualCardsCollection } from '@lib/firebase/collections';
import { doc as firestoreDoc } from 'firebase/firestore';
import { MainContainer } from '@components/home/main-container';
import { MainHeader } from '@components/home/main-header';
import { SEO } from '@components/common/seo';
import { GreetingCard } from '@components/ritual-cards/greeting-card';
import { Loading } from '@components/ui/loading';
import { useAuth } from '@lib/context/auth-context';
import { toast } from 'react-hot-toast';
import type { RitualCard, CardSignature } from '@lib/types/ritual-card';

export default function RitualCardPage(): JSX.Element {
  const router = useRouter();
  const { id } = router.query;
  const { user, userEmail } = useAuth();
  const [card, setCard] = useState<RitualCard | null>(null);
  const [signatures, setSignatures] = useState<CardSignature[]>([]);
  const [loading, setLoading] = useState(true);
  const [canSign, setCanSign] = useState(false);

  useEffect(() => {
    const fetchCard = async (): Promise<void> => {
      if (!id || typeof id !== 'string') return;

      try {
        setLoading(true);
        
        // Try dedicated cards collection first
        let foundCard: RitualCard | null = null;
        let cardCreatorId: string | null = null;

        try {
          const cardDoc = await getDoc(firestoreDoc(ritualCardsCollection, id));
          if (cardDoc.exists()) {
            const data = cardDoc.data() as any;
            if (data.type === 'card') {
              foundCard = { id: cardDoc.id, ...data } as RitualCard;
              cardCreatorId = data.cardCreatorId || data.createdBy;
            }
          }
        } catch (error) {
          console.error('Error fetching from cards collection:', error);
        }

        // Fallback: search in custom_rituals if not found
        if (!foundCard) {
          const usersSnapshot = await getDocs(usersCollection);
          for (const userDoc of usersSnapshot.docs) {
            const customRitualsRef = collection(db, 'users', userDoc.id, 'custom_rituals');
            const cardDoc = await getDoc(doc(customRitualsRef, id));
            
            if (cardDoc.exists()) {
              const data = cardDoc.data();
              if (data.type === 'card') {
                foundCard = { id: cardDoc.id, ...data } as RitualCard;
                cardCreatorId = userDoc.id;
                break;
              }
            }
          }
        }

        if (!foundCard) {
          toast.error('Card not found');
          router.push('/automations?tab=rituals');
          return;
        }

        setCard(foundCard);
        setSignatures(foundCard.cardSignatures || []);

        // Check if user can sign
        if (userEmail && foundCard.invitedEmails?.includes(userEmail)) {
          const hasSigned = foundCard.cardSignatures?.some(sig => sig.userId === user?.id);
          setCanSign(!hasSigned);
        }
      } catch (error) {
        console.error('Error fetching card:', error);
        toast.error('Failed to load card');
      } finally {
        setLoading(false);
      }
    };

    void fetchCard();
  }, [id, user, router]);

  const handleSign = async (message: string, imageFile?: File): Promise<void> => {
    if (!user?.id || !card?.id) return;

    try {
      // Convert image to base64 if provided
      let imageBase64: string | undefined;
      if (imageFile) {
        imageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
      }

      // Find card creator ID (from the card data, which may have cardCreatorId)
      const cardData = card as any;
      const creatorIdForSign = cardData.cardCreatorId || cardData.createdBy;
      
      const response = await fetch(`/api/ritual-cards/${card.id}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          cardId: card.id,
          message,
          imageFile: imageBase64,
          cardCreatorId: creatorIdForSign
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign card');
      }

      toast.success('Card signed! 🎉');
      
      // Refresh card data
      const cardCreatorId = (card as any).cardCreatorId || (card as any).createdBy;
      if (cardCreatorId) {
        const customRitualsRef = collection(db, 'users', cardCreatorId, 'custom_rituals');
        const cardDoc = await getDoc(doc(customRitualsRef, card.id));
        if (cardDoc.exists()) {
          const updatedData = cardDoc.data();
          setCard({ ...card, cardSignatures: updatedData.cardSignatures || [] });
          setSignatures(updatedData.cardSignatures || []);
          setCanSign(false);
        }
      }
      
      // Also refresh from cards collection
      try {
        const cardDoc = await getDoc(firestoreDoc(ritualCardsCollection, card.id));
        if (cardDoc.exists()) {
          const updatedData = cardDoc.data();
          setCard({ ...card, cardSignatures: updatedData.cardSignatures || [] });
          setSignatures(updatedData.cardSignatures || []);
        }
      } catch (error) {
        console.error('Error refreshing from cards collection:', error);
      }
    } catch (error) {
      console.error('Error signing card:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to sign card');
    }
  };

  if (loading) {
    return (
      <MainContainer>
        <MainHeader title='Ritual Card' />
        <div className='flex items-center justify-center min-h-[400px]'>
          <Loading />
        </div>
      </MainContainer>
    );
  }

  if (!card) {
    return (
      <MainContainer>
        <MainHeader title='Card Not Found' />
        <div className='text-center py-12'>
          <p className='text-gray-600 dark:text-gray-400'>This card could not be found.</p>
        </div>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <SEO title={`${card.title} - Ritual Card / Buzzwin`} />
      <MainHeader title='Ritual Card' />
      
      <div className='py-6'>
        <GreetingCard
          card={card}
          signatures={signatures}
          currentUserId={user?.id}
          onSign={handleSign}
          canSign={canSign}
        />
      </div>
    </MainContainer>
  );
}
