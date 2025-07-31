# Setup script for CLI Agents
# This script installs and configures the simple and enhanced CLI agents

Write-Host "Setting up CLI Agents..." -ForegroundColor Green

# Create installation directory
$installDir = "$env:USERPROFILE\.cli-agents"
if (!(Test-Path $installDir)) {
    New-Item -ItemType Directory -Path $installDir -Force
    Write-Host "Created installation directory: $installDir" -ForegroundColor Yellow
}

# Copy CLI agent files
$files = @("simple-cli-agent.js", "enhanced-cli-agent.js")
foreach ($file in $files) {
    if (Test-Path $file) {
        Copy-Item $file -Destination $installDir -Force
        Write-Host "Copied $file to $installDir" -ForegroundColor Green
    } else {
        Write-Host "Warning: $file not found" -ForegroundColor Red
    }
}

# Create batch files for easy execution
$batchContent = @"
@echo off
node "$installDir\simple-cli-agent.js" %*
"@
$batchContent | Out-File -FilePath "$installDir\simple-cli.bat" -Encoding ASCII

$enhancedBatchContent = @"
@echo off
node "$installDir\enhanced-cli-agent.js" %*
"@
$enhancedBatchContent | Out-File -FilePath "$installDir\enhanced-cli.bat" -Encoding ASCII

# Add to PATH if not already there
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if ($currentPath -notlike "*$installDir*") {
    [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$installDir", "User")
    Write-Host "Added $installDir to PATH" -ForegroundColor Green
}

# Create settings directories
$simpleSettingsDir = "$env:USERPROFILE\.simple-cli"
$enhancedSettingsDir = "$env:USERPROFILE\.enhanced-cli"

if (!(Test-Path $simpleSettingsDir)) {
    New-Item -ItemType Directory -Path $simpleSettingsDir -Force
}

if (!(Test-Path $enhancedSettingsDir)) {
    New-Item -ItemType Directory -Path $enhancedSettingsDir -Force
}

# Install dependencies for enhanced CLI agent
Write-Host "Installing dependencies for Enhanced CLI Agent..." -ForegroundColor Yellow
Set-Location $installDir
if (Test-Path "package.json") {
    npm install
} else {
    # Create package.json for enhanced CLI agent
    $packageJson = @"
{
  "name": "cli-agents",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.2"
  }
}
"@
    $packageJson | Out-File -FilePath "package.json" -Encoding UTF8
    npm install
}

Write-Host "`nSetup complete!" -ForegroundColor Green
Write-Host "You can now use the following commands:" -ForegroundColor Yellow
Write-Host "  simple-cli    - Run the simple CLI agent" -ForegroundColor Cyan
Write-Host "  enhanced-cli  - Run the enhanced CLI agent" -ForegroundColor Cyan
Write-Host "`nEnhanced CLI Agent Features:" -ForegroundColor Yellow
Write-Host "  - YOLO mode for dangerous operations" -ForegroundColor White
Write-Host "  - Web server with live dashboard" -ForegroundColor White
Write-Host "  - Read all files tool" -ForegroundColor White
Write-Host "  - CD command for directory navigation" -ForegroundColor White
Write-Host "  - Advanced session statistics" -ForegroundColor White
Write-Host "`nTo set your Gemini API key:" -ForegroundColor Yellow
Write-Host "  enhanced-cli" -ForegroundColor Cyan
Write-Host "  /auth YOUR_API_KEY" -ForegroundColor White
Write-Host "`nTo start the web server:" -ForegroundColor Yellow
Write-Host "  /webserver start" -ForegroundColor White
Write-Host "`nSettings are stored in:" -ForegroundColor Yellow
Write-Host "  $simpleSettingsDir" -ForegroundColor Gray
Write-Host "  $enhancedSettingsDir" -ForegroundColor Gray 
