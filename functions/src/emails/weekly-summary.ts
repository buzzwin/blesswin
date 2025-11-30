import { sendEmail, getEmailTemplate } from '../lib/email';

interface WeeklySummaryEmailData {
  userEmail: string;
  userName: string;
  ritualsCompleted: number;
  impactMomentsCreated: number;
  karmaPointsEarned: number;
  currentStreak: number;
  longestStreak: number;
  actionsJoined: number;
  peopleJoinedActions: number;
}

export async function sendWeeklySummaryEmail(data: WeeklySummaryEmailData): Promise<void> {
  const { 
    userEmail, 
    userName, 
    ritualsCompleted, 
    impactMomentsCreated, 
    karmaPointsEarned,
    currentStreak,
    longestStreak,
    actionsJoined,
    peopleJoinedActions
  } = data;
  
  const homeUrl = 'https://buzzwin.com/home';
  
  const content = `
    <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600;">
      📊 Your Week in Review
    </h2>
    
    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
      Hi ${userName},
    </p>
    
    <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
      Here's what you accomplished this week on Buzzwin:
    </p>
    
    <!-- Stats Grid -->
    <table role="presentation" style="width: 100%; margin: 20px 0; border-collapse: collapse;">
      <tr>
        <td style="padding: 20px; background-color: #f3e8ff; border-radius: 8px; text-align: center; width: 50%;">
          <div style="font-size: 32px; font-weight: 700; color: #9333ea; margin-bottom: 8px;">
            ${ritualsCompleted}
          </div>
          <div style="font-size: 14px; color: #666666;">
            Rituals Completed
          </div>
        </td>
        <td style="padding: 20px; background-color: #fce7f3; border-radius: 8px; text-align: center; width: 50%;">
          <div style="font-size: 32px; font-weight: 700; color: #ec4899; margin-bottom: 8px;">
            ${impactMomentsCreated}
          </div>
          <div style="font-size: 14px; color: #666666;">
            Impact Moments
          </div>
        </td>
      </tr>
      <tr>
        <td colspan="2" style="padding-top: 12px;"></td>
      </tr>
      <tr>
        <td style="padding: 20px; background-color: #fef3c7; border-radius: 8px; text-align: center; width: 50%;">
          <div style="font-size: 32px; font-weight: 700; color: #d97706; margin-bottom: 8px;">
            ${karmaPointsEarned}
          </div>
          <div style="font-size: 14px; color: #666666;">
            Karma Points
          </div>
        </td>
        <td style="padding: 20px; background-color: #dbeafe; border-radius: 8px; text-align: center; width: 50%;">
          <div style="font-size: 32px; font-weight: 700; color: #2563eb; margin-bottom: 8px;">
            ${currentStreak}
          </div>
          <div style="font-size: 14px; color: #666666;">
            Day Streak
          </div>
        </td>
      </tr>
    </table>
    
    ${peopleJoinedActions > 0 ? `
    <div style="margin: 20px 0; padding: 20px; background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 4px;">
      <p style="margin: 0 0 8px; color: #065f46; font-size: 16px; font-weight: 600;">
        🌱 Your Impact is Growing!
      </p>
      <p style="margin: 0; color: #047857; font-size: 14px; line-height: 1.6;">
        ${peopleJoinedActions} ${peopleJoinedActions === 1 ? 'person has' : 'people have'} joined your actions this week!
      </p>
    </div>
    ` : ''}
    
    ${actionsJoined > 0 ? `
    <div style="margin: 20px 0; padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
      <p style="margin: 0 0 8px; color: #92400e; font-size: 16px; font-weight: 600;">
        ✨ You Joined ${actionsJoined} ${actionsJoined === 1 ? 'Action' : 'Actions'}!
      </p>
      <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
        Keep spreading positive impact!
      </p>
    </div>
    ` : ''}
    
    ${currentStreak > 0 && currentStreak === longestStreak ? `
    <div style="margin: 20px 0; padding: 20px; background-color: #fef3c7; border-radius: 8px; text-align: center;">
      <p style="margin: 0; color: #92400e; font-size: 16px; font-weight: 600;">
        🔥 New Personal Best! ${currentStreak}-day streak!
      </p>
    </div>
    ` : ''}
    
    <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
      Keep up the amazing work! Every small action creates positive change. 🌱
    </p>
  `;
  
  const html = getEmailTemplate(content, 'Continue Your Journey', homeUrl);
  
  await sendEmail({
    to: userEmail,
    subject: `📊 Your Week on Buzzwin - ${ritualsCompleted} Rituals, ${impactMomentsCreated} Moments`,
    html,
    text: `Your week in review: ${ritualsCompleted} rituals completed, ${impactMomentsCreated} impact moments created, ${karmaPointsEarned} karma points earned. View full summary: ${homeUrl}`
  });
}

