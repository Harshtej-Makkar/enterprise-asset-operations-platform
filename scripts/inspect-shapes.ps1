$baseUrl = "http://localhost:4000/api"
$body = '{"email":"inspector@eaop.local","password":"password123"}'
$login = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body $body
$tok = $login.token
$h = @{ "Authorization" = "Bearer $tok" }

Write-Host "=== /inspections (inspector) ===" -ForegroundColor Cyan
$r = Invoke-RestMethod -Uri "$baseUrl/inspections" -Method GET -Headers $h
$r | ConvertTo-Json -Depth 3 | Out-String | Write-Host

Write-Host "`n=== /defects (inspector) ===" -ForegroundColor Cyan
$r = Invoke-RestMethod -Uri "$baseUrl/defects" -Method GET -Headers $h
$r | ConvertTo-Json -Depth 3 | Out-String | Write-Host

Write-Host "`n=== /notifications (inspector) ===" -ForegroundColor Cyan
$r = Invoke-RestMethod -Uri "$baseUrl/notifications" -Method GET -Headers $h
$r | ConvertTo-Json -Depth 3 | Out-String | Write-Host
