# Setup script for Notabot CLI
# This script helps configure Notabot to work from any directory

param(
    [Parameter(Mandatory=$true)]
    [string]$ApiKey,
    
    [string]$Theme = "default"
)

Write-Host "Setting up Notabot CLI..." -ForegroundColor Green

# Create .gemini directory if it doesn't exist
$geminiDir = "$env:USERPROFILE\.gemini"
if (!(Test-Path $geminiDir)) {
    New-Item -ItemType Directory -Path $geminiDir -Force
}

# Create/update settings.json
$settings = @{
    selectedAuthType = "gemini-api-key"
    geminiApiKey = $ApiKey
    theme = $Theme
    editor = "not_set"
} | ConvertTo-Json

Set-Content -Path "$geminiDir\settings.json" -Value $settings

# Set environment variable for current session
$env:GEMINI_API_KEY = $ApiKey

Write-Host "Settings updated successfully!" -ForegroundColor Green
Write-Host "API Key configured in: $geminiDir\settings.json" -ForegroundColor Yellow
Write-Host "Environment variable set for current session" -ForegroundColor Yellow

# Test Notabot from different directory
Write-Host "`nTesting Notabot from C:\ directory..." -ForegroundColor Cyan
cd C:\
notabot-full --help | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Notabot works from C:\ directory!" -ForegroundColor Green
} else {
    Write-Host "❌ Notabot failed to run from C:\ directory" -ForegroundColor Red
}

Write-Host "`nSetup complete! You can now use Notabot from any directory." -ForegroundColor Green
Write-Host "Usage examples:" -ForegroundColor Yellow
Write-Host "  notabot-full                    # Interactive mode" -ForegroundColor White
Write-Host "  notabot-full -p 'Hello world'   # Non-interactive mode" -ForegroundColor White
Write-Host "  notabot-full --theme dracula    # With custom theme" -ForegroundColor White 
