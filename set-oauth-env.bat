@echo off
echo 🔧 Setting up OAuth environment variables for NotABot...

REM Set environment variables
set GOOGLE_CLIENT_ID=57386476101-ndu1bfbj7us90j0kvc77ph8v6fe78f4g.apps.googleusercontent.com
set GOOGLE_CLIENT_SECRET=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

echo ✅ OAuth credentials set:
echo    Client ID: %GOOGLE_CLIENT_ID%
echo    Client Secret: %GOOGLE_CLIENT_SECRET%

echo.
echo 🎯 Next steps:
echo 1. Start NotABot: notabot
echo 2. Login with OAuth: /login
echo 3. Test authentication

echo.
echo 📝 Note: These environment variables are set for this session only.
echo    For permanent setup, add them to your system environment variables.

pause 