# JMeter Test Runner Script
# Usage: .\run-test.ps1 -Users 100 -Duration 60

param(
    [Parameter(Mandatory=$false)]
    [int]$Users = 100,
    
    [Parameter(Mandatory=$false)]
    [int]$Duration = 60,
    
    [Parameter(Mandatory=$false)]
    [int]$RampUp = 10
)

Write-Host "=== JMeter Performance Test ===" -ForegroundColor Cyan
Write-Host ""

# Find JMeter installation
$jmeterHome = $env:JMETER_HOME
if (-not $jmeterHome) {
    $commonPaths = @(
        "C:\Program Files\Apache\jmeter",
        "C:\apache-jmeter-5.6.3",
        "$env:USERPROFILE\Downloads\apache-jmeter-5.6.3",
        "$env:USERPROFILE\Downloads\apache-jmeter-5.6.3\apache-jmeter-5.6.3"
    )
    
    foreach ($path in $commonPaths) {
        if (Test-Path "$path\bin\jmeter.bat") {
            $jmeterHome = $path
            break
        }
    }
}

if (-not $jmeterHome -or -not (Test-Path "$jmeterHome\bin\jmeter.bat")) {
    Write-Host "✗ JMeter not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please either:" -ForegroundColor Yellow
    Write-Host "  1. Set JMETER_HOME environment variable" -ForegroundColor White
    Write-Host "  2. Install JMeter in one of these locations:" -ForegroundColor White
    $commonPaths | ForEach-Object { Write-Host "     - $_" -ForegroundColor Gray }
    Write-Host ""
    Write-Host "Download JMeter from: https://jmeter.apache.org/download_jmeter.cgi" -ForegroundColor Cyan
    exit 1
}

Write-Host "✓ JMeter found: $jmeterHome" -ForegroundColor Green
Write-Host ""

# Test configuration
$testPlan = "$PSScriptRoot\..\plans\hostly-test-plan.jmx"
$resultsDir = "$PSScriptRoot\..\results"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$resultFile = "$resultsDir\test-$Users-users-$timestamp.jtl"
$reportDir = "$PSScriptRoot\..\reports\report-$Users-users-$timestamp"

# Create directories
New-Item -ItemType Directory -Path $resultsDir -Force | Out-Null
New-Item -ItemType Directory -Path (Split-Path $reportDir) -Force | Out-Null

Write-Host "Test Configuration:" -ForegroundColor Yellow
Write-Host "  Users: $Users" -ForegroundColor White
Write-Host "  Duration: $Duration seconds" -ForegroundColor White
Write-Host "  Ramp-up: $RampUp seconds" -ForegroundColor White
Write-Host "  Test Plan: $testPlan" -ForegroundColor White
Write-Host "  Results: $resultFile" -ForegroundColor White
Write-Host ""

if (-not (Test-Path $testPlan)) {
    Write-Host "✗ Test plan not found: $testPlan" -ForegroundColor Red
    Write-Host "  Please create the test plan first using create-test-plan.py" -ForegroundColor Yellow
    exit 1
}

Write-Host "Starting JMeter test..." -ForegroundColor Yellow
Write-Host ""

# Run JMeter in non-GUI mode
$jmeterCmd = "$jmeterHome\bin\jmeter.bat"
$jmeterArgs = @(
    "-n",  # Non-GUI mode
    "-t", $testPlan,
    "-l", $resultFile,
    "-e",  # Generate HTML report
    "-o", $reportDir,
    "-Jusers=$Users",
    "-Jduration=$Duration",
    "-Jrampup=$RampUp"
)

try {
    & $jmeterCmd $jmeterArgs

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Test completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Results:" -ForegroundColor Yellow
        Write-Host "  JTL File: $resultFile" -ForegroundColor White
        Write-Host "  HTML Report: $reportDir\index.html" -ForegroundColor White
        Write-Host ""
        Write-Host "Open report: start $reportDir\index.html" -ForegroundColor Cyan
    }
    else {
        Write-Host ""
        Write-Host "✗ Test failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        exit $LASTEXITCODE
    }
}
catch {
    Write-Host ""
    Write-Host "✗ Error running JMeter: $_" -ForegroundColor Red
    exit 1
}
