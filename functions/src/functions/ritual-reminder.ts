import { firestore, functions, regionalFunctions } from '../lib/utils';
import { sendRitualReminderEmail } from '../emails/ritual-reminder';
import type { RitualDefinition, UserRitualState } from '../types/ritual';
import type { User } from '../types/user';

// Scheduled function that runs daily at 8 AM UTC
export const sendRitualReminders = regionalFunctions.pubsub
  .schedule('0 8 * * *') // 8 AM UTC daily
  .timeZone('UTC')
  .onRun(async (): Promise<void> => {
    functions.logger.info('Starting ritual reminder email job...');

    try {
      // Get all users with ritual state enabled
      const userStatesSnapshot = await firestore()
        .collection('user_ritual_states')
        .where('enabled', '==', true)
        .get();

      if (userStatesSnapshot.empty) {
        functions.logger.info('No users with enabled rituals found.');
        return;
      }

      const now = new Date();
      const currentHour = now.getUTCHours();
      const currentMinute = now.getUTCMinutes();
      const currentTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

      let emailsSent = 0;
      let emailsSkipped = 0;

      for (const stateDoc of userStatesSnapshot.docs) {
        try {
          const userState = stateDoc.data() as UserRitualState;
          
          // Determine if this is morning or evening reminder time
          const morningTime = userState.notificationPreferences.morningTime || '08:00';
          const eveningTime = userState.notificationPreferences.eveningTime || '19:00';
          
          const [morningHour, morningMin] = morningTime.split(':').map(Number);
          const [eveningHour, eveningMin] = eveningTime.split(':').map(Number);
          
          const isMorningTime = currentHour === morningHour && currentMinute >= morningMin && currentMinute < morningMin + 15;
          const isEveningTime = currentHour === eveningHour && currentMinute >= eveningMin && currentMinute < eveningMin + 15;
          
          // Skip if not the right time
          if (!isMorningTime && !isEveningTime) {
            continue;
          }
          
          // Check if user wants reminders at this time
          if (isMorningTime && !userState.notificationPreferences.morning) {
            continue;
          }
          
          if (isEveningTime && !userState.notificationPreferences.evening) {
            continue;
          }

          // Check quiet hours
          const quietStart = userState.notificationPreferences.quietHoursStart || '22:00';
          const quietEnd = userState.notificationPreferences.quietHoursEnd || '07:00';
          
          if (isInQuietHours(currentTime, quietStart, quietEnd)) {
            functions.logger.info(`Skipping ${userState.userId} - in quiet hours`);
            emailsSkipped++;
            continue;
          }

          // Check if user wants email reminders
          if (userState.emailPreferences?.ritualReminders === false) {
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

          // Get today's global ritual
          const ritualsSnapshot = await firestore()
            .collection('rituals')
            .where('isGlobal', '==', true)
            .limit(1)
            .get();

          if (ritualsSnapshot.empty) {
            functions.logger.warn('No global ritual found for today');
            continue;
          }

          const ritual = ritualsSnapshot.docs[0].data() as RitualDefinition;

          // Send reminder email
          await sendRitualReminderEmail({
            userEmail,
            userName: user.name,
            ritualTitle: ritual.title,
            ritualDescription: ritual.description,
            ritualTags: ritual.tags,
            currentStreak: userState.currentStreak
          });

          emailsSent++;
          functions.logger.info(`Ritual reminder sent to ${userEmail}`);
        } catch (error) {
          functions.logger.error(`Error processing user ${stateDoc.id}:`, error);
        }
      }

      functions.logger.info(`Ritual reminder job completed. Sent: ${emailsSent}, Skipped: ${emailsSkipped}`);
    } catch (error) {
      functions.logger.error('Error in ritual reminder job:', error);
      throw error;
    }
  });

function isInQuietHours(currentTime: string, quietStart: string, quietEnd: string): boolean {
  const [currentHour, currentMin] = currentTime.split(':').map(Number);
  const [startHour, startMin] = quietStart.split(':').map(Number);
  const [endHour, endMin] = quietEnd.split(':').map(Number);

  const currentMinutes = currentHour * 60 + currentMin;
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  // Handle quiet hours that span midnight
  if (startMinutes > endMinutes) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }

  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

