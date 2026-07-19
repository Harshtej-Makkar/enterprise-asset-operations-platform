$baseUrl = "http://localhost:4000/api"
$body = '{"email":"supervisor@eaop.local","password":"password123"}'
$login = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body $body
$supTok = $login.token
$h = @{ "Authorization" = "Bearer $supTok"; "Content-Type" = "application/json" }

# Get a critical pending defect
$defects = Invoke-RestMethod -Uri "$baseUrl/defects?status=pending_approval" -Method GET -Headers $h
$crit = $defects.data | Where-Object { $_.severity -eq "critical" } | Select-Object -First 1
if (-not $crit) { Write-Host "No critical pending defect found"; exit }
Write-Host "Approving defect $($crit.id) via POST /approval"

# Approve via correct endpoint
$approveBody = '{"decision":"approved","notes":"Verified during inspection round."}'
$res = Invoke-RestMethod -Uri "$baseUrl/defects/$($crit.id)/approval" -Method POST -Headers $h -Body $approveBody
Write-Host "Approval result: $($res | ConvertTo-Json -Compress)"

# Check work orders - should have grown
$wos = Invoke-RestMethod -Uri "$baseUrl/work-orders" -Method GET -Headers $h
Write-Host "Total work orders: $($wos.total)"

# Check defect is now approved
$d = Invoke-RestMethod -Uri "$baseUrl/defects/$($crit.id)" -Method GET -Headers $h
Write-Host "Defect after approval: status=$($d.status)"

# Check if a work order was created referencing this defect
$related = $wos.data | Where-Object { $_.defectId -eq $crit.id } | Select-Object -First 1
if ($related) {
  Write-Host "Related work order: id=$($related.id) status=$($related.status)"
}
