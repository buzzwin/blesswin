#!/usr/bin/env node

/**
 * Test Email Script
 * Run this to verify email sending works
 * Usage: node test-email.js
 */

const nodemailer = require('nodemailer');

// Email credentials (hardcoded for testing)
const emailApi = 'link2sources@gmail.com';
const emailPassword = 'dyiqmkcl driu tmke'.replace(/\s/g, ''); // Remove spaces

console.log('📧 Testing Email Configuration...\n');
console.log('Email:', emailApi);
console.log('Password length:', emailPassword.length, 'characters\n');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailApi,
    pass: emailPassword
  }
});

async function testEmail() {
  try {
    // Step 1: Verify connection
    console.log('Step 1: Verifying email server connection...');
    await transporter.verify();
    console.log('✅ Server is ready to send emails\n');

    // Step 2: Send test email
    console.log('Step 2: Sending test email...');
    const info = await transporter.sendMail({
      from: `"Buzzwin Test" <${emailApi}>`,
      to: emailApi,
      subject: '🧪 Test Email from Buzzwin',
      html: `
        <h1>Test Email</h1>
        <p>If you receive this email, your email configuration is working correctly!</p>
        <p>You can now test the invite friend feature.</p>
      `,
      text: 'Test Email - If you receive this, email is working!'
    });

    console.log('✅ Email sent successfully!');
    console.log('📬 Message ID:', info.messageId);
    console.log('📧 Check your inbox:', emailApi);
    console.log('⏰ Email should arrive within 1-2 minutes');
    console.log('📁 Also check your spam folder if not in inbox\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('\n🔐 Authentication failed. Possible issues:');
      console.error('  1. Gmail App Password is incorrect');
      console.error('  2. 2-Step Verification not enabled');
      console.error('  3. App Password expired');
      console.error('\n💡 Solution:');
      console.error('  1. Go to https://myaccount.google.com/');
      console.error('  2. Security → 2-Step Verification → App passwords');
      console.error('  3. Generate a new App Password');
      console.error('  4. Update .env.local with the new password');
    } else if (error.code === 'ECONNECTION') {
      console.error('\n🌐 Connection failed. Check your internet connection.');
    } else {
      console.error('\n📋 Full error:', error);
    }
    
    process.exit(1);
  }
}

testEmail();

