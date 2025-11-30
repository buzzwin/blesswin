# Invite Friend Feature Setup

## ✅ Feature Created

A new "Invite Friends" feature has been added to the Settings page that allows users to send email invitations to their friends.

## 📍 Location

- **Settings Page:** `/settings`
- **Component:** `src/components/invite/invite-friend-modal.tsx`
- **API Endpoint:** `/api/invite-friend`

## 🚀 How to Use

1. Go to `/settings` page
2. Scroll to "Invite Friends" section
3. Click "Send Email Invitation" button
4. Fill in:
   - Friend's Email (required)
   - Friend's Name (optional)
   - Personal Message (optional)
5. Click "Send Invitation"

## ⚙️ Configuration

### Environment Variables Required

The API route needs these environment variables set:

```bash
EMAIL_API=link2sources@gmail.com
EMAIL_API_PASSWORD=dyiqmkcl driu tmke  # Gmail App Password (remove spaces)
```

### For Local Development

Create `.env.local` file in project root:

```bash
EMAIL_API=link2sources@gmail.com
EMAIL_API_PASSWORD=dyiqmkcl driu tmke
```

**Important:** Remove spaces from the app password when setting it.

### For Production (Vercel/Netlify)

Set these as environment variables in your hosting platform:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Build & Deploy → Environment

## 🧪 Testing

### Quick Test:
1. Go to `/settings`
2. Click "Send Email Invitation"
3. Enter your own email address (`link2sources@gmail.com`)
4. Send invitation
5. Check your inbox!

### Expected Result:
- Success toast: "Invitation sent! ✨"
- Email arrives in inbox within seconds
- Email contains:
  - Invitation message
  - "Join Buzzwin Now" button
  - Link to signup page with invite code

## 🔍 Troubleshooting

### "Email service not configured" Error
- **Solution:** Set `EMAIL_API_PASSWORD` environment variable
- Check `.env.local` file exists and has correct values
- Restart dev server after adding env vars

### "Invalid credentials" Error
- **Solution:** Verify Gmail App Password is correct
- Ensure 2-Step Verification is enabled
- Regenerate App Password if needed
- Remove spaces from password

### Email Not Arriving
1. Check spam folder
2. Verify email address is correct
3. Check server logs for errors
4. Verify environment variables are set correctly

### "Module not found: nodemailer"
- **Solution:** Run `npm install` to install dependencies
- Nodemailer should be installed automatically

## 📧 Email Content

The invitation email includes:
- Personalized message from the inviter
- Buzzwin branding and description
- "Join Buzzwin Now" CTA button
- Signup link with invite code
- Footer with unsubscribe info

## 🔐 Security Notes

- Email credentials are stored in environment variables (never in code)
- API route validates email format before sending
- Rate limiting should be added for production
- Consider adding CAPTCHA to prevent spam

## 🎯 Next Steps

1. **Set Environment Variables:**
   ```bash
   # Create .env.local
   echo "EMAIL_API=link2sources@gmail.com" > .env.local
   echo "EMAIL_API_PASSWORD=your-app-password" >> .env.local
   ```

2. **Restart Dev Server:**
   ```bash
   npm run dev
   ```

3. **Test the Feature:**
   - Go to `/settings`
   - Send yourself an invitation
   - Check your email inbox

4. **Deploy Cloud Function (Optional):**
   - The Cloud Function `sendInviteEmail` is ready but not deployed
   - For now, the API route sends emails directly
   - Deploy Cloud Function for better scalability:
     ```bash
     npm run deploy:email-functions
     ```

## 📝 Files Created

- `src/pages/api/invite-friend.ts` - API endpoint
- `src/components/invite/invite-friend-modal.tsx` - UI component
- `functions/src/functions/send-invite-email.ts` - Cloud Function (optional)

## 🎉 Benefits

- **Test Email System:** Use this to verify emails are working
- **User Growth:** Easy way for users to invite friends
- **Viral Growth:** Each invite includes signup link
- **Personal Touch:** Users can add custom messages

