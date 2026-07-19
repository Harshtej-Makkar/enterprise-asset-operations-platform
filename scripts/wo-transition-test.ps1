$baseUrl = "http://localhost:4000/api"
$body = '{"email":"technician@eaop.local","password":"password123"}'
$login = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body $body
$techTok = $login.token
$h = @{ "Authorization" = "Bearer $techTok"; "Content-Type" = "application/json" }

# List my work orders
$wos = Invoke-RestMethod -Uri "$baseUrl/work-orders?assignedToMe=true" -Method GET -Headers $h
Write-Host "My work orders: $($wos.total)"
$first = $wos.data | Select-Object -First 1
if ($first) {
  Write-Host "First: id=$($first.id) status=$($first.status) title=$($first.title)"
  Write-Host "Transitioning to in_progress"
  $tr = '{"status":"in_progress","notes":"Started work."}'
  $res = Invoke-RestMethod -Uri "$baseUrl/work-orders/$($first.id)/status" -Method PATCH -Headers $h -Body $tr
  Write-Host "Result: $($res | ConvertTo-Json -Compress)"
  $r2 = Invoke-RestMethod -Uri "$baseUrl/work-orders/$($first.id)" -Method GET -Headers $h
  Write-Host "After transition: status=$($r2.status)"
  Write-Host "Transitioning to completed"
  $tr2 = '{"status":"completed","notes":"Repair complete. Verified operation."}'
  $res2 = Invoke-RestMethod -Uri "$baseUrl/work-orders/$($first.id)/status" -Method PATCH -Headers $h -Body $tr2
  Write-Host "Result: $($res2 | ConvertTo-Json -Compress)"
}
