#!/usr/bin/env node

/**
 * Deploy Email Firebase Functions Script
 * Builds and deploys email-related Firebase Cloud Functions
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  const prefix = color === 'green' ? '✓' : color === 'red' ? '✗' : color === 'yellow' ? '⚠' : 'ℹ';
  console.log(`${colors[color]}${prefix}${colors.reset} ${message}`);
}

function exec(command, options = {}) {
  try {
    return execSync(command, { stdio: 'inherit', ...options });
  } catch (error) {
    log(`Command failed: ${command}`, 'red');
    process.exit(1);
  }
}

// Check Firebase CLI
try {
  execSync('firebase --version', { stdio: 'ignore' });
  log('Firebase CLI found', 'green');
} catch {
  log('Firebase CLI not found. Install with: npm install -g firebase-tools', 'red');
  process.exit(1);
}

// Check authentication
try {
  execSync('firebase projects:list', { stdio: 'ignore' });
  log('Firebase authentication verified', 'green');
} catch {
  log('Not logged in. Run: firebase login', 'red');
  process.exit(1);
}

const projectDir = path.resolve(__dirname, '..');
const functionsDir = path.join(projectDir, 'functions');

if (!fs.existsSync(functionsDir)) {
  log(`Functions directory not found: ${functionsDir}`, 'red');
  process.exit(1);
}

log(`Project directory: ${projectDir}`, 'blue');
log(`Functions directory: ${functionsDir}`, 'blue');

// Install dependencies
log('Installing dependencies...', 'blue');
process.chdir(functionsDir);
exec('npm install');

// Build TypeScript
log('Building TypeScript...', 'blue');
exec('npm run build');

if (!fs.existsSync(path.join(functionsDir, 'lib'))) {
  log("Build output directory 'lib' not found", 'red');
  process.exit(1);
}

log('TypeScript build completed', 'green');

// Deploy functions
process.chdir(projectDir);
log('Deploying Firebase Functions...', 'blue');
log('This will deploy:', 'blue');
console.log('  - notifyJoinedAction (joined action notifications)');
console.log('  - sendRitualReminders (daily ritual reminders)');
console.log('  - sendWeeklySummaries (weekly progress summaries)');
console.log('');

// Deploy only email-related functions
exec('firebase deploy --only functions:notifyJoinedAction,functions:sendRitualReminders,functions:sendWeeklySummaries');

log('Functions deployed successfully!', 'green');
console.log('');
log('Deployed functions:', 'blue');
console.log('  ✓ notifyJoinedAction - Sends email when someone joins an action');
console.log('  ✓ sendRitualReminders - Scheduled daily ritual reminder emails');
console.log('  ✓ sendWeeklySummaries - Scheduled weekly progress summary emails');
console.log('');
log('To view logs, run: firebase functions:log', 'blue');

