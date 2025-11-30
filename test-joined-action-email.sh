#!/bin/bash

# Test Script for Joined Action Email
# This creates test data in Firestore to trigger notifyJoinedAction

echo "🧪 Testing Joined Action Email Function"
echo "========================================"
echo ""

# Check if Firebase CLI is available
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first."
    exit 1
fi

echo "📝 This script will help you test the notifyJoinedAction function."
echo ""
echo "Steps:"
echo "1. You'll need two user IDs (one for creator, one for joiner)"
echo "2. We'll create a test impact moment"
echo "3. We'll create a joined moment (triggers the email)"
echo ""
read -p "Press Enter to continue..."

echo ""
echo "Enter the User ID of the person who will RECEIVE the email (original creator):"
read CREATOR_USER_ID

echo "Enter the User ID of the person JOINING (can be same user for testing):"
read JOINER_USER_ID

echo ""
echo "Creating test impact moment..."

# Create test moment using Firebase CLI
firebase firestore:set impact_moments/test-moment-$(date +%s) \
  "createdBy=$CREATOR_USER_ID" \
  "text=Test action: I'm planting a tree today! 🌱" \
  "tags=[nature,community]" \
  "effortLevel=medium" \
  "createdAt=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  "joinedFromMomentId=null" 2>&1 | head -10

if [ $? -eq 0 ]; then
    echo "✅ Test moment created"
    echo ""
    echo "Now creating joined moment (this will trigger the email)..."
    
    firebase firestore:set impact_moments/test-joined-$(date +%s) \
      "createdBy=$JOINER_USER_ID" \
      "text=I joined this action! 🌳" \
      "tags=[nature]" \
      "effortLevel=medium" \
      "createdAt=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
      "joinedFromMomentId=test-moment-$(date +%s)" 2>&1 | head -10
    
    if [ $? -eq 0 ]; then
        echo "✅ Joined moment created"
        echo ""
        echo "📬 Check Firebase Functions logs:"
        echo "   firebase functions:log --only notifyJoinedAction"
        echo ""
        echo "📧 Check email inbox for user: $CREATOR_USER_ID"
        echo ""
        echo "🧹 To clean up test data, delete documents starting with 'test-' in impact_moments collection"
    else
        echo "❌ Failed to create joined moment"
    fi
else
    echo "❌ Failed to create test moment"
fi

