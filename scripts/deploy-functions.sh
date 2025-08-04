#!/bin/bash

# Deploy Firebase Functions with proper permissions
echo "🚀 Deploying Firebase Functions..."

# Set the project ID (replace with your actual project ID)
PROJECT_ID="your-project-id"

# Deploy functions
firebase deploy --only functions --project $PROJECT_ID

# Deploy Firestore security rules
firebase deploy --only firestore:rules --project $PROJECT_ID

echo "✅ Deployment complete!"
echo "📝 Note: Make sure your Firebase project has the following APIs enabled:"
echo "   - Cloud Functions API"
echo "   - Cloud Firestore API"
echo "   - Identity and Access Management (IAM) API" 