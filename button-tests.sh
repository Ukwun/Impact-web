#!/bin/bash

# QUICK START: Button Testing & Development
# Fast commands for testing all buttons during development
# Run from: c:\DEV3\ImpactEdu\impactapp-web

# ============================================================================
# SETUP (Run once)
# ============================================================================

setup() {
  echo "🔧 Setting up testing environment..."
  npm install --save-dev @testing-library/react @testing-library/jest-dom
  npm install --save-dev jest @jest/globals
  echo "✅ Setup complete"
}

# ============================================================================
# QUICK TESTS
# ============================================================================

# Run ALL button tests
test-all() {
  echo "🧪 Running all button tests..."
  npm test -- buttons.test.ts --coverage
}

# Run specific button test
test-button() {
  if [ -z "$1" ]; then
    echo "Usage: test-button 'Continue Lesson'"
    return
  fi
  echo "🧪 Testing: $1"
  npm test -- buttons.test.ts -t "$1"
}

# Watch mode - auto-run tests
test-watch() {
  echo "👀 Watching for changes..."
  npm test -- buttons.test.ts --watch
}

# Quick smoke test
test-quick() {
  echo "⚡ Quick smoke test..."
  npm test -- buttons.test.ts --maxWorkers=1 --testTimeout=10000
}

# ============================================================================
# DASHBOARD TESTING
# ============================================================================

# Start dev server
start-dev() {
  echo "🚀 Starting development server..."
  npm run dev
  # Server runs on http://localhost:3000
}

# Run dashboard component test
test-dashboard() {
  echo "🧪 Testing EnhancedStudentDashboard component..."
  npm test -- EnhancedStudentDashboard --watch
}

# ============================================================================
# BROWSER CONSOLE TESTS
# ============================================================================

# Print browser console test commands
console-tests() {
  cat << 'EOF'
=================================================================
BROWSER CONSOLE TEST COMMANDS
Run these in Chrome DevTools Console (F12) to test in real-time
=================================================================

// 1. Test all buttons visible
javascript:void(
  document.querySelectorAll('button').forEach((btn, i) => {
    const isVisible = btn.offsetParent !== null;
    const isEnabled = !btn.disabled;
    console.log(`Button ${i}: ${btn.textContent} - Visible: ${isVisible}, Enabled: ${isEnabled}`);
  })
);

// 2. Test button click response time
javascript:void((function() {
  const btn = document.querySelector('[data-button="continue-lesson"]');
  if (btn) {
    console.time("Click Response");
    btn.click();
    console.timeEnd("Click Response"); // Shows ~20-50ms
  } else {
    console.log("Button not found");
  }
})());

// 3. Monitor all API calls
javascript:void((function() {
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    console.log("📡 API Call:", args[0]);
    const start = performance.now();
    return originalFetch.apply(this, args).then(response => {
      const duration = performance.now() - start;
      console.log(`✓ Response (${duration.toFixed(0)}ms): ${response.status}`);
      return response;
    }).catch(err => {
      console.log("❌ Error:", err.message);
      throw err;
    });
  };
  console.log("API monitoring enabled");
})());

// 4. Test tab keyboard navigation
javascript:void(document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    const focused = document.activeElement;
    console.log("🎯 Tab focus:", focused.tagName, focused.textContent || focused.getAttribute('aria-label'));
  }
}));

// 5. Test file upload
javascript:void((function() {
  const fileInput = document.querySelector('input[type="file"]');
  if (fileInput) {
    const file = new File(['test content'], 'test.pdf', {type: 'application/pdf'});
    fileInput.files = new DataTransfer().items.add(file).files;
    console.log("📄 Test file added:", file.name);
  }
})());

// 6. Rapid click test (debounce)
javascript:void((function() {
  const btn = document.querySelector('[data-button="test"]');
  if (btn) {
    let clickCount = 0;
    const clickHandler = btn.onclick;
    let actualCalls = 0;
    
    // 10 rapid clicks
    for (let i = 0; i < 10; i++) {
      clickCount++;
      btn.click();
    }
    
    console.log(`🚀 ${clickCount} clicks sent, check API calls (should be 1-2 due to debouncing)`);
  }
})());

