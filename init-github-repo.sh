#!/bin/bash

# Notabot CLI GitHub Repository Initialization Script
# This script helps set up a new GitHub repository for the notabot-cli project

set -e

echo "🚀 Initializing GitHub Repository for Notabot CLI"
echo "=================================================="

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install git first."
    exit 1
fi

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed. Please install it first."
    echo "Visit: https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated with GitHub
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub. Please run 'gh auth login' first."
    exit 1
fi

# Get repository name
read -p "Enter the repository name (default: notabot-cli): " REPO_NAME
REPO_NAME=${REPO_NAME:-notabot-cli}

# Get repository description
read -p "Enter repository description: " REPO_DESCRIPTION
REPO_DESCRIPTION=${REPO_DESCRIPTION:-"Enhanced command-line interface built on top of Gemini CLI"}

# Get repository visibility
read -p "Should the repository be public? (y/n, default: y): " IS_PUBLIC
IS_PUBLIC=${IS_PUBLIC:-y}

if [[ $IS_PUBLIC == "y" || $IS_PUBLIC == "Y" ]]; then
    VISIBILITY="public"
else
    VISIBILITY="private"
fi

echo ""
echo "📋 Repository Configuration:"
echo "  Name: $REPO_NAME"
echo "  Description: $REPO_DESCRIPTION"
echo "  Visibility: $VISIBILITY"
echo ""

read -p "Continue with these settings? (y/n): " CONFIRM
if [[ $CONFIRM != "y" && $CONFIRM != "Y" ]]; then
    echo "❌ Aborted."
    exit 1
fi

echo ""
echo "🔧 Creating GitHub repository..."

# Create the repository
gh repo create "$REPO_NAME" \
    --description "$REPO_DESCRIPTION" \
    --$VISIBILITY \
    --source=. \
    --remote=origin \
    --push

echo ""
echo "✅ Repository created successfully!"
echo ""

# Add topics to the repository
echo "🏷️ Adding repository topics..."
gh repo edit "$REPO_NAME" --add-topic cli,gemini,notabot,typescript,nodejs,developer-tools

# Create initial release
echo "📦 Creating initial release..."
git tag -a v0.1.0 -m "Initial release"
git push origin v0.1.0

# Create GitHub release
gh release create v0.1.0 \
    --title "Initial Release" \
    --notes "Initial release of Notabot CLI

## Features
- Global installation as 'notabot-full'
- Enhanced tools and commands
- Custom themes and UI
- Web server integration
- Image enhancement capabilities

## Installation
\`\`\`bash
npm install -g .
notabot-full --help
\`\`\`"

echo ""
echo "🎉 Repository setup complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Update the repository URL in NOTABOT_README.md"
echo "  2. Review and update documentation"
echo "  3. Set up GitHub Actions (if needed)"
echo "  4. Configure branch protection rules"
echo "  5. Set up issue templates"
echo ""
echo "🔗 Repository URL: https://github.com/$(gh repo view --json owner,name -q '.owner.login + "/" + .name')"
echo ""
echo "Happy coding! 🚀" 
