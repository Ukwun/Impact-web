#!/usr/bin/env pwsh
# Test All 8 Role Dashboards in ImpactApp

$BaseUrl = "http://localhost:3002"
$TestResults = @()

function Test-Endpoint {
    param(
        [string]$Method = "GET",
        [string]$Path,
        [object]$Body = $null,
        [string]$Token = $null,
        [string]$RoleName = "Unknown"
    )
    
    $Url = "$BaseUrl$Path"
    $Headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $Headers["Authorization"] = "Bearer $Token"
    }
    
    try {
        $Params = @{
            Uri     = $Url
            Method  = $Method
            Headers = $Headers
            TimeoutSec = 10
        }
        
        if ($Body -and $Method -ne "GET") {
            $Params["Body"] = ($Body | ConvertTo-Json)
        }
        
        $Response = Invoke-WebRequest @Params -ErrorAction Stop
        return @{
            Success = $true
            Status  = $Response.StatusCode
            Data    = $Response.Content
            Role    = $RoleName
            Path    = $Path
        }
    }
    catch {
        return @{
            Success = $false
            Status  = $_.Exception.Response.StatusCode.Value
            Error   = $_.Exception.Message
            Role    = $RoleName
            Path    = $Path
        }
    }
}

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           TESTING ALL 8 ROLE DASHBOARDS - ImpactApp          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Test 1: Student Role
Write-Host "[1/8] Testing STUDENT Role..." -ForegroundColor Yellow
$r1 = Test-Endpoint -Path "/api/progress" -RoleName "STUDENT"
if ($r1.Success) {
    Write-Host "  ✅ /api/progress - Status $($r1.Status)" -ForegroundColor Green
} else {
    Write-Host "  ❌ /api/progress - Error: $($r1.Status)" -ForegroundColor Red
}
$TestResults += $r1

# Test 2: Parent Role
Write-Host "`n[2/8] Testing PARENT Role..." -ForegroundColor Yellow
$r2 = Test-Endpoint -Path "/api/parent-child" -RoleName "PARENT"
if ($r2.Success) {
    Write-Host "  ✅ /api/parent-child - Status $($r2.Status)" -ForegroundColor Green
} else {
    Write-Host "  ❌ /api/parent-child - Error: $($r2.Status)" -ForegroundColor Red
}
$TestResults += $r2

# Test 3: Facilitator Role
Write-Host "`n[3/8] Testing FACILITATOR Role..." -ForegroundColor Yellow
$r3 = Test-Endpoint -Path "/api/facilitator/classes" -RoleName "FACILITATOR"
if ($r3.Success) {
    Write-Host "  ✅ /api/facilitator/classes - Status $($r3.Status)" -ForegroundColor Green
} else {
    Write-Host "  ❌ /api/facilitator/classes - Error: $($r3.Status)" -ForegroundColor Red
}
$TestResults += $r3

# Test 4: School Admin Role
Write-Host "`n[4/8] Testing SCHOOL_ADMIN Role..." -ForegroundColor Yellow
$r4 = Test-Endpoint -Path "/api/admin/school" -RoleName "SCHOOL_ADMIN"
if ($r4.Success) {
    Write-Host "  ✅ /api/admin/school - Status $($r4.Status)" -ForegroundColor Green
} else {
    Write-Host "  ❌ /api/admin/school - Error: $($r4.Status)" -ForegroundColor Red
}
$TestResults += $r4

# Test 5: Admin Role
Write-Host "`n[5/8] Testing ADMIN Role..." -ForegroundColor Yellow
$r5 = Test-Endpoint -Path "/api/admin/dashboard" -RoleName "ADMIN"
if ($r5.Success) {
    Write-Host "  ✅ /api/admin/dashboard - Status $($r5.Status)" -ForegroundColor Green
} else {
    Write-Host "  ❌ /api/admin/dashboard - Error: $($r5.Status)" -ForegroundColor Red
}
$TestResults += $r5

# Test 6: Mentor Role
Write-Host "`n[6/8] Testing MENTOR Role..." -ForegroundColor Yellow
$r6 = Test-Endpoint -Path "/api/mentor/sessions" -RoleName "MENTOR"
if ($r6.Success) {
    Write-Host "  ✅ /api/mentor/sessions - Status $($r6.Status)" -ForegroundColor Green
} else {
    Write-Host "  ❌ /api/mentor/sessions - Error: $($r6.Status)" -ForegroundColor Red
}
$TestResults += $r6

# Test 7: Circle Member Role
Write-Host "`n[7/8] Testing CIRCLE_MEMBER Role..." -ForegroundColor Yellow
$r7 = Test-Endpoint -Path "/api/circle-member" -RoleName "CIRCLE_MEMBER"
if ($r7.Success) {
    Write-Host "  ✅ /api/circle-member - Status $($r7.Status)" -ForegroundColor Green
} else {
    Write-Host "  ❌ /api/circle-member - Error: $($r7.Status)" -ForegroundColor Red
}
$TestResults += $r7

# Test 8: University Member Role
Write-Host "`n[8/8] Testing UNIVERSITY_MEMBER Role..." -ForegroundColor Yellow
$r8 = Test-Endpoint -Path "/api/university/profile" -RoleName "UNIVERSITY_MEMBER"
if ($r8.Success) {
    Write-Host "  ✅ /api/university/profile - Status $($r8.Status)" -ForegroundColor Green
} else {
    Write-Host "  ❌ /api/university/profile - Error: $($r8.Status)" -ForegroundColor Red
}
$TestResults += $r8

# Summary
Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                      TEST SUMMARY                             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$PassCount = ($TestResults | Where-Object { $_.Success }).Count
$FailCount = ($TestResults | Where-Object { -not $_.Success }).Count
$TotalCount = $TestResults.Count

Write-Host "Total Tests: $TotalCount" -ForegroundColor White
Write-Host "✅ Passed: $PassCount" -ForegroundColor Green
Write-Host "❌ Failed: $FailCount" -ForegroundColor Red

if ($FailCount -eq 0) {
    Write-Host "`n✨ All dashboard endpoints are accessible! ✨" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Some endpoints need attention:" -ForegroundColor Yellow
    $TestResults | Where-Object { -not $_.Success } | ForEach-Object {
        Write-Host "  - [$($_.Role)] $($_.Path): $($_.Error)" -ForegroundColor Red
    }
}

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Sign up test users for each role at http://localhost:3002/auth/signup" -ForegroundColor Gray
Write-Host "2. Verify users are created in PostgreSQL database" -ForegroundColor Gray
Write-Host "3. Create enrollments to populate student dashboards" -ForegroundColor Gray
Write-Host "4. Re-run this test after adding data" -ForegroundColor Gray
