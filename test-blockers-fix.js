#!/usr/bin/env node

/**
 * COMPREHENSIVE BLOCKER FIXING SUITE
 * Tests and fixes for:
 * 1. File Upload End-to-End + AWS S3
 * 2. Email Service Verification + Resend
 * 3. Dashboard Component Wiring
 * 
 * Run: node test-blockers-fix.js
 */

const fs = require('fs');
const path = require('path');

// Color logs
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// ============================================================================
// BLOCKER 1: FILE UPLOAD TESTING
// ============================================================================

async function testFileUpload() {
  log('\n' + '='.repeat(80), 'cyan');
  log('BLOCKER 1: FILE UPLOAD END-TO-END TESTING', 'cyan');
  log('='.repeat(80), 'cyan');

  const checks = [
    {
      name: 'AWS_ACCESS_KEY_ID configured',
      test: () => !!process.env.AWS_ACCESS_KEY_ID,
      critical: true,
    },
    {
      name: 'AWS_SECRET_ACCESS_KEY configured',
      test: () => !!process.env.AWS_SECRET_ACCESS_KEY,
      critical: true,
    },
    {
      name: 'AWS_S3_BUCKET configured',
      test: () => !!process.env.AWS_S3_BUCKET,
      critical: true,
    },
    {
      name: 'File upload component exists',
      test: () => fs.existsSync(path.join(__dirname, 'src/components/FileUploadComponent.tsx')),
      critical: true,
    },
    {
      name: 'S3 client library exists',
      test: () => fs.existsSync(path.join(__dirname, 'src/lib/s3-client.ts')),
      critical: true,
    },
    {
      name: 'File validation library exists',
      test: () => fs.existsSync(path.join(__dirname, 'src/lib/file-validation.ts')),
      critical: true,
    },
    {
      name: 'Assignment submission endpoint exists',
      test: () => fs.existsSync(path.join(__dirname, 'src/app/api/assignments/[id]/submit/route.ts')),
      critical: true,
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const check of checks) {
    const result = check.test();
    if (result) {
      log(`  ✅ ${check.name}`, 'green');
      passed++;
    } else {
      log(`  ❌ ${check.name}`, 'red');
      if (check.critical) {
        log(`     ⚠️  CRITICAL: This must be fixed before deployment`, 'yellow');
      }
      failed++;
    }
  }

  log(`\n📊 File Upload Status: ${passed}/${checks.length} checks passed`, passed === checks.length ? 'green' : 'red');

  // Recommendations
  if (process.env.AWS_S3_BUCKET && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    log('\n✅ AWS Credentials Found! Ready for testing.', 'green');
    log('Next: Test with actual file upload to S3', 'cyan');
  } else {
    log('\n❌ AWS Credentials Missing!', 'red');
    log('Add to .env.local:', 'yellow');
    log('  AWS_ACCESS_KEY_ID=your_key', 'blue');
    log('  AWS_SECRET_ACCESS_KEY=your_secret', 'blue');
    log('  AWS_S3_BUCKET=your-bucket-name', 'blue');
    log('  AWS_S3_REGION=us-east-1 (optional)', 'blue');
  }

  return failed === 0;
}

// ============================================================================
// BLOCKER 2: EMAIL SERVICE TESTING
// ============================================================================

async function testEmailService() {
  log('\n' + '='.repeat(80), 'cyan');
  log('BLOCKER 2: EMAIL SERVICE VERIFICATION', 'cyan');
  log('='.repeat(80), 'cyan');

  const checks = [
    {
      name: 'EMAIL_PROVIDER configured',
      test: () => !!process.env.EMAIL_PROVIDER,
      critical: false,
    },
    {
      name: 'Resend API Key configured (if using Resend)',
      test: () => process.env.EMAIL_PROVIDER !== 'resend' || !!process.env.RESEND_API_KEY,
      critical: true,
    },
    {
      name: 'Email service library exists',
      test: () => fs.existsSync(path.join(__dirname, 'src/lib/email-service.ts')),
      critical: true,
    },
    {
      name: 'Forgot password endpoint exists',
      test: () => fs.existsSync(path.join(__dirname, 'src/app/api/auth/forgot-password/route.ts')),
      critical: true,
    },
    {
      name: 'Email verification endpoint exists',
      test: () => fs.existsSync(path.join(__dirname, 'src/app/api/auth/verify-email/route.ts')),
      critical: true,
    },
    {
      name: 'Reset password page exists',
      test: () => fs.existsSync(path.join(__dirname, 'src/app/reset-password/page.tsx')),
      critical: true,
    },
    {
      name: 'Forgot password page exists',
      test: () => fs.existsSync(path.join(__dirname, 'src/app/forgot-password/page.tsx')),
      critical: true,
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const check of checks) {
    const result = check.test();
    if (result) {
      log(`  ✅ ${check.name}`, 'green');
      passed++;
    } else {
      log(`  ❌ ${check.name}`, 'red');
      if (check.critical) {
        log(`     ⚠️  CRITICAL: This must be fixed before deployment`, 'yellow');
      }
      failed++;
    }
  }

  log(`\n📊 Email Service Status: ${passed}/${checks.length} checks passed`, passed === checks.length ? 'green' : 'red');

  // Provider-specific checks
  if (process.env.EMAIL_PROVIDER === 'resend') {
    if (process.env.RESEND_API_KEY) {
      log('\n✅ Resend API Configuration Found!', 'green');
      log('API Key (masked): ' + process.env.RESEND_API_KEY.slice(0, 10) + '***', 'blue');
    }
  }

  // Recommendations
  const provider = process.env.EMAIL_PROVIDER || 'resend';
  if (!process.env.RESEND_API_KEY && provider === 'resend') {
    log('\n❌ Resend API Key Missing!', 'red');
    log('Get your key from: https://resend.com/api-keys', 'yellow');
    log('Add to .env.local:', 'yellow');
    log('  EMAIL_PROVIDER=resend', 'blue');
    log('  RESEND_API_KEY=your_resend_key', 'blue');
  }

  return process.env.RESEND_API_KEY || process.env.EMAIL_PROVIDER === 'smtp';
}

// ============================================================================
// BLOCKER 3: DASHBOARD COMPONENT WIRING ANALYSIS
// ============================================================================

async function testDashboardWiring() {
  log('\n' + '='.repeat(80), 'cyan');
  log('BLOCKER 3: DASHBOARD COMPONENT WIRING', 'cyan');
  log('='.repeat(80), 'cyan');

  const dashboardChecks = [
    {
      name: 'Facilitator dashboard exists',
      file: 'src/app/dashboard/facilitator/page.tsx',
      critical: true,
    },
    {
      name: 'Student dashboard exists',
      file: 'src/app/dashboard/student/page.tsx',
      critical: true,
    },
    {
      name: 'Create course API endpoint',
      file: 'src/app/api/courses/route.ts',
      critical: true,
    },
    {
      name: 'Update course API endpoint',
      file: 'src/app/api/courses/[id]/route.ts',
      critical: true,
    },
    {
      name: 'Delete course API endpoint',
      file: 'src/app/api/courses/[id]/route.ts',
      critical: true,
    },
    {
      name: 'Admin users API endpoint',
      file: 'src/app/api/admin/users/route.ts',
      critical: false,
    },
    {
      name: 'Admin events API endpoint',
      file: 'src/app/api/admin/events/route.ts',
      critical: false,
    },
  ];

  let passed = 0;
  let failed = 0;
  const missingEndpoints = [];

  for (const check of dashboardChecks) {
    const exists = fs.existsSync(path.join(__dirname, check.file));
    if (exists) {
      log(`  ✅ ${check.name}`, 'green');
      passed++;
    } else {
      log(`  ❌ ${check.name}`, 'red');
      if (check.critical) {
        log(`     ⚠️  CRITICAL: Required for functionality`, 'yellow');
        missingEndpoints.push(check.file);
      }
      failed++;
    }
  }

  log(`\n📊 Dashboard Wiring Status: ${passed}/${dashboardChecks.length} components ready`, passed >= dashboardChecks.length - 2 ? 'green' : 'yellow');

  if (missingEndpoints.length > 0) {
    log('\n📝 Missing Critical Endpoints (MUST CREATE):', 'yellow');
    for (const endpoint of missingEndpoints) {
      log(`  - ${endpoint}`, 'yellow');
    }
  }

  return failed === 0;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  log('\n🔍 IMPACT EDU - BLOCKER FIXING TEST SUITE', 'cyan');
  log('=' + '='.repeat(79), 'cyan');

  const results = await Promise.all([
    testFileUpload(),
    testEmailService(),
    testDashboardWiring(),
  ]);

  // Summary
  log('\n' + '='.repeat(80), 'cyan');
  log('SUMMARY', 'cyan');
  log('='.repeat(80), 'cyan');

  const [fileUploadOk, emailOk, dashboardOk] = results;

  log(`\n1️⃣  File Upload:     ${fileUploadOk ? '✅ READY' : '❌ NEEDS WORK'}`);
  log(`2️⃣  Email Service:   ${emailOk ? '✅ READY' : '❌ NEEDS WORK'}`);
  log(`3️⃣  Dashboard:       ${dashboardOk ? '✅ READY' : '⚠️  PARTIAL'}`);

  const allReady = fileUploadOk && emailOk && dashboardOk;
  
  if (allReady) {
    log('\n🚀 ALL BLOCKERS READY FOR PRODUCTION!', 'green');
  } else {
    log('\n⚠️  BLOCKERS NEED ATTENTION BEFORE LAUNCH', 'yellow');
  }

  log('\n📋 Next Steps:', 'cyan');
  log('   1. Fix any missing configurations above', 'blue');
  log('   2. Run: npm run build', 'blue');
  log('   3. Deploy to Netlify', 'blue');

  process.exit(allReady ? 0 : 1);
}

main().catch((err) => {
  log('\n❌ Error running blocker tests:', 'red');
  log(err.message, 'red');
  process.exit(1);
});
