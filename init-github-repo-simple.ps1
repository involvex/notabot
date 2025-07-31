# Simple Notabot CLI GitHub Repository Initialization Script (PowerShell)
# This script creates a GitHub repository with predefined settings

param(
    [string]$RepoName = "notabot-cli",
    [string]$Description = "Enhanced command-line interface built on top of Gemini CLI",
    [string]$Visibility = "public"
)

Write-Host "🚀 Creating GitHub Repository for Notabot CLI" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Check if git is installed
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git is not installed. Please install git first." -ForegroundColor Red
    exit 1
}

# Check if gh CLI is installed
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ GitHub CLI (gh) is not installed. Please install it first." -ForegroundColor Red
    Write-Host "Visit: https://cli.github.com/" -ForegroundColor Yellow
    exit 1
}

# Check if user is authenticated with GitHub
try {
    gh auth status | Out-Null
} catch {
    Write-Host "❌ Not authenticated with GitHub. Please run 'gh auth login' first." -ForegroundColor Red
    exit 1
}

Write-Host "📋 Repository Configuration:" -ForegroundColor Cyan
Write-Host "  Name: $RepoName" -ForegroundColor White
Write-Host "  Description: $Description" -ForegroundColor White
Write-Host "  Visibility: $Visibility" -ForegroundColor White
Write-Host ""

Write-Host "🔧 Creating GitHub repository..." -ForegroundColor Yellow

# Create the repository
gh repo create $RepoName `
    --description $Description `
    --$Visibility `
    --source=. `
    --remote=origin `
    --push

Write-Host ""
Write-Host "✅ Repository created successfully!" -ForegroundColor Green
Write-Host ""

# Add topics to the repository
Write-Host "🏷️ Adding repository topics..." -ForegroundColor Yellow
gh repo edit $RepoName --add-topic cli,gemini,notabot,typescript,nodejs,developer-tools

# Create initial release
Write-Host "📦 Creating initial release..." -ForegroundColor Yellow
git tag -a v0.1.0 -m "Initial release"
git push origin v0.1.0

# Create GitHub release
$releaseNotes = @'
Initial release of Notabot CLI

## Features
- Global installation as 'notabot-full'
- Enhanced tools and commands
- Custom themes and UI
- Web server integration
- Image enhancement capabilities

## Installation
```bash
npm install -g .
notabot-full --help
```
'@

gh release create v0.1.0 --title "Initial Release" --notes $releaseNotes

Write-Host ""
Write-Host "🎉 Repository setup complete!" -ForegroundColor Green
Write-Host ""

# Get repository URL
$repoUrl = gh repo view --json owner,name -q '.owner.login + "/" + .name'
Write-Host "🔗 Repository URL: https://github.com/$repoUrl" -ForegroundColor Green
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green 
