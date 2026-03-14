# Payment Processing Implementation Guide

**Date:** March 12, 2026  
**Status:** ✅ Complete - Ready for Integration

This document provides a comprehensive overview of the Flutterwave and bank transfer payment processing implementation for ImpactEdu.

---

## 1. Overview

The payment system enables users to purchase courses using two methods:
- **Flutterwave**: Card, mobile money, bank transfers (programmatically)
- **Bank Transfer**: Manual bank transfers with reference tracking

---

## 2. Architecture

### 2.1 Database Models

```prisma
model Payment {
  id                   String      @id @default(cuid())
  userId              String
  enrollmentId        String?     @unique
  amount              Decimal(@db.Decimal(10, 2))
  currency            String
  purpose             String
  paymentMethod       PaymentMethod   // FLUTTERWAVE | BANK_TRANSFER | CARD
  status              PaymentStatus   // PENDING | INITIATED | PROCESSING | COMPLETED | FAILED | CANCELLED | REFUNDED
  
  // Flutterwave tracking
  flutterWaveRef      String?     @unique
  transactionId       String?     @unique
  authorizationUrl    String?
  
  // Bank transfer details
  bankName            String?
  accountNumber       String?
  accountName         String?
  
  // Timestamps
  initiatedAt         DateTime
  completedAt         DateTime?
  paidAt              DateTime?
  failedAt            DateTime?
  failureReason       String?
  
  // Relations
  user                User
  enrollment          Enrollment?
  metadata            Json?
}

enum PaymentMethod {
  FLUTTERWAVE
  BANK_TRANSFER
  CARD
}

enum PaymentStatus {
  PENDING
  INITIATED
  PROCESSING
  COMPLETED
  FAILED
  CANCELLED
  REFUNDED
}
```

---

## 3. API Endpoints

### 3.1 Payment Creation
**Endpoint:** `POST /api/payments/create`  
**Auth:** Required (JWT)

```json
{
  "amount": 5000,
  "currency": "NGN",
  "purpose": "course_enrollment",
  "paymentMethod": "FLUTTERWAVE",
  "enrollmentId": "enr_xxx",
  "metadata": {
    "courseId": "course_xxx"
  }
}
```

**Response:**
```json
{
  "success": true,
  "paymentId": "pay_xxx",
  "data": { /* Payment object */ }
}
```

### 3.2 Flutterwave Checkout Initialization
**Endpoint:** `POST /api/payments/checkout`  
**Auth:** Required (JWT)

```json
{
  "paymentId": "pay_xxx",
  "courseId": "course_xxx",
  "amount": 5000,
  "currency": "NGN"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "authorizationUrl": "https://checkout.flutterwave.com/v3/hosted/...",
    "reference": "FLW-REF-xxx"
  }
}
```

### 3.3 Payment Verification
**Endpoint:** `GET /api/payments/[id]/verify`  
**Auth:** Required (JWT)

