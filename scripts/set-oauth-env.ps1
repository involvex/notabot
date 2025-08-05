# PowerShell script to set OAuth environment variables

Write-Host "🔧 Setting OAuth environment variables..." -ForegroundColor Green

# OAuth credentials from the JSON file
$env:GOOGLE_CLIENT_ID = "57386476101-ndu1bfbj7us90j0kvc77ph8v6fe78f4g.apps.googleusercontent.com"
$env:GOOGLE_CLIENT_SECRET = "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"

Write-Host "✅ Environment variables set:" -ForegroundColor Green
Write-Host "   GOOGLE_CLIENT_ID = $env:GOOGLE_CLIENT_ID" -ForegroundColor Cyan
Write-Host "   GOOGLE_CLIENT_SECRET = $($env:GOOGLE_CLIENT_SECRET.Substring(0,10))..." -ForegroundColor Cyan

Write-Host "`n🎉 OAuth credentials configured!" -ForegroundColor Green
Write-Host "You can now run: notabot" -ForegroundColor Yellow
Write-Host "Then use: /login" -ForegroundColor Yellow 
