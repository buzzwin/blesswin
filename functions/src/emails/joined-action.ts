import { sendEmail, getEmailTemplate } from '../lib/email';

interface JoinedActionEmailData {
  originalCreatorEmail: string;
  originalCreatorName: string;
  joinerName: string;
  joinerUsername: string;
  momentText: string;
  momentId: string;
  joinCount: number;
}

export async function sendJoinedActionEmail(data: JoinedActionEmailData): Promise<void> {
  const { originalCreatorEmail, originalCreatorName, joinerName, joinerUsername, momentText, momentId, joinCount } = data;
  
  const rippleUrl = `https://buzzwin.com/impact/${momentId}/ripple`;
  const previewText = momentText.length > 150 ? momentText.substring(0, 150) + '...' : momentText;
  
  const content = `
    <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600;">
      🌱 Someone Joined Your Action!
    </h2>
    
    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
      Hi ${originalCreatorName},
    </p>
    
    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
      Great news! <strong>${joinerName}</strong> (@${joinerUsername}) just joined your action:
    </p>
    
    <div style="margin: 20px 0; padding: 20px; background-color: #f9fafb; border-left: 4px solid #9333ea; border-radius: 4px;">
      <p style="margin: 0; color: #333333; font-size: 15px; line-height: 1.6; font-style: italic;">
        "${previewText}"
      </p>
    </div>
    
    <p style="margin: 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
      ${joinCount === 1 
        ? 'They\'re the first person to join! 🌟' 
        : `They're one of ${joinCount} people who have joined your action! 🌟`
      }
    </p>
    
    <p style="margin: 20px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
      Your positive action is creating a ripple effect. Keep inspiring others!
    </p>
  `;
  
  const html = getEmailTemplate(content, 'See Who Joined', rippleUrl);
  
  await sendEmail({
    to: originalCreatorEmail,
    subject: `🌱 ${joinerName} joined your action on Buzzwin`,
    html,
    text: `${joinerName} (@${joinerUsername}) just joined your action: "${previewText}". See the ripple: ${rippleUrl}`
  });
}

