# Email Debugging Guide

## 🔍 Why Emails Aren't Arriving

Based on your setup, here are the most common reasons and solutions:

### 1. **Environment Variables Not Loaded**

**Problem:** Next.js API routes need environment variables to be loaded.

**Solution:**
- Ensure `.env.local` exists in project root
- Restart dev server after creating/modifying `.env.local`
- Check variables are loaded: `console.log(process.env.EMAIL_API)` in API route

### 2. **Gmail App Password Issues**

**Problem:** Gmail App Password might be incorrect or expired.

**Check:**
1. Go to [Google Account](https://myaccount.google.com/)
2. Security → 2-Step Verification → App passwords
3. Verify the app password is correct
4. Regenerate if needed

**Common Issues:**
- Password has spaces (code removes them automatically)
- Password expired
- 2-Step Verification not enabled
- Wrong Gmail account

### 3. **Email Going to Spam**

**Problem:** Gmail filters new senders to spam.

**Solution:**
- Check spam folder in `link2sources@gmail.com`
- Mark as "Not Spam" if found
- Emails should arrive within 1-2 minutes

### 4. **API Route Errors**

**Problem:** Server-side errors preventing email send.

**Check:**
- Browser console for errors
- Server terminal logs
- Network tab for API response

### 5. **Nodemailer Connection Issues**

**Problem:** Can't connect to Gmail SMTP.

**Test Connection:**
```bash
node -e "const nodemailer = require('nodemailer'); const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: 'link2sources@gmail.com', pass: 'dyiqmkcl driu tmke'.replace(/\s/g, '') } }); transporter.verify((err, success) => { if (err) console.error('Error:', err.message); else console.log('✅ Ready'); });"
```

## 🧪 Testing Steps

### Step 1: Verify Environment Variables
```bash
# Check .env.local exists
cat .env.local

# Should show:
# EMAIL_API=link2sources@gmail.com
# EMAIL_API_PASSWORD=dyiqmkcl driu tmke
```

### Step 2: Test Email Connection
```bash
cd /Users/gunjanvijayvergia/site/blesswin
node -e "require('dotenv').config({ path: '.env.local' }); const nodemailer = require('nodemailer'); const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.EMAIL_API, pass: process.env.EMAIL_API_PASSWORD.replace(/\s/g, '') } }); transporter.verify((err, success) => { if (err) { console.error('❌ Error:', err.message); process.exit(1); } else { console.log('✅ Email server ready!'); process.exit(0); } });"
```

### Step 3: Send Test Email via API
1. Start dev server: `npm run dev`
2. Go to `/settings`
3. Click "Send Email Invitation"
4. Enter `link2sources@gmail.com`
5. Click "Send Invitation"
6. Check server logs for errors
7. Check email inbox (and spam folder)

### Step 4: Check Server Logs
Look for:
- `"Sending invite email:"` - Shows email is being sent
- `"Email server connection verified"` - Connection successful
- `"Email sent successfully:"` - Email was sent
- Any error messages

## 🐛 Common Error Messages

### "Email service not configured"
- **Fix:** Set `EMAIL_API_PASSWORD` in `.env.local`
- **Restart:** Dev server after adding env vars

### "Invalid login: 535-5.7.8 Username and Password not accepted"
- **Fix:** Regenerate Gmail App Password
- **Check:** 2-Step Verification is enabled
- **Verify:** Using correct Gmail account

### "Connection timeout"
- **Fix:** Check internet connection
- **Check:** Firewall isn't blocking SMTP (port 587/465)

### "Email sent successfully" but no email received
- **Check:** Spam folder
- **Wait:** 1-2 minutes for delivery
- **Verify:** Correct email address
- **Check:** Gmail account isn't full

## 📧 Quick Test Script

Create `test-email.js` in project root:

```javascript
require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

const emailApi = process.env.EMAIL_API || 'link2sources@gmail.com';
const emailPassword = (process.env.EMAIL_API_PASSWORD || 'dyiqmkcl driu tmke').replace(/\s/g, '');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailApi,
    pass: emailPassword
  }
});

async function testEmail() {
  try {
    console.log('Verifying email connection...');
    await transporter.verify();
    console.log('✅ Server is ready to send emails');

    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: `"Buzzwin Test" <${emailApi}>`,
      to: emailApi,
      subject: 'Test Email from Buzzwin',
      html: '<h1>Test Email</h1><p>If you receive this, email is working!</p>',
      text: 'Test Email - If you receive this, email is working!'
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Check your inbox:', emailApi);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testEmail();
```

Run it:
```bash
node test-email.js
```

## ✅ Success Indicators

When emails are working, you'll see:
1. ✅ "Email server connection verified" in logs
2. ✅ "Email sent successfully" in logs
3. ✅ Success toast: "Invitation sent! ✨"
4. ✅ Email arrives in inbox within 1-2 minutes

## 🔧 Next Steps

1. **Test the invite feature:**
   - Go to `/settings`
   - Send invitation to yourself
   - Check inbox and spam

2. **If still not working:**
   - Run test script above
   - Check Gmail App Password
   - Verify `.env.local` is correct
   - Check server logs for specific errors

3. **Once invite works:**
   - Test joined action emails
   - Test ritual reminder emails
   - Test weekly summary emails

