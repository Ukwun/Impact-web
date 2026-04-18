# 🔧 BLOCKER 1 FIX GUIDE - FILE UPLOAD END-TO-END TESTING

**Status: IMPLEMENTATION COMPLETE, NEEDS ENVIRONMENT SETUP & TESTING**

## What's Already Done ✅

- ✅ S3 client library (`src/lib/s3-client.ts`) - AWS SDK integrated, upload/download ready
- ✅ File upload component (`src/components/FileUploadComponent.tsx`) - React component with progress tracking
- ✅ File validation (`src/lib/file-validation.ts`) - Type checking, size limits, magic bytes
- ✅ Backend endpoint (`src/app/api/assignments/[id]/submit/route.ts`) - API ready
- ✅ Database schema - Assignment & file submission tables prepared
- ✅ Authorization - Only enrolled users can submit, authentication required

## What You Need To Do

### Step 1: AWS S3 Setup (15 minutes)

**1A. Create AWS S3 Bucket:**
```bash
# Go to: https://console.aws.amazon.com/s3/
# 1. Click "Create bucket"
# 2. Name: impact-app-uploads-[your-env]
#    (e.g., impact-app-uploads-prod)
# 3. Region: us-east-1 (or your region)
# 4. Block public access: KEEP CHECKED (we use presigned URLs)
# 5. Click "Create"
```

**1B. Create IAM User for App:**
```bash
# Go to: https://console.aws.amazon.com/iam/
# 1. Click "Users" → "Create user"
# 2. Name: impact-app-uploader
# 3. Check "Provide user access to console" (optional)
# 4. Click "Next"
# 5. Skip permission groups, click "Next"
# 6. Click "Create user"
```

**1C. Create Access Keys:**
```bash
# For the new IAM user:
# 1. Click "Create access key"
# 2. Select "Application running on AWS compute service"
# 3. Click "Next"
# 4. Click "Create access key"
# ⚠️  SAVE THESE SECURELY:
#    - Access Key ID
#    - Secret Access Key
```

**1D. Attach S3 Permissions:**
```bash
# Go to: IAM → Users → impact-app-uploader
# Click "Permissions" → "Add inline policy"
# Use JSON policy editor, paste:

{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::impact-app-uploads-*",
        "arn:aws:s3:::impact-app-uploads-*/*"
      ]
    }
  ]
}

# Click "Create policy"
```

### Step 2: Environment Configuration (5 minutes)

**Add to `.env.local`:**
```bash
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET=impact-app-uploads-prod

# For Netlify Deployment (.env in netlify.toml or UI)
NEXT_PUBLIC_S3_REGION=us-east-1
```

**Verify in code:**
```typescript
// These will be read automatically by src/lib/s3-client.ts
console.log('AWS S3 configured:', !!process.env.AWS_S3_BUCKET);
```

### Step 3: Test File Upload (10 minutes)

**3A. Local Test:**
```bash
# 1. Start dev server
npm run dev

# 2. Go to: http://localhost:3000/dashboard/student

# 3. Find an assignment and click "Submit"

# 4. Upload a test file:
#    - Name: test-submission.pdf
#    - Size: < 10MB
#    - Type: PDF, DOC, DOCX, JPG, PNG

# 5. Expected result:
#    ✅ File uploaded successfully
#    ✅ Progress bar shows 100%
#    ✅ Success message displayed
#    ✅ File stored in S3 bucket
```

**3B. Verify in AWS Console:**
```bash
# 1. Go to: AWS S3 Console
# 2. Open: impact-app-uploads-prod bucket
# 3. Look for new files in:
#    /assignments/[userId]/[assignmentId]/[filename]
# 4. File should be encrypted and secured
```

**3C. Test Download/Access:**
```bash
# Run test script:
node test-file-upload.js

# Expected output:
# ✅ Upload test successful
# ✅ Presigned URL generated
# ✅ Download access verified
# ✅ File integrity confirmed
```

### Step 4: Run Automated Test Suite

```bash
# Test all file upload functionality
npm run test:api -- assignments

# Or run specific test:
npm test -- FileUploadComponent.test.tsx
```

## Troubleshooting

### "Access Denied" Error
**Problem:** Can't connect to S3
**Solution:**
```bash
# Check credentials are correct:
echo $AWS_ACCESS_KEY_ID
echo $AWS_SECRET_ACCESS_KEY
echo $AWS_S3_BUCKET

# Verify IAM policy is attached to user
# AWS Console → IAM → Users → impact-app-uploader → Permissions
```

### "File size exceeds limit"
**Problem:** Uploaded file is too large
**Solution:**
```typescript
// In .env, these are the limits:
// Default: 10MB for documents
// Image: 5MB
// Video: 500MB
// Update in src/lib/file-validation.ts to change limits
```

### "Invalid file type"
**Problem:** File format not allowed
**Solution:**
```typescript
// Allowed types in FileUploadComponent.tsx:
allowedTypes = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'txt', 'xls', 'xlsx']

// Add more types:
<FileUploadComponent 
  allowedTypes={['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'txt', 'xls', 'xlsx']}
/>
```

### "Network error during upload"
**Problem:** Upload interrupted
**Solution:**
```bash
# Check:
1. File is not corrupted
2. File size < 10MB
3. Internet connection is stable
4. S3 bucket is accessible
5. AWS credentials are valid
```

## Verification Checklist

Before moving to production:

- [ ] AWS S3 bucket created and accessible
- [ ] IAM user created with S3 permissions
- [ ] Access keys generated and stored securely
- [ ] Environment variables configured (.env.local)
- [ ] Local file upload test successful
- [ ] File appears in S3 console
- [ ] Download via presigned URL works
- [ ] Automated test suite passes
- [ ] Error handling tested (invalid file, too large, etc.)
- [ ] Multiple file types tested (PDF, DOC, JPG, PNG)

## Security Notes

✅ **What's Secure:**
- Presigned URLs (1-hour expiry by default)
- Server-side file validation (not just client-side)
- File type verification using magic bytes
- User-scoped file paths (can't access others' files)
- AWS encryption at rest (enabled by default)
- Rate limiting on upload endpoint

⚠️ **What Still Needs:**
- Virus scanning (optional but recommended)
- Advanced malware detection
- File preview (show preview before download)

## Next Steps

1. ✅ Complete AWS S3 setup above
2. ✅ Set environment variables in `.env.local`
3. ✅ Test locally with `npm run dev`
4. ✅ Run automated tests
5. ✅ Deploy to Netlify (env vars needed there too!)
6. ✅ Test on production

---

**Estimated time to complete:** 30 minutes  
**Risk level:** Low (AWS handles security)  
**Critical for launch:** YES
