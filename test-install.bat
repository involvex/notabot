@echo off
echo 🔧 Testing NotABot Global Installation...
echo.

echo ✅ Checking if notabot is installed globally...
npm list -g notabot

echo.
echo ✅ Installing notabot globally...
npm install -g . --force

echo.
echo ✅ Running setup...
npm run setup

echo.
echo ✅ Testing notabot command...
notabot --help

echo.
echo 🎉 Installation test completed!
pause 
