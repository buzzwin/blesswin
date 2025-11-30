#!/bin/bash

# Deploy Email Firebase Functions Script
# This script builds and deploys the email-related Firebase Cloud Functions

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    print_error "Firebase CLI is not installed. Please install it first:"
    echo "  npm install -g firebase-tools"
    exit 1
fi

print_success "Firebase CLI found"

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    print_error "Not logged in to Firebase. Please login first:"
    echo "  firebase login"
    exit 1
fi

print_success "Firebase authentication verified"

# Get project directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
FUNCTIONS_DIR="$PROJECT_DIR/functions"

print_info "Project directory: $PROJECT_DIR"
print_info "Functions directory: $FUNCTIONS_DIR"

# Check if functions directory exists
if [ ! -d "$FUNCTIONS_DIR" ]; then
    print_error "Functions directory not found: $FUNCTIONS_DIR"
    exit 1
fi

# Note about secrets
print_info "Note: For production, set secrets in Firebase Console:"
echo "  Functions → Configuration → Secrets"
echo "  Required: EMAIL_API, EMAIL_API_PASSWORD, TARGET_EMAIL"
echo ""

# Navigate to functions directory
cd "$FUNCTIONS_DIR"

# Check if .env file exists for local testing
if [ -f ".env" ]; then
    print_info "Found .env file - will use for local testing"
    print_warning "Note: For production, set secrets in Firebase Console"
else
    print_warning ".env file not found. For local testing, create functions/.env"
    print_info "For production deployment, secrets should be set in Firebase Console"
fi

# Install dependencies
print_info "Installing dependencies..."
if npm install; then
    print_success "Dependencies installed"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Build TypeScript
print_info "Building TypeScript..."
if npm run build; then
    print_success "TypeScript build completed"
else
    print_error "TypeScript build failed"
    exit 1
fi

# Check build output
if [ ! -d "lib" ]; then
    print_error "Build output directory 'lib' not found"
    exit 1
fi

print_success "Build output verified"

# Go back to project root
cd "$PROJECT_DIR"

# Deploy functions
print_info "Deploying Firebase Functions..."
print_info "This will deploy:"
echo "  - notifyJoinedAction (joined action notifications)"
echo "  - sendRitualReminders (daily ritual reminders)"
echo "  - sendWeeklySummaries (weekly progress summaries)"
echo ""

# Check if running in non-interactive mode (CI/CD or with --yes flag)
if [[ "$1" == "--yes" ]] || [[ "$CI" == "true" ]] || [[ -n "$NON_INTERACTIVE" ]]; then
    print_info "Non-interactive mode: proceeding with deployment..."
else
    read -p "Continue with deployment? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Deployment cancelled"
        exit 0
    fi
fi

# Deploy only email-related functions
if firebase deploy --only functions:notifyJoinedAction,functions:sendRitualReminders,functions:sendWeeklySummaries; then
    print_success "Functions deployed successfully!"
    echo ""
    print_info "Deployed functions:"
    echo "  ✓ notifyJoinedAction - Sends email when someone joins an action"
    echo "  ✓ sendRitualReminders - Scheduled daily ritual reminder emails"
    echo "  ✓ sendWeeklySummaries - Scheduled weekly progress summary emails"
    echo ""
    print_info "To view logs, run:"
    echo "  firebase functions:log"
    echo ""
    print_info "To test the functions:"
    echo "  1. Create a joined action to test notifyJoinedAction"
    echo "  2. Wait for scheduled times or trigger manually in Firebase Console"
else
    print_error "Deployment failed"
    exit 1
fi

