import { firestore, functions, regionalFunctions } from '../lib/utils';
import { sendWeeklySummaryEmail } from '../emails/weekly-summary';
import type { UserRitualState } from '../types/ritual';
import type { User } from '../types/user';
import type { ImpactMoment } from '../types/impact-moment';

// Scheduled function that runs every Sunday at 6 PM UTC
export const sendWeeklySummaries = regionalFunctions.pubsub
  .schedule('0 18 * * 0') // 6 PM UTC every Sunday
  .timeZone('UTC')
  .onRun(async (): Promise<void> => {
    functions.logger.info('Starting weekly summary email job...');

    try {
      // Get all users with ritual state
      const userStatesSnapshot = await firestore()
        .collection('user_ritual_states')
        .get();

      if (userStatesSnapshot.empty) {
        functions.logger.info('No users found.');
        return;
      }

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      let emailsSent = 0;
      let emailsSkipped = 0;

      for (const stateDoc of userStatesSnapshot.docs) {
        try {
          const userState = stateDoc.data() as UserRitualState;
          
          // Check if user wants weekly summary emails
          if (userState.emailPreferences?.weeklySummary === false) {
            emailsSkipped++;
            continue;
          }

          // Get user data
          const userDoc = await firestore()
            .doc(`users/${userState.userId}`)
            .get();
          
          if (!userDoc.exists) {
            continue;
          }

          const user = userDoc.data() as User;

          // Get user's email from Auth
          const admin = await import('firebase-admin');
          let userEmail: string | null = null;
          
          try {
            const userRecord = await admin.auth().getUser(userState.userId);
            userEmail = userRecord.email || null;
          } catch (error) {
            functions.logger.warn(`Could not fetch email for user ${userState.userId}:`, error);
            continue;
          }

          if (!userEmail) {
            continue;
          }

          // Calculate weekly stats
          const ritualsCompleted = userState.completedThisWeek || 0;

          // Get impact moments created this week
          const momentsSnapshot = await firestore()
            .collection('impact_moments')
            .where('createdBy', '==', userState.userId)
            .where('createdAt', '>=', oneWeekAgo)
            .get();

          const impactMomentsCreated = momentsSnapshot.size;

          // Get karma points earned this week (approximate)
          const karmaPointsEarned = user.karmaPoints || 0;
          // Note: In production, you'd want to track weekly karma separately

          // Get actions joined this week
          const joinedActionsSnapshot = await firestore()
            .collection('impact_moments')
            .where('createdBy', '==', userState.userId)
            .where('joinedFromMomentId', '!=', null)
            .where('createdAt', '>=', oneWeekAgo)
            .get();

          const actionsJoined = joinedActionsSnapshot.size;

          // Get how many people joined user's actions this week
          const userMomentsSnapshot = await firestore()
            .collection('impact_moments')
            .where('createdBy', '==', userState.userId)
            .where('joinedFromMomentId', '==', null) // Only original moments
            .get();

          let peopleJoinedActions = 0;
          for (const momentDoc of userMomentsSnapshot.docs) {
            const moment = momentDoc.data() as ImpactMoment;
            if (moment.joinedByUsers && moment.joinedByUsers.length > 0) {
              // Count new joins this week
              const joinedSnapshot = await firestore()
                .collection('impact_moments')
                .where('joinedFromMomentId', '==', momentDoc.id)
                .where('createdAt', '>=', oneWeekAgo)
                .get();
              peopleJoinedActions += joinedSnapshot.size;
            }
          }

          // Only send if user has some activity
          if (ritualsCompleted === 0 && impactMomentsCreated === 0 && actionsJoined === 0) {
            emailsSkipped++;
            continue;
          }

          // Send weekly summary email
          await sendWeeklySummaryEmail({
            userEmail,
            userName: user.name,
            ritualsCompleted,
            impactMomentsCreated,
            karmaPointsEarned,
            currentStreak: userState.currentStreak,
            longestStreak: userState.longestStreak,
            actionsJoined,
            peopleJoinedActions
          });

          emailsSent++;
          functions.logger.info(`Weekly summary sent to ${userEmail}`);
        } catch (error) {
          functions.logger.error(`Error processing user ${stateDoc.id}:`, error);
        }
      }

      functions.logger.info(`Weekly summary job completed. Sent: ${emailsSent}, Skipped: ${emailsSkipped}`);
    } catch (error) {
      functions.logger.error('Error in weekly summary job:', error);
      throw error;
    }
  });

