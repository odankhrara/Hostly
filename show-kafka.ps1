# Kafka Implementation Visual Demonstration Script
# Run this to show your faculty that Kafka is implemented

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "KAFKA IMPLEMENTATION DEMONSTRATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. KAFKA INFRASTRUCTURE STATUS" -ForegroundColor Yellow
Write-Host "-------------------------------" -ForegroundColor Yellow
docker-compose ps | Select-String -Pattern "kafka|zookeeper|backend"
Write-Host ""

Write-Host "2. KAFKA TOPICS (Proof: Topics Created)" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow
$topics = docker exec hostly-kafka kafka-topics --bootstrap-server localhost:9092 --list 2>$null
if ($topics) {
    Write-Host "✅ Topics found:" -ForegroundColor Green
    $topics | ForEach-Object { Write-Host "   - $_" -ForegroundColor White }
} else {
    Write-Host "⚠️  Topics will be auto-created when first event is published" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "3. TOPIC DETAILS (3 Partitions Each - As Required)" -ForegroundColor Yellow
Write-Host "---------------------------------------------------" -ForegroundColor Yellow
Write-Host "booking-created topic:" -ForegroundColor Green
docker exec hostly-kafka kafka-topics --bootstrap-server localhost:9092 --describe --topic booking-created 2>$null
Write-Host ""
Write-Host "booking-status-updated topic:" -ForegroundColor Green
docker exec hostly-kafka kafka-topics --bootstrap-server localhost:9092 --describe --topic booking-status-updated 2>$null
Write-Host ""

Write-Host "4. CONSUMER GROUPS (Proof: Consumers Active)" -ForegroundColor Yellow
Write-Host "---------------------------------------------" -ForegroundColor Yellow
$groups = docker exec hostly-kafka kafka-consumer-groups --bootstrap-server localhost:9092 --list 2>$null
if ($groups) {
    Write-Host "✅ Consumer groups found:" -ForegroundColor Green
    $groups | ForEach-Object { Write-Host "   - $_" -ForegroundColor White }
} else {
    Write-Host "⚠️  Consumer groups will appear after consumers connect" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "5. CONSUMER GROUP DETAILS" -ForegroundColor Yellow
Write-Host "-------------------------" -ForegroundColor Yellow
Write-Host "owner-service-group (consumes booking-created):" -ForegroundColor Green
docker exec hostly-kafka kafka-consumer-groups --bootstrap-server localhost:9092 --group owner-service-group --describe 2>$null
Write-Host ""
Write-Host "traveler-service-group (consumes booking-status-updated):" -ForegroundColor Green
docker exec hostly-kafka kafka-consumer-groups --bootstrap-server localhost:9092 --group traveler-service-group --describe 2>$null
Write-Host ""

Write-Host "6. BACKEND KAFKA CONNECTION STATUS" -ForegroundColor Yellow
Write-Host "----------------------------------" -ForegroundColor Yellow
$logs = docker-compose logs backend 2>&1 | Select-String -Pattern "Kafka|producer connected|consumer connected|Consumer has joined" -CaseSensitive:$false | Select-Object -First 10
if ($logs) {
    $logs | ForEach-Object {
        if ($_ -match "connected|joined") {
            Write-Host "✅ $_" -ForegroundColor Green
        } else {
            Write-Host "   $_" -ForegroundColor White
        }
    }
} else {
    Write-Host "⚠️  No Kafka logs found. Check if backend is running." -ForegroundColor Yellow
}
Write-Host ""

Write-Host "7. CODE EVIDENCE (Where Kafka is Used)" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow
Write-Host "Files using Kafka:" -ForegroundColor Green
Get-ChildItem -Recurse -Path backend/src -Include *.js | Select-String -Pattern "kafkaService|publishBooking|runOwnerConsumer|runTravelerConsumer" | 
    Select-Object -Property Path,LineNumber,Line -Unique | 
    ForEach-Object { 
        $file = $_.Path -replace ".*[\\/]backend[\\/]src[\\/]", ""
        Write-Host "   📄 $file (line $($_.LineNumber))" -ForegroundColor Cyan
    }
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEMONSTRATION COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 TIP: For live demo, run these in separate windows:" -ForegroundColor Yellow
Write-Host "   Window 1: docker exec -it hostly-kafka kafka-console-consumer --bootstrap-server localhost:9092 --topic booking-created --from-beginning" -ForegroundColor White
Write-Host "   Window 2: docker exec -it hostly-kafka kafka-console-consumer --bootstrap-server localhost:9092 --topic booking-status-updated --from-beginning" -ForegroundColor White
Write-Host "   Then create a booking in your app to see events in real-time!" -ForegroundColor White

