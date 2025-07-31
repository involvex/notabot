# Notabot CLI GitHub Repository Initialization Script (PowerShell)
# This script helps set up a new GitHub repository for the notabot-cli project

param(
    [string]$RepoName = "notabot-cli",
    [string]$Description = "Enhanced command-line interface built on top of Gemini CLI",
    [string]$Visibility = "public"
)

Write-Host "🚀 Initializing GitHub Repository for Notabot CLI" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

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

# Get repository name
$repoName = Read-Host "Enter the repository name (default: $RepoName)"
if ([string]::IsNullOrWhiteSpace($repoName)) {
    $repoName = $RepoName
}

# Get repository description
$description = Read-Host "Enter repository description (default: $Description)"
if ([string]::IsNullOrWhiteSpace($description)) {
    $description = $Description
}

# Get repository visibility
$isPublic = Read-Host "Should the repository be public? (y/n, default: y)"
if ([string]::IsNullOrWhiteSpace($isPublic)) {
    $isPublic = "y"
}

if ($isPublic -eq "y" -or $isPublic -eq "Y") {
    $visibility = "public"
} else {
    $visibility = "private"
}

Write-Host ""
Write-Host "📋 Repository Configuration:" -ForegroundColor Cyan
Write-Host "  Name: $repoName" -ForegroundColor White
Write-Host "  Description: $description" -ForegroundColor White
Write-Host "  Visibility: $visibility" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Continue with these settings? (y/n)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "❌ Aborted." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔧 Creating GitHub repository..." -ForegroundColor Yellow

# Create the repository
gh repo create $repoName `
    --description $description `
    --$visibility `
    --source=. `
    --remote=origin `
    --push

Write-Host ""
Write-Host "✅ Repository created successfully!" -ForegroundColor Green
Write-Host ""

# Add topics to the repository
Write-Host "🏷️ Adding repository topics..." -ForegroundColor Yellow
gh repo edit $repoName --add-topic cli,gemini,notabot,typescript,nodejs,developer-tools

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
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Update the repository URL in NOTABOT_README.md" -ForegroundColor White
Write-Host "  2. Review and update documentation" -ForegroundColor White
Write-Host "  3. Set up GitHub Actions (if needed)" -ForegroundColor White
Write-Host "  4. Configure branch protection rules" -ForegroundColor White
Write-Host "  5. Set up issue templates" -ForegroundColor White
Write-Host ""

# Get repository URL
$repoUrl = gh repo view --json owner,name -q '.owner.login + "/" + .name'
Write-Host "🔗 Repository URL: https://github.com/$repoUrl" -ForegroundColor Green
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green 
