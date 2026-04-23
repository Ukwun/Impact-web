# QUICK START: Button Testing & Development (Windows PowerShell)
# Fast commands for testing all buttons during development
# Run from: c:\DEV3\ImpactEdu\impactapp-web

# ============================================================================
# SETUP (Run once)
# ============================================================================

function Setup-Testing {
    Write-Host "🔧 Setting up testing environment..."
    npm install --save-dev "@testing-library/react" "@testing-library/jest-dom"
    npm install --save-dev jest "@jest/globals"
    Write-Host "✅ Setup complete"
}

# ============================================================================
# QUICK TESTS
# ============================================================================

# Run ALL button tests
function Test-AllButtons {
    Write-Host "🧪 Running all button tests..."
    npm test -- buttons.test.ts --coverage
}

# Run specific button test
function Test-Button {
    param([string]$ButtonName)
    
    if ([string]::IsNullOrEmpty($ButtonName)) {
        Write-Host "Usage: Test-Button 'Continue Lesson'"
        return
    }
    
    Write-Host "🧪 Testing: $ButtonName"
    npm test -- buttons.test.ts -t "$ButtonName"
}

# Watch mode - auto-run tests
function Test-Watch {
    Write-Host "👀 Watching for changes..."
    npm test -- buttons.test.ts --watch
}

# Quick smoke test
function Test-Quick {
    Write-Host "⚡ Quick smoke test..."
    npm test -- buttons.test.ts --maxWorkers=1 --testTimeout=10000
}

# ============================================================================
# DASHBOARD TESTING
# ============================================================================

# Start dev server
function Start-Dev {
    Write-Host "🚀 Starting development server..."
    npm run dev
    Write-Host "Server runs on http://localhost:3000"
}

# Run dashboard component test
function Test-Dashboard {
    Write-Host "🧪 Testing EnhancedStudentDashboard component..."
    npm test -- EnhancedStudentDashboard --watch
}

# ============================================================================
# BROWSER CONSOLE TESTS
# ============================================================================

# Print browser console test commands
function Show-ConsoleTests {
    @"
=================================================================
BROWSER CONSOLE TEST COMMANDS
Run these in Chrome DevTools Console (F12) to test in real-time
=================================================================

1. TEST ALL BUTTONS VISIBLE:
   javascript:void(
     document.querySelectorAll('button').forEach((btn, i) => {
       const isVisible = btn.offsetParent !== null;
       const isEnabled = !btn.disabled;
       console.log(`Button $[i]: $[btn.textContent] - Visible: $[isVisible], Enabled: $[isEnabled]`);
     })
   );

2. TEST BUTTON CLICK RESPONSE TIME:
   javascript:void((function() {
     const btn = document.querySelector('[data-button="continue-lesson"]');
     if (btn) {
       console.time("Click Response");
       btn.click();
       console.timeEnd("Click Response"); // Shows ~20-50ms
     }
   })());

3. MONITOR ALL API CALLS:
   javascript:void((function() {
     const originalFetch = window.fetch;
     window.fetch = function(...args) {
       console.log("📡 API Call:", args[0]);
       const start = performance.now();
       return originalFetch.apply(this, args).then(response => {
         const duration = performance.now() - start;
         console.log(`✓ Response ($[duration.toFixed(0)]ms): $[response.status]`);
         return response;
       });
     };
     console.log("API monitoring enabled");
   })());

4. TEST KEYBOARD NAVIGATION (TAB):
   javascript:void(document.addEventListener('keydown', (e) => {
     if (e.key === 'Tab') {
       const focused = document.activeElement;
       console.log("🎯 Tab focus:", focused.tagName, focused.textContent);
     }
   }));

5. RAPID CLICK TEST (DEBOUNCE):
   javascript:void((function() {
     const btn = document.querySelector('[data-button="test"]');
     for (let i = 0; i < 10; i++) btn.click();
     console.log("🚀 10 clicks sent (should result in 1-2 API calls)");
   })());

6. FIND ALL BUTTONS:
   javascript:void((function() {
     const buttons = document.querySelectorAll('button');
     console.log(`Found $[buttons.length] buttons:`);
     buttons.forEach((btn, i) => {
       console.log(`$[i]. $[btn.textContent] - $[btn.disabled ? '❌ DISABLED' : '✅ ENABLED']`);
     });
   })());

=================================================================
"@ | Write-Host -ForegroundColor Cyan
}

# ============================================================================
# PERFORMANCE TESTING
# ============================================================================

# Check build performance
function Check-Build {
    Write-Host "📊 Checking build performance..."
    npm run build | Select-Object -Last 20
}

# Run lighthouse audit
function Invoke-LighthouseAudit {
    Write-Host "📊 Running Lighthouse audit..."
    npm run lighthouse
}

