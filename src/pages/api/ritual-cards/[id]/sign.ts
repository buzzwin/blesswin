import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { usersCollection, ritualCardsCollection } from '@lib/firebase/collections';
import type { SignRitualCardRequest, SignRitualCardResponse, CardSignature } from '@lib/types/ritual-card';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// User custom rituals collection
const userCustomRitualsCollection = (userId: string) => 
  collection(db, 'users', userId, 'custom_rituals');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SignRitualCardResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const { cardId } = req.query;
    const { userId, message, imageFile } = req.body as SignRitualCardRequest;

    if (!userId || typeof userId !== 'string') {
      res.status(401).json({ success: false, error: 'Unauthorized. User ID required.' });
      return;
    }

    if (!cardId || typeof cardId !== 'string') {
      res.status(400).json({ success: false, error: 'Card ID is required' });
      return;
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ success: false, error: 'Message is required' });
      return;
    }

    // Find the card - it could be in any user's custom_rituals
    // We'll need to search or store a reference
    // For now, let's assume we can find it by searching the creator's collection
    // In production, you'd want a cards collection or better indexing
    
    // Get user data
    const userDoc = await getDoc(doc(usersCollection, userId));
    if (!userDoc.exists()) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    const user = userDoc.data();
    const userEmail = (user as any).email;

    // Upload image if provided
    let imageURL: string | undefined;
    if (imageFile) {
      try {
        const storage = getStorage();
        const imageRef = ref(storage, `ritual-cards/${cardId}/signatures/${userId}-${Date.now()}`);
        
        // Handle base64 or File
        let imageData: Blob;
        if (typeof imageFile === 'string') {
          // Base64 string
          const base64Data = imageFile.split(',')[1] || imageFile;
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          imageData = new Blob([byteArray], { type: 'image/jpeg' });
        } else {
          // File object (would need to be converted to base64 on client first)
          // For now, we'll expect base64 from client
          throw new Error('File uploads need to be converted to base64 on client side');
        }

        await uploadBytes(imageRef, imageData);
        imageURL = await getDownloadURL(imageRef);
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        // Continue without image if upload fails
      }
    }

    // Create signature
    const signature: Omit<CardSignature, 'signedAt'> & { signedAt: ReturnType<typeof serverTimestamp> } = {
      userId,
      userName: user.name || user.username || 'Anonymous',
      userPhotoURL: user.photoURL || undefined,
      message: message.trim(),
      imageURL,
      signedAt: serverTimestamp()
    };

    // Find the card - first try dedicated cards collection, then fallback to custom_rituals
    let cardData: any = null;
    let cardCreatorId: string | null = null;
    let customRitualDocRef: any = null;

    // Try dedicated cards collection first
    try {
      const cardDocRef = doc(ritualCardsCollection, cardId);
      const cardDoc = await getDoc(cardDocRef);
      if (cardDoc.exists()) {
        cardData = cardDoc.data();
        cardCreatorId = cardData.cardCreatorId || cardData.createdBy;
        if (cardCreatorId) {
          customRitualDocRef = doc(userCustomRitualsCollection(cardCreatorId), cardId);
        }
      }
    } catch (error) {
      console.error('Error fetching from cards collection:', error);
    }

    // Fallback: use cardCreatorId from request or search in custom_rituals
    if (!cardData) {
      const { cardCreatorId: reqCardCreatorId } = req.body as SignRitualCardRequest & { cardCreatorId?: string };
      if (reqCardCreatorId) {
        cardCreatorId = reqCardCreatorId;
        customRitualDocRef = doc(userCustomRitualsCollection(cardCreatorId), cardId);
        const customCardDoc = await getDoc(customRitualDocRef);
        if (customCardDoc.exists()) {
          cardData = customCardDoc.data();
        }
      }
    }

    if (!cardData || !cardCreatorId || !customRitualDocRef) {
      res.status(404).json({ success: false, error: 'Card not found' });
      return;
    }
    
    // Verify user is invited
    if (!userEmail || !cardData.invitedEmails?.includes(userEmail)) {
      res.status(403).json({ success: false, error: 'You are not invited to sign this card' });
      return;
    }

    // Check if user already signed
    const existingSignatures = cardData.cardSignatures || [];
    if (existingSignatures.some((sig: CardSignature) => sig.userId === userId)) {
      res.status(400).json({ success: false, error: 'You have already signed this card' });
      return;
    }

    // Add signature to both locations
    await updateDoc(customRitualDocRef, {
      cardSignatures: arrayUnion(signature)
    });

    // Also update the dedicated cards collection
    try {
      const cardDocRef = doc(ritualCardsCollection, cardId);
      await updateDoc(cardDocRef, {
        cardSignatures: arrayUnion(signature)
      });
    } catch (error) {
      console.error('Error updating cards collection:', error);
      // Don't fail if this update fails
    }

    res.status(200).json({
      success: true,
      signatureId: signature.id
    });
  } catch (error) {
    console.error('Error signing ritual card:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sign card'
    });
  }
}
