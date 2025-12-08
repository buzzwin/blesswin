import { sendEmail, getEmailTemplate } from '../lib/email';

interface RitualReminderEmailData {
  userEmail: string;
  userName: string;
  ritualTitle: string;
  ritualDescription: string;
  ritualTags: string[];
  currentStreak: number;
}

export async function sendRitualReminderEmail(data: RitualReminderEmailData): Promise<void> {
  const { userEmail, userName, ritualTitle, ritualDescription, ritualTags, currentStreak } = data;
  
  const ritualsUrl = 'https://buzzwin.com/rituals';
  const tagsDisplay = ritualTags.length > 0 ? ritualTags.join(', ') : 'Wellness';
  
  const content = `
    <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600;">
      ✨ Your Daily Ritual Awaits
    </h2>
    
    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
      Hi ${userName},
    </p>
    
    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
      It's time for today's ritual! Here's what's waiting for you:
    </p>
    
    <div style="margin: 20px 0; padding: 24px; background: linear-gradient(135deg, #f3e8ff 0%, #fce7f3 100%); border-radius: 8px;">
      <h3 style="margin: 0 0 12px; color: #9333ea; font-size: 20px; font-weight: 600;">
        ${ritualTitle}
      </h3>
      <p style="margin: 0 0 12px; color: #333333; font-size: 15px; line-height: 1.6;">
        ${ritualDescription}
      </p>
      <div style="margin-top: 12px;">
        <span style="display: inline-block; padding: 4px 12px; background-color: #ffffff; color: #9333ea; border-radius: 12px; font-size: 12px; font-weight: 500;">
          ${tagsDisplay}
        </span>
      </div>
    </div>
    
    ${currentStreak > 0 ? `
    <div style="margin: 20px 0; padding: 16px; background-color: #fef3c7; border-radius: 8px; text-align: center;">
      <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">
        🔥 ${currentStreak}-day streak! Keep it going!
      </p>
    </div>
    ` : ''}
    
    <p style="margin: 20px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
      Complete your ritual and share your participation with the community! You can also join other rituals that inspire you.
    </p>
  `;
  
  const html = getEmailTemplate(content, 'Complete Ritual', ritualsUrl);
  
  await sendEmail({
    to: userEmail,
    subject: `✨ ${ritualTitle} - Your Daily Ritual`,
    html,
    text: `Your daily ritual: ${ritualTitle}. ${ritualDescription}. Complete it here: ${ritualsUrl}`
  });
}