Verifies payment status with Flutterwave and updates database.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "successful",
    "amount": 5000,
    "currency": "NGN",
    "customer": {
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
}
```

### 3.4 Payment Status Update
**Endpoint:** `PUT /api/payments/[id]/status`  
**Auth:** Required (JWT)

```json
{
  "status": "COMPLETED",
  "transactionId": "flw_12345",
  "flutterWaveRef": "FLW-REF-xxx"
}
```

### 3.5 Webhook Handler
**Endpoint:** `POST /api/payments/webhook`  
**Auth:** Flutterwave signature verification

Handles Flutterwave webhook events:
- `charge.completed` - Payment successful
- `charge.failed` - Payment failed

---

## 4. Frontend Pages

### 4.1 Payment Methods Selection
**Route:** `/payments`  
**File:** `src/app/payments/page.tsx`

Displays two payment method options:
- Flutterwave (Recommended)
- Bank Transfer (Manual)

### 4.2 Flutterwave Payment
**Route:** `/payments/flutterwave`  
**File:** `src/app/payments/flutterwave/page.tsx`

- Amount entry
- Payment initialization
- Redirect to Flutterwave checkout

### 4.3 Bank Transfer
**Route:** `/payments/bank-transfer`  
**File:** `src/app/payments/bank-transfer/page.tsx`

- Amount selection
- Bank account details (with copy buttons)
- Transfer instructions
- Payment confirmation button

### 4.4 Payment Callback
**Route:** `/payments/callback`  
**File:** `src/app/payments/callback/page.tsx`

- Verifies payment after Flutterwave redirect
- Shows success or failure status
- Auto-redirects to dashboard

### 4.5 Bank Confirmation
**Route:** `/payments/bank-confirmation`  
**File:** `src/app/payments/bank-confirmation/page.tsx`

- Confirmation message
- Expected timeline (same/next day)
- Support contact information

---

## 5. Service Layer

### 5.1 Flutterwave Service
**File:** `src/lib/flutterwave-service.ts`

**Functions:**

#### `initializePayment()`
Initialize Flutterwave payment and get authorization URL.

```typescript
const result = await initializePayment({
  amount: 5000,
  currency: "NGN",
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe",
  phone: "+2348012345678",
  orderId: "PAY-123",
  redirectUrl: "https://impactedu.ng/payments/callback",
});
```

#### `verifyPayment(transactionId)`
Verify payment status with Flutterwave API.

#### `getBankTransferDetails(amount, currency)`
Return bank transfer details for manual payment method.

#### `createPaymentRecord(userId, enrollmentId, options)`
Create payment record in database.

#### `updatePaymentStatus(paymentId, status, options)`
Update payment status and related fields.

---

## 6. Integration Checklist

### 6.1 Environment Variables
Add to `.env`:
```
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=pk_test_xxx
FLUTTERWAVE_SECRET_KEY=sk_test_xxx
FLUTTERWAVE_WEBHOOK_SECRET=whsec_test_xxx
```

### 6.2 Flutterwave Setup
1. **Create Flutterwave account:** https://dashboard.flutterwave.com
2. **Get API keys:**
   - Public Key (starts with `pk_`)
   - Secret Key (starts with `sk_`)
3. **Configure webhook:**
   - URL: `https://yourdomain.com/api/payments/webhook`
   - Events: `charge.completed`, `charge.failed`
4. **Update bank account details** in `src/lib/flutterwave-service.ts`:
   - Bank name
   - Account number
   - Account name

### 6.3 Bank Account Configuration
Update `getBankTransferDetails()` function with your actual bank account:
```typescript
return {
  bankName: "Guaranty Trust Bank (GTB)",
  accountNumber: "YOUR_ACTUAL_ACCOUNT",
  accountName: "Your Company Name",
  // ...
};
```

### 6.4 Database Migration
```bash
npm run db:push
```

### 6.5 SSL/HTTPS
- Flutterwave requires HTTPS callback URLs
- Configure SSL certificate in production

---

## 7. Payment Flow Diagrams

### 7.1 Flutterwave Flow
```
User → /payments → Select "Flutterwave"
  ↓
/payments/flutterwave → Enter amount
  ↓
Create payment record (PENDING)
  ↓
Initialize Flutterwave → Get authorization URL
  ↓
Update to INITIATED
  ↓
Redirect to Flutterwave checkout
  ↓
User completes payment
  ↓
Flutterwave webhook → /api/payments/webhook
  ↓
Update status to COMPLETED
  ↓
Flutterwave redirect → /payments/callback
  ↓
Verify payment
  ↓
Success page → Redirect to /dashboard
```

### 7.2 Bank Transfer Flow
```
User → /payments → Select "Bank Transfer"
  ↓
/payments/bank-transfer → Enter amount
  ↓
Display bank details with copy buttons
  ↓
User manually transfers amount
  ↓
Gets /payments/bank-confirmation page
  ↓
Support confirms transfer (manual process)
  ↓
Admin updates payment status to COMPLETED
  ↓
User receives email notification
```

