@echo off
echo Setting up Notabot CLI...
echo.

if "%1"=="" (
    echo Usage: setup-notabot.bat YOUR_API_KEY [theme]
    echo Example: setup-notabot.bat AIzaSyC... default
    exit /b 1
)

set API_KEY=%1
set THEME=%2
if "%THEME%"=="" set THEME=default

echo Creating .gemini directory...
if not exist "%USERPROFILE%\.gemini" mkdir "%USERPROFILE%\.gemini"

echo Creating settings.json...
echo {> "%USERPROFILE%\.gemini\settings.json"
echo   "selectedAuthType": "gemini-api-key",>> "%USERPROFILE%\.gemini\settings.json"
echo   "geminiApiKey": "%API_KEY%",>> "%USERPROFILE%\.gemini\settings.json"
echo   "theme": "%THEME%",>> "%USERPROFILE%\.gemini\settings.json"
echo   "editor": "not_set">> "%USERPROFILE%\.gemini\settings.json"
echo }>> "%USERPROFILE%\.gemini\settings.json"

echo Setting environment variable...
set GEMINI_API_KEY=%API_KEY%

echo.
echo ✅ Setup complete! Notabot is now configured to work from any directory.
echo.
echo Usage examples:
echo   notabot-full                    # Interactive mode
echo   notabot-full -p "Hello world"   # Non-interactive mode
echo   notabot-full --theme dracula    # With custom theme
echo.
echo Settings saved to: %USERPROFILE%\.gemini\settings.json 
