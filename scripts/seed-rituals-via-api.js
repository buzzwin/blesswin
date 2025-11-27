#!/usr/bin/env node

/**
 * Alternative seed script that uses the API endpoint
 * This works if you have the dev server running and are authenticated
 * 
 * Usage:
 * 1. Start your dev server: npm run dev
 * 2. Make sure you're logged in to the app
 * 3. Get your auth token (check browser console or localStorage)
 * 4. Run: node scripts/seed-rituals-via-api.js [AUTH_TOKEN]
 * 
 * Or use without token (will prompt for manual API call)
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const authToken = process.argv[2];

async function seedViaAPI() {
  console.log('🌱 Seeding rituals via API endpoint...\n');
  console.log(`📡 Using: ${BASE_URL}/api/admin/seed-rituals\n`);

  if (!authToken) {
    console.log('⚠️  No auth token provided.');
    console.log('\nTo use this script:');
    console.log('1. Start your dev server: npm run dev');
    console.log('2. Log in to the app');
    console.log('3. Open browser console and run:');
    console.log('   fetch("/api/admin/seed-rituals", { method: "POST" })');
    console.log('     .then(r => r.json())');
    console.log('     .then(console.log);');
    console.log('\nOr provide an auth token:');
    console.log('   node scripts/seed-rituals-via-api.js YOUR_TOKEN\n');
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/admin/seed-rituals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ API Error:', error);
      return;
    }

    const data = await response.json();

    if (!data.success) {
      console.error('❌ Seeding failed:', data.error);
      return;
    }

    console.log('✅ Seeding successful!');
    console.log(`   Added: ${data.added} rituals`);
    console.log(`   Skipped: ${data.skipped} rituals`);
    console.log(`   Total: ${data.total} rituals`);
    console.log('\n🎉 Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nMake sure:');
    console.error('1. Dev server is running (npm run dev)');
    console.error('2. You are authenticated');
    console.error('3. API endpoint is accessible');
  }
}

seedViaAPI();

