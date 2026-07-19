$baseUrl = "http://localhost:4000/api"
$body = '{"email":"supervisor@eaop.local","password":"password123"}'
$login = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body $body
$supTok = $login.token
$h = @{ "Authorization" = "Bearer $supTok"; "Content-Type" = "application/json" }

# Get an open work order
$wos = Invoke-RestMethod -Uri "$baseUrl/work-orders?status=open" -Method GET -Headers $h
$wo = $wos.data | Select-Object -First 1
Write-Host "Test WO: id=$($wo.id) status=$($wo.status)"

# Get users to find technician
$users = Invoke-RestMethod -Uri "$baseUrl/users" -Method GET -Headers $h
$tech = $users.data | Where-Object { $_.role -eq "technician" } | Select-Object -First 1
Write-Host "Assigning to technician: $($tech.id)"

# Try assign endpoint
$assignBody = '{"assignedTo":"' + $tech.id + '"}'
try {
  $r = Invoke-RestMethod -Uri "$baseUrl/work-orders/$($wo.id)/assign" -Method POST -Headers $h -Body $assignBody
  Write-Host "Assign result: $($r | ConvertTo-Json -Compress)"
} catch {
  Write-Host "Assign via /assign failed: $($_.Exception.Message)"
  try {
    $r = Invoke-RestMethod -Uri "$baseUrl/work-orders/$($wo.id)" -Method PATCH -Headers $h -Body $assignBody
    Write-Host "Assign via PATCH result: $($r | ConvertTo-Json -Compress)"
  } catch {
    Write-Host "Assign via PATCH failed: $($_.Exception.Message)"
  }
}

# Now login as technician and advance
$body2 = '{"email":"technician@eaop.local","password":"password123"}'
$login2 = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body $body2
$techTok = $login2.token
$th = @{ "Authorization" = "Bearer $techTok"; "Content-Type" = "application/json" }

$r2 = Invoke-RestMethod -Uri "$baseUrl/work-orders/$($wo.id)" -Method GET -Headers $th
Write-Host "Tech view of WO: assignedTo=$($r2.assignedTo) status=$($r2.status)"

# Now try in_progress
$tr = '{"status":"in_progress","notes":"Started work."}'
try {
  $res = Invoke-RestMethod -Uri "$baseUrl/work-orders/$($wo.id)/status" -Method PATCH -Headers $th -Body $tr
  Write-Host "Transition to in_progress: $($res | ConvertTo-Json -Compress)"
  $tr2 = '{"status":"completed","notes":"Repair complete. Verified operation."}'
  $res2 = Invoke-RestMethod -Uri "$baseUrl/work-orders/$($wo.id)/status" -Method PATCH -Headers $th -Body $tr2
  Write-Host "Transition to completed: $($res2 | ConvertTo-Json -Compress)"
} catch {
  Write-Host "Transition failed: $($_.Exception.Message)"
}
