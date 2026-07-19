$baseUrl = "http://localhost:4000/api"
$body = '{"email":"supervisor@eaop.local","password":"password123"}'
$login = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body $body
$supTok = $login.token
$h = @{ "Authorization" = "Bearer $supTok"; "Content-Type" = "application/json" }

# Get a critical pending defect
$defects = Invoke-RestMethod -Uri "$baseUrl/defects?status=pending_approval" -Method GET -Headers $h
$crit = $defects.data | Where-Object { $_.severity -eq "critical" } | Select-Object -First 1
if (-not $crit) { Write-Host "No critical pending defect found"; exit }
Write-Host "Approving defect $($crit.id) (severity=$($crit.severity))"

# Approve it
$approveBody = '{"status":"approved","notes":"Verified during inspection round."}'
$res = Invoke-RestMethod -Uri "$baseUrl/defects/$($crit.id)/status" -Method PATCH -Headers $h -Body $approveBody
Write-Host "Approval result: $($res | ConvertTo-Json -Compress)"

# Check work orders - did a new one appear?
$wos = Invoke-RestMethod -Uri "$baseUrl/work-orders" -Method GET -Headers $h
Write-Host "Total work orders: $($wos.total)"

# Log a non-critical defect as inspector
$body2 = '{"email":"inspector@eaop.local","password":"password123"}'
$login2 = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body $body2
$inspTok = $login2.token
$ih = @{ "Authorization" = "Bearer $inspTok"; "Content-Type" = "application/json" }

# Pick an asset
$assets = Invoke-RestMethod -Uri "$baseUrl/assets?pageSize=1" -Method GET -Headers $ih
$assetId = $assets.data[0].id
Write-Host "Creating non-critical defect on asset $assetId"
$defectBody = '{"assetId":"' + $assetId + '","severity":"low","category":"Other","description":"Routine maintenance log - slight wear on access panel hinge."}'
$newDefect = Invoke-RestMethod -Uri "$baseUrl/defects" -Method POST -Headers $ih -Body $defectBody
Write-Host "New defect: id=$($newDefect.id) status=$($newDefect.status)"

# Verify dashboard reflects new state
$body3 = '{"email":"plant.manager@eaop.local","password":"password123"}'
$login3 = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body $body3
$pmTok = $login3.token
$ph = @{ "Authorization" = "Bearer $pmTok"; "Content-Type" = "application/json" }
$kpis = Invoke-RestMethod -Uri "$baseUrl/dashboard/kpis" -Method GET -Headers $ph
Write-Host "PM Dashboard KPIs: totalAssets=$($kpis.totalAssets) openDefects=$($kpis.openDefects) critical=$($kpis.criticalDefectsAwaitingApproval) openWOs=$($kpis.openWorkOrders)"

# Verify audit log captured the actions
$audit = Invoke-RestMethod -Uri "$baseUrl/audit-log?pageSize=5" -Method GET -Headers $ph
Write-Host "Audit log: total=$($audit.total)"
foreach ($entry in $audit.data) {
  Write-Host "  [$($entry.createdAt)] $($entry.action) on $($entry.entityType) by $($entry.userName)"
}

# Verify notification was created
$notifs = Invoke-RestMethod -Uri "$baseUrl/notifications" -Method GET -Headers $ih
Write-Host "Inspector notifications: $($notifs.Count) total"
if ($notifs.Count -gt 0) {
  $latest = $notifs[0]
  Write-Host "  Latest: type=$($latest.type) msg=$($latest.message)"
}
