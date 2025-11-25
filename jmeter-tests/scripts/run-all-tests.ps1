# Run all performance tests (100, 200, 300, 400, 500 users)
# This script runs tests sequentially and generates a summary report

Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "     JMeter Performance Testing - All Load Tests" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

$userCounts = @(100, 200, 300, 400, 500)
$testDuration = 60
$rampUp = 10

$results = @()

foreach ($users in $userCounts) {
    Write-Host ""
    Write-Host "Testing with $users concurrent users..." -ForegroundColor Yellow
    Write-Host ""
    
    $startTime = Get-Date
    
    # Run the test
    & "$PSScriptRoot\run-test.ps1" -Users $users -Duration $testDuration -RampUp $rampUp
    
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Test completed for $users users in $([math]::Round($duration, 2)) seconds" -ForegroundColor Green
        
        $results += @{
            Users = $users
            Status = "Success"
            Duration = $duration
        }
    } else {
        Write-Host "Test failed for $users users" -ForegroundColor Red
        
        $results += @{
            Users = $users
            Status = "Failed"
            Duration = $duration
        }
    }
    
    # Wait a bit between tests
    Write-Host "Waiting 10 seconds before next test..." -ForegroundColor Gray
    Start-Sleep -Seconds 10
}

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "                    TEST SUMMARY" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

$results | ForEach-Object {
    $statusColor = if ($_.Status -eq "Success") { "Green" } else { "Red" }
    Write-Host "$($_.Users) users: $($_.Status)" -ForegroundColor $statusColor
}

Write-Host ""
Write-Host "All test results are in: jmeter-tests\results\" -ForegroundColor Cyan
Write-Host "All HTML reports are in: jmeter-tests\reports\" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review individual reports in jmeter-tests\reports\" -ForegroundColor White
Write-Host "  2. Compare results across different user counts" -ForegroundColor White
Write-Host "  3. Analyze performance bottlenecks" -ForegroundColor White
Write-Host "  4. Generate comparison graphs using analyze-results.py" -ForegroundColor White
Write-Host ""