# Check bundle size
function Check-Bundle {
    Write-Host "📦 Checking bundle size..."
    if (Test-Path "package.json") {
        npm run analyze
    } else {
        Write-Host "bundle-analyzer not installed. Run: npm install --save-dev webpack-bundle-analyzer"
    }
}

# ============================================================================
# TYPE CHECKING & LINTING
# ============================================================================

# Check TypeScript types
function Check-Types {
    Write-Host "🔍 Type checking..."
    npx tsc --noEmit
}

# Lint code
function Invoke-Lint {
    Write-Host "🧹 Linting code..."
    npm run lint
}

# Format code
function Format-Code {
    Write-Host "✨ Formatting code..."
    npm run format
}

# ============================================================================
# DEPLOYMENT TESTS
# ============================================================================

# Full test suite before deployment
function Test-Deployment {
    Write-Host "🚀 Running full deployment test suite..."
    Write-Host ""
    
    Write-Host "1️⃣  Type checking..."
    try {
        npx tsc --noEmit
        Write-Host "   ✅ Types OK" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Type errors" -ForegroundColor Red
    }
    
    Write-Host "2️⃣  Linting..."
    try {
        npm run lint
        Write-Host "   ✅ Lint OK" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Lint errors" -ForegroundColor Red
    }
    
    Write-Host "3️⃣  Unit tests..."
    try {
        npm test -- buttons.test.ts --coverage --throwOnEmptyTestSuite=false
        Write-Host "   ✅ Tests OK" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Test failures" -ForegroundColor Red
    }
    
    Write-Host "4️⃣  Building..."
    try {
        npm run build
        Write-Host "   ✅ Build OK" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Build failed" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "✅ Deployment checks complete!" -ForegroundColor Green
}

# ============================================================================
# COVERAGE REPORTS
# ============================================================================

# Generate coverage report
function Get-CoverageReport {
    Write-Host "📊 Generating coverage report..."
    npm test -- buttons.test.ts --coverage --coverageReporters=html
    Write-Host "✅ Coverage report: coverage/index.html" -ForegroundColor Green
}

# Show coverage summary
function Show-CoverageSummary {
    npm test -- buttons.test.ts --coverage 2>&1 | ForEach-Object {
        if ($_ -match "Statements|Branches|Functions|Lines") {
            Write-Host $_
        }
    }
}

# ============================================================================
# DEBUGGING
# ============================================================================

# Debug test
function Debug-Test {
    param([string]$TestName)
    
    if ([string]::IsNullOrEmpty($TestName)) {
        Write-Host "Usage: Debug-Test 'test-name'"
        return
    }
    
    Write-Host "🐛 Debugging test: $TestName"
    node --inspect-brk node_modules/.bin/jest buttons.test.ts -t "$TestName"
    Write-Host "Debugger listening on chrome://inspect/#devices"
}

# ============================================================================
# QUICK REFERENCE
# ============================================================================

function Show-Help {
    Write-Host @"
╔════════════════════════════════════════════════════════════════════╗
║        Button Testing Commands - Quick Reference                  ║
╚════════════════════════════════════════════════════════════════════╝

🧪 TESTING:
   Test-AllButtons              Run all button tests
   Test-Button "name"           Run specific button test
   Test-Watch                   Watch mode (auto-run on changes)
   Test-Quick                   Quick smoke test
   Test-Dashboard               Test dashboard component

🚀 DEVELOPMENT:
   Start-Dev                    Start dev server (localhost:3000)
   Check-Types                  Check TypeScript types
   Invoke-Lint                  Lint code
   Format-Code                  Format code
   Show-ConsoleTests            Show browser console test commands

📊 QUALITY:
   Get-CoverageReport           Generate coverage report
   Show-CoverageSummary         Show coverage summary
   Check-Build                  Check build performance
   Invoke-LighthouseAudit       Run Lighthouse audit
   Check-Bundle                 Check bundle size

✅ DEPLOYMENT:
   Test-Deployment              Full test suite for deployment

🐛 DEBUGGING:
   Debug-Test "name"            Debug specific test
   
UTILITIES:
   Setup-Testing                Run setup (one-time)
   Show-Help                    Show this help message

══════════════════════════════════════════════════════════════════════

EXAMPLES:
   Test-Button "Continue Lesson"
   Test-Watch
   Start-Dev
   Test-Deployment

For more info, see: BUTTON_FUNCTIONALITY_GUIDE.md
"@ -ForegroundColor Cyan
}

# ============================================================================
# DEFAULT: Show help if no function specified
# ============================================================================

# Show help by default
if ($PSCmdlet.MyInvocation.ExpectingInput -eq $false) {
    Show-Help
}
