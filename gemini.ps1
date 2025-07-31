#!/usr/bin/env pwsh
# Gemini CLI PowerShell wrapper

# Check if gemini is available
if (Get-Command gemini -ErrorAction SilentlyContinue) {
    & gemini $args
} else {
    Write-Error "Gemini CLI is not installed or not in PATH. Please install it globally with: npm install -g ."
    exit 1
} 