---

## 8. Security Considerations

### 8.1 Signature Verification
All webhook requests are verified using HMAC-SHA256:
```typescript
const hash = crypto
  .createHmac("sha256", webhookSecret)
  .update(JSON.stringify(body))
  .digest("hex");

if (hash !== signature) {
  // Invalid signature - reject
}
```

### 8.2 Amount Validation
- Verify amount matches payment record
- Prevent amount tampering on client-side

### 8.3 User Verification
- Only allow users to verify their own payments
- Check JWT token owner matches userId

### 8.4 Secure Endpoints
- All payment endpoints require valid JWT
- Rate limiting on sensitive endpoints
- HTTPS required in production

---

## 9. Testing Guide

### 9.1 Test Flutterwave Integration
1. Set up test account on Flutterwave
2. Use test API keys (`pk_test_`, `sk_test_`)
3. Use test card: `4242 4242 4242 4242`
4. Verify webhook events are received

### 9.2 Test Bank Transfer Flow
1. Create payment record with `BANK_TRANSFER` method
2. Verify bank details are displayed correctly
3. Confirm payment and verify notification email

### 9.3 Load Testing
- Test webhook handler at scale (multiple concurrent payments)
- Verify database constraints (unique transaction IDs)
- Check for race conditions

---

## 10. Monitoring & Logs

### 10.1 Log Points
All payment operations log to console:
```typescript
console.log(`✓ Payment ${paymentId} initiated`);
console.log(`✓ Payment verified: ${status}`);
console.log(`⚠️ Payment failed: ${reason}`);
```

### 10.2 Sentry Integration
Critical errors are automatically sent to Sentry:
```typescript
Sentry.captureException(error);
```

### 10.3 Monitoring Metrics
Track:
- Payment success rate
- Average processing time
- Webhook delivery success
- Failed transactions by reason

---

## 11. Troubleshooting

### Issue: Payment webhook not received
**Solution:**
1. Verify webhook URL is HTTPS and publicly accessible
2. Check firewall/security rules
3. Verify signature in webhook logs
4. Increase webhook retry in Flutterwave dashboard

### Issue: "Invalid signature" in webhook
**Solution:**
1. Verify webhook secret is correct
2. Ensure request body hasn't been modified
3. Check Flutterwave documentation for event format

### Issue: Payment stuck in INITIATED state
**Solution:**
1. Manually verify on Flutterwave dashboard
2. Update status via API if verified
3. Implement cron job to check for stale payments

### Issue: Database constraint error
**Solution:**
1. Check for duplicate payment IDs
2. Verify unique constraints are satisfied
3. Review transaction ID collision handling

---

## 12. Future Enhancements

1. **Recurring Payments**: Subscriptions and memberships
2. **Refunds**: Automated refund processing
3. **Payment Plans**: Installment plans for high-value courses
4. **Multi-Currency**: Support for USD, GBP, etc.
5. **Mobile Optimization**: Better mobile checkout experience
6. **Analytics Dashboard**: Payment analytics and reports
7. **Fraud Detection**: ML-based fraud prevention
8. **PCI Compliance**: Tokenized payment handling

---

## 13. Deployment Checklist

- [ ] Environment variables configured in production
- [ ] Flutterwave webhook URL updated
- [ ] SSL certificate configured
- [ ] Database migrations applied
- [ ] Bank account details updated with real account
- [ ] Payment pages tested end-to-end
- [ ] Webhook handling verified
- [ ] Error notifications configured
- [ ] Monitoring/alerts set up
- [ ] Documentation shared with team

---

## 14. Support

For issues or questions:
- Email: support@impactedu.ng
- Documentation: https://docs.impactedu.ng/payments
- Flutterwave Support: https://support.flutterwave.com

---

*Last updated: March 12, 2026*  
*Version: 1.0*
