@echo off
REM Django Server Restart Script
REM Use this after updating settings.py

echo.
echo 🔄 RESTARTING DJANGO SERVER
echo ===============================
echo.

REM Navigate to backend directory
cd /d "d:\Co-Founder\GoBarberly\Frontend\backend"

echo 📍 Current directory: %cd%
echo.

REM Check if virtual environment exists
if exist "venv\Scripts\activate.bat" (
    echo 🐍 Activating virtual environment...
    call venv\Scripts\activate.bat
) else (
    echo ⚠️  No virtual environment found, using system Python
)

echo.
echo 🔧 Updated Django Settings:
echo   ✅ Added localhost:8000 to ALLOWED_HOSTS
echo   ✅ Enabled CORS_ALLOW_ALL_ORIGINS for development
echo   ✅ Added additional CORS headers
echo.

echo 🚀 Starting Django development server...
echo 💡 Press Ctrl+C to stop the server
echo.

REM Start Django server
python manage.py runserver 0.0.0.0:8000

echo.
echo 👋 Django server stopped
pause