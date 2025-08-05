Write-Host "🔧 Testing NotABot Global Installation..." -ForegroundColor Green
Write-Host ""

Write-Host "✅ Checking if notabot is installed globally..." -ForegroundColor Yellow
npm list -g notabot

Write-Host ""
Write-Host "✅ Installing notabot globally..." -ForegroundColor Yellow
npm install -g . --force

Write-Host ""
Write-Host "✅ Running setup..." -ForegroundColor Yellow
npm run setup

Write-Host ""
Write-Host "✅ Testing notabot command..." -ForegroundColor Yellow
try {
    notabot --help
} catch {
    Write-Host "❌ notabot command not found. Trying alternative..." -ForegroundColor Red
    node notabot.js --help
}

Write-Host ""
Write-Host "🎉 Installation test completed!" -ForegroundColor Green
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 