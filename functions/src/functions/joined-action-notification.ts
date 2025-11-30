import { firestore, functions, regionalFunctions } from '../lib/utils';
import { sendJoinedActionEmail } from '../emails/joined-action';
import type { ImpactMoment } from '../types/impact-moment';
import type { User } from '../types/user';

export const notifyJoinedAction = regionalFunctions.firestore
  .document('impact_moments/{momentId}')
  .onCreate(async (snapshot): Promise<void> => {
    functions.logger.info('Checking if this is a joined action...');

    const momentData = snapshot.data() as ImpactMoment;
    
    // Only send email if this is a joined action
    if (!momentData.joinedFromMomentId) {
      functions.logger.info('Not a joined action, skipping email.');
      return;
    }

    try {
      // Get the original moment and its creator
      const originalMomentDoc = await firestore()
        .doc(`impact_moments/${momentData.joinedFromMomentId}`)
        .get();
      
      if (!originalMomentDoc.exists) {
        functions.logger.warn('Original moment not found, skipping email.');
        return;
      }

      const originalMoment = originalMomentDoc.data() as ImpactMoment;
      const originalCreatorId = originalMoment.createdBy;

      // Get original creator's user data
      const originalCreatorDoc = await firestore()
        .doc(`users/${originalCreatorId}`)
        .get();
      
      if (!originalCreatorDoc.exists) {
        functions.logger.warn('Original creator not found, skipping email.');
        return;
      }

      const originalCreator = originalCreatorDoc.data() as User;
      
      // Check if user has email and email preferences
      // For now, we'll check if they have an email in their auth record
      // In production, you'd want to store email in user doc or check auth
      // For MVP, we'll try to get email from Firebase Auth
      const admin = await import('firebase-admin');
      let userEmail: string | null = null;
      
      try {
        const userRecord = await admin.auth().getUser(originalCreatorId);
        userEmail = userRecord.email || null;
      } catch (error) {
        functions.logger.warn('Could not fetch user email from Auth:', error);
      }

      if (!userEmail) {
        functions.logger.info('No email found for user, skipping email notification.');
        return;
      }

      // Get joiner's user data
      const joinerDoc = await firestore()
        .doc(`users/${momentData.createdBy}`)
        .get();
      
      if (!joinerDoc.exists) {
        functions.logger.warn('Joiner not found, skipping email.');
        return;
      }

      const joiner = joinerDoc.data() as User;

      // Get current join count
      const joinedMomentsSnapshot = await firestore()
        .collection('impact_moments')
        .where('joinedFromMomentId', '==', momentData.joinedFromMomentId)
        .get();
      
      const joinCount = joinedMomentsSnapshot.size;

      // Check email preferences from user ritual state
      const userRitualStateDoc = await firestore()
        .doc(`user_ritual_states/${originalCreatorId}`)
        .get();
      
      const userRitualState = userRitualStateDoc.exists ? userRitualStateDoc.data() : null;
      const emailPreferences = userRitualState?.emailPreferences || {};
      
      // Default to enabled if not set
      if (emailPreferences.joinedAction === false) {
        functions.logger.info('User has disabled joined action emails, skipping.');
        return;
      }

      // Send email
      await sendJoinedActionEmail({
        originalCreatorEmail: userEmail,
        originalCreatorName: originalCreator.name,
        joinerName: joiner.name,
        joinerUsername: joiner.username,
        momentText: originalMoment.text,
        momentId: momentData.joinedFromMomentId,
        joinCount
      });

      functions.logger.info(`Joined action email sent to ${userEmail}`);
    } catch (error) {
      functions.logger.error('Error sending joined action email:', error);
      // Don't throw - we don't want to fail the moment creation
    }
  });