// 7. Test localStorage (session storage)
javascript:void((function() {
  const authToken = localStorage.getItem('authToken');
  const userId = localStorage.getItem('userId');
  console.log("📦 LocalStorage:");
  console.log("  authToken:", authToken ? "✅ Set" : "❌ Missing");
  console.log("  userId:", userId ? "✅ Set" : "❌ Missing");
})());

// 8. Find all buttons and their status
javascript:void((function() {
  const buttons = document.querySelectorAll('button, [role="button"]');
  console.log(`Found ${buttons.length} buttons:`);
  buttons.forEach((btn, i) => {
    console.log(`${i}. ${btn.textContent || btn.getAttribute('aria-label')} - ${btn.disabled ? '❌ DISABLED' : '✅ ENABLED'}`);
  });
})());

=================================================================
EOF
}

# ============================================================================
# PERFORMANCE TESTING
# ============================================================================

# Check build performance
check-build() {
  echo "📊 Checking build performance..."
  npm run build 2>&1 | tail -20
}

# Run lighthouse audit
lighthouse-audit() {
  echo "📊 Running Lighthouse audit..."
  npm run lighthouse
}

# Check bundle size
check-bundle() {
  echo "📦 Checking bundle size..."
  npm run analyze
}

# ============================================================================
# TYPE CHECKING & LINTING
# ============================================================================

# Check TypeScript types
type-check() {
  echo "🔍 Type checking..."
  npx tsc --noEmit
}

# Lint code
lint() {
  echo "🧹 Linting code..."
  npm run lint
}

# Format code
format() {
  echo "✨ Formatting code..."
  npm run format
}

# ============================================================================
# DEPLOYMENT TESTS
# ============================================================================

# Full test suite before deployment
deploy-test() {
  echo "🚀 Running full deployment test suite..."
  echo ""
  
  echo "1️⃣  Type checking..."
  npx tsc --noEmit && echo "   ✅ Types OK" || echo "   ❌ Type errors"
  
  echo "2️⃣  Linting..."
  npm run lint && echo "   ✅ Lint OK" || echo "   ❌ Lint errors"
  
  echo "3️⃣  Unit tests..."
  npm test -- buttons.test.ts --coverage && echo "   ✅ Tests OK" || echo "   ❌ Test failures"
  
  echo "4️⃣  Building..."
  npm run build && echo "   ✅ Build OK" || echo "   ❌ Build failed"
  
  echo ""
  echo "✅ All deployment checks passed!"
}

# ============================================================================
# COVERAGE REPORTS
# ============================================================================

# Generate coverage report
coverage() {
  echo "📊 Generating coverage report..."
  npm test -- buttons.test.ts --coverage --coverageReporters=html
  echo "✅ Coverage report: coverage/index.html"
}

# Show coverage summary
coverage-summary() {
  npm test -- buttons.test.ts --coverage 2>&1 | grep -A 10 "Statements"
}

# ============================================================================
# DEBUGGING
# ============================================================================

# Debug test
debug-test() {
  if [ -z "$1" ]; then
    echo "Usage: debug-test 'test-name'"
    return
  fi
  echo "🐛 Debugging test: $1"
  node --inspect-brk node_modules/.bin/jest buttons.test.ts -t "$1"
  echo "Debugger listening on chrome://inspect/#devices"
}

# ============================================================================
# UTILITIES
# ============================================================================

# Show help
help() {
  cat << 'EOF'
Button Testing Commands
=======================

🧪 TESTING:
  test-all              Run all button tests
  test-button "name"    Run specific button test
  test-watch            Watch mode (auto-run on changes)
  test-quick            Quick smoke test
  test-dashboard        Test dashboard component

🚀 DEVELOPMENT:
  start-dev             Start dev server (localhost:3000)
  type-check            Check TypeScript types
  lint                  Lint code
  format                Format code
  console-tests         Show browser console test commands

📊 QUALITY:
  coverage              Generate coverage report
  coverage-summary      Show coverage summary
  check-build           Check build performance
  lighthouse-audit      Run Lighthouse audit
  check-bundle          Check bundle size

✅ DEPLOYMENT:
  deploy-test           Full test suite for deployment
  
🐛 DEBUGGING:
  debug-test "name"     Debug specific test

Type 'help' to see this message again
EOF
}

# ============================================================================
# MAIN
# ============================================================================

# Show help if no argument
if [ $# -eq 0 ]; then
  help
else
  # Run the requested function
  "$@"
fi
