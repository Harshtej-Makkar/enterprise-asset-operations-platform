$baseUrl = "http://localhost:4000/api"

function Invoke-EAOP {
  param(
    [string]$Method = "GET",
    [string]$Path,
    [string]$Token = $null,
    [string]$Body = $null
  )
  $headers = @{ "Content-Type" = "application/json" }
  if ($Token) { $headers["Authorization"] = "Bearer $Token" }
  $params = @{
    Uri = "$baseUrl$Path"
    Method = $Method
    Headers = $headers
    Body = $Body
  }
  try {
    $r = Invoke-RestMethod @params -ErrorAction Stop
    return @{ ok = $true; data = $r }
  } catch {
    return @{ ok = $false; error = $_.Exception.Message; details = $_.ErrorDetails }
  }
}

function Login-As {
  param([string]$Email)
  $body = "{`"email`":`"$Email`",`"password`":`"password123`"}"
  $r = Invoke-EAOP -Method POST -Path "/auth/login" -Body $body
  if ($r.ok) { return $r.data.token }
  Write-Host "LOGIN FAILED for $Email : $($r.error)"
  return $null
}

# --- INSPECTOR JOURNEY ---
Write-Host "`n=== INSPECTOR JOURNEY ===" -ForegroundColor Cyan
$inspectorTok = Login-As "inspector@eaop.local"
Write-Host "Login OK. Token: $($inspectorTok.Substring(0, 20))..."

# List inspections
$r = Invoke-EAOP -Method GET -Path "/inspections?pageSize=5" -Token $inspectorTok
Write-Host "Inspections list: total=$($r.data.total)"
if ($r.data.data.Count -gt 0) {
  $firstInspection = $r.data.data[0]
  Write-Host "  First: id=$($firstInspection.id) status=$($firstInspection.status) asset=$($firstInspection.asset.assetCode)"
}

# List defects
$r = Invoke-EAOP -Method GET -Path "/defects?pageSize=5" -Token $inspectorTok
Write-Host "Defects list: total=$($r.data.total)"

# Notifications
$r = Invoke-EAOP -Method GET -Path "/notifications?limit=10" -Token $inspectorTok
Write-Host "Notifications: count=$($r.data.Count)"
if ($r.data.Count -gt 0) {
  Write-Host "  Latest: type=$($r.data[0].type) message=$($r.data[0].message)"
}

# --- SUPERVISOR JOURNEY ---
Write-Host "`n=== SUPERVISOR JOURNEY ===" -ForegroundColor Cyan
$supTok = Login-As "supervisor@eaop.local"
Write-Host "Login OK."
# List critical defects awaiting approval
$r = Invoke-EAOP -Method GET -Path "/defects?severity=critical&status=pending_approval" -Token $supTok
Write-Host "Pending critical defects: total=$($r.data.total)"

# List work orders
$r = Invoke-EAOP -Method GET -Path "/work-orders" -Token $supTok
Write-Host "Work orders: total=$($r.data.total)"

# --- PLANT MANAGER JOURNEY ---
Write-Host "`n=== PLANT MANAGER JOURNEY ===" -ForegroundColor Cyan
$pmTok = Login-As "plant.manager@eaop.local"
$r = Invoke-EAOP -Method GET -Path "/dashboard/kpis" -Token $pmTok
Write-Host "Dashboard KPIs: totalAssets=$($r.data.totalAssets) openDefects=$($r.data.openDefects)"

# Reports
$r = Invoke-EAOP -Method GET -Path "/reports/types" -Token $pmTok
Write-Host "Report types: $($r.data -join ', ')"

# Audit log
$r = Invoke-EAOP -Method GET -Path "/audit-log?pageSize=5" -Token $pmTok
Write-Host "Audit log: total=$($r.data.total)"

# --- TECHNICIAN JOURNEY ---
Write-Host "`n=== TECHNICIAN JOURNEY ===" -ForegroundColor Cyan
$techTok = Login-As "technician@eaop.local"
$r = Invoke-EAOP -Method GET -Path "/work-orders?assignedToMe=true" -Token $techTok
Write-Host "My work orders: total=$($r.data.total)"

# --- ADMIN JOURNEY ---
Write-Host "`n=== ADMIN JOURNEY ===" -ForegroundColor Cyan
$adminTok = Login-As "admin@eaop.local"
$r = Invoke-EAOP -Method GET -Path "/assets?pageSize=3" -Token $adminTok
Write-Host "Assets: total=$($r.data.total)"
$r = Invoke-EAOP -Method GET -Path "/users" -Token $adminTok
Write-Host "Users: total=$($r.data.total)"

# Check if /settings returns 200 (stub)
$r = Invoke-EAOP -Method GET -Path "/settings" -Token $adminTok
if ($r.ok) { Write-Host "Settings: $($r.data | ConvertTo-Json -Compress)" } else { Write-Host "Settings: not implemented (404 expected): $($r.details | Out-String)" }

Write-Host "`n=== QA JOURNEY COMPLETE ===" -ForegroundColor Green
