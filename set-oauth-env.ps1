# Set OAuth Environment Variables for NotABot
Write-Host "🔧 Setting up OAuth environment variables for NotABot..." -ForegroundColor Green

# Set environment variables
$env:GOOGLE_CLIENT_ID = "57386476101-ndu1bfbj7us90j0kvc77ph8v6fe78f4g.apps.googleusercontent.com"
$env:GOOGLE_CLIENT_SECRET = "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"

Write-Host "✅ OAuth credentials set:" -ForegroundColor Green
Write-Host "   Client ID: $env:GOOGLE_CLIENT_ID" -ForegroundColor Yellow
Write-Host "   Client Secret: $env:GOOGLE_CLIENT_SECRET" -ForegroundColor Yellow

Write-Host ""
Write-Host "🎯 Next steps:" -ForegroundColor Cyan
Write-Host "1. Start NotABot: notabot" -ForegroundColor White
Write-Host "2. Login with OAuth: /login" -ForegroundColor White
Write-Host "3. Test authentication" -ForegroundColor White

Write-Host ""
Write-Host "📝 Note: These environment variables are set for this session only." -ForegroundColor Yellow
Write-Host "   For permanent setup, add them to your system environment variables." -ForegroundColor Yellow 