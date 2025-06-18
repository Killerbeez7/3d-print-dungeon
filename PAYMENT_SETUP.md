# 🚀 Stripe Payment Integration Setup Guide

This guide will help you set up the complete Stripe payment system for your 3D Print Dungeon marketplace.

## 📋 Prerequisites

- Firebase project with Firestore and Cloud Functions enabled
- Stripe account (test and live)
- Node.js 18+ installed
- Firebase CLI installed and authenticated

## 🔧 1. Stripe Account Setup

### Create Stripe Account
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create an account or log in
3. Complete account verification for live payments

### Get API Keys
1. Navigate to **Developers > API Keys**
2. Copy your **Publishable key** (starts with `pk_`)
3. Copy your **Secret key** (starts with `sk_`)
4. Keep these secure - never commit secret keys to version control

### Enable Payment Methods
1. Go to **Settings > Payment methods**
2. Enable desired payment methods (cards, wallets, etc.)
3. Configure currency settings

## 🌐 2. Environment Variables Setup

### Frontend Environment Variables
Create a `.env.local` file in your project root:

```bash
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Firebase Configuration (if not already set)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Cloud Functions Environment Variables
Set environment variables for your Firebase Functions:

```bash
# Navigate to functions directory
cd functions

# Set Stripe secret key
firebase functions:config:set stripe.secret_key="sk_test_your_secret_key_here"

# Set frontend URL for redirects
firebase functions:config:set app.frontend_url="http://localhost:5173"

# For production, use your live domain
# firebase functions:config:set app.frontend_url="https://yourdomain.com"
```

## 📦 3. Install Dependencies

### Frontend Dependencies
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### Backend Dependencies
```bash
cd functions
npm install stripe
```

## 🔥 4. Deploy Cloud Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Or deploy specific functions
firebase deploy --only functions:createPaymentIntent,functions:handlePaymentSuccess
```

## 🗄️ 5. Database Setup

### Firestore Indexes
The required indexes are already configured in `firestore.indexes.json`. Deploy them:

```bash
firebase deploy --only firestore:indexes
```

### Security Rules
The Firestore rules are updated to handle payment collections. Deploy them:

```bash
firebase deploy --only firestore:rules
```

## 🎯 6. Testing the Integration

### Test Cards
Use Stripe's test cards for development:

- **Successful payment**: `4242 4242 4242 4242`
- **Declined payment**: `4000 0000 0000 0002`
- **Requires authentication**: `4000 0025 0000 3155`

### Test Flow
1. Upload a model with a price
2. Try purchasing as a different user
3. Verify payment processing
4. Check Firestore for purchase records
5. Test download functionality

## 🏪 7. Stripe Connect Setup (For Seller Payouts)

### Enable Connect
1. Go to **Connect** in your Stripe Dashboard
2. Complete the Connect onboarding
3. Configure your platform settings

### Seller Onboarding Flow
The app includes functions to:
- Create Connect accounts for sellers
- Generate onboarding links
- Handle seller verification

## 🔒 8. Security Considerations

### API Key Security
- Never expose secret keys in frontend code
- Use environment variables for all sensitive data
- Rotate keys regularly

### Webhook Security
- Verify webhook signatures
- Use HTTPS endpoints only
- Implement idempotency

### User Data Protection
- Follow PCI compliance guidelines
- Never store card details
- Implement proper access controls

## 📊 9. Monitoring and Analytics

### Stripe Dashboard
Monitor payments, disputes, and analytics in your Stripe Dashboard.

### Firebase Analytics
Track payment events and user behavior:

```javascript
// Example: Track purchase events
analytics.logEvent('purchase', {
  currency: 'USD',
  value: amount,
  items: [{
    item_id: modelId,
    item_name: modelName,
    category: 'digital_asset',
    quantity: 1,
    price: amount
  }]
});
```

## 🚀 10. Going Live

### Switch to Live Mode
1. Get live API keys from Stripe Dashboard
2. Update environment variables with live keys
3. Complete Stripe account verification
4. Test with small amounts first

### Production Checklist
- [ ] Live API keys configured
- [ ] Webhook endpoints secured
- [ ] SSL certificates installed
- [ ] Error monitoring setup
- [ ] Backup and recovery plan
- [ ] Customer support process

## 🛠️ 11. Available Cloud Functions

### Payment Functions
- `createPaymentIntent` - Initialize payment
- `handlePaymentSuccess` - Process successful payment
- `createSubscription` - Handle subscriptions
- `getUserPurchases` - Get user's purchase history
- `getSellerSales` - Get seller's sales data

### Seller Functions
- `createConnectAccount` - Create seller account
- `createAccountLink` - Generate onboarding link

## 🎨 12. UI Components

### Payment Components
- `CheckoutForm` - Stripe payment form
- `PaymentModal` - Payment modal wrapper
- `PurchaseButton` - Smart purchase/download button
- `PricingForm` - Model pricing configuration

### Usage Example
```jsx
import { PurchaseButton } from '@/components/payment/PurchaseButton';

<PurchaseButton 
  model={model} 
  className="w-full" 
/>
```

## 🐛 13. Troubleshooting

### Common Issues

**Payment Intent Creation Fails**
- Check API keys are correct
- Verify user authentication
- Check Cloud Function logs

**Webhook Not Receiving Events**
- Verify endpoint URL
- Check webhook signature verification
- Ensure HTTPS is used

**Download Not Working**
- Check user purchase status
- Verify file URLs are accessible
- Check browser download permissions

### Debug Tools
- Stripe Dashboard logs
- Firebase Function logs
- Browser developer tools
- Network tab for API calls

## 📞 14. Support

### Resources
- [Stripe Documentation](https://stripe.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Stripe.js Documentation](https://stripe.com/docs/stripe-js/react)

### Getting Help
- Check Firebase Function logs: `firebase functions:log`
- Monitor Stripe Dashboard for payment issues
- Use browser dev tools for frontend debugging

---

## 🎉 Congratulations!

You now have a fully functional payment system integrated into your 3D marketplace. Users can:

- ✅ Upload free or paid models
- ✅ Purchase models securely with Stripe
- ✅ Download purchased content
- ✅ Manage their purchases and sales
- ✅ Receive payouts through Stripe Connect

The system is production-ready and scalable for your growing marketplace! 