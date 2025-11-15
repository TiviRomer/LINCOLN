# Quick test script to verify backend is working
Write-Host "Testing LINCOLN Backend..." -ForegroundColor Cyan
Write-Host ""

# Test health endpoint
Write-Host "1. Testing health endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8080/health" -Method Get
    Write-Host "   ✓ Health check passed" -ForegroundColor Green
    Write-Host "   Response: $($health | ConvertTo-Json)" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Health check failed: $_" -ForegroundColor Red
    Write-Host "   Make sure the backend is running on port 8080" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Test registration
Write-Host "2. Testing registration endpoint..." -ForegroundColor Yellow
$testUser = @{
    name = "Test User"
    email = "test$(Get-Random)@example.com"
    password = "Test1234"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $testUser
    
    if ($response.success) {
        Write-Host "   ✓ Registration test passed" -ForegroundColor Green
        Write-Host "   User ID: $($response.user.id)" -ForegroundColor Gray
        Write-Host "   Email: $($response.user.email)" -ForegroundColor Gray
    } else {
        Write-Host "   ✗ Registration failed: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ✗ Registration test failed" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Response: $responseBody" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Cyan

