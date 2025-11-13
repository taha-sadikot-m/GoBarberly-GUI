@echo off
REM Direct Password Reset Tool
REM Quick launcher for the Python password reset scripts

echo.
echo ===============================================
echo  GOBARBERLY PASSWORD RESET TOOLS
echo ===============================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo 💡 Please install Python 3.7+ to use these tools
    pause
    exit /b 1
)

echo 🐍 Python is available
echo.

:MENU
echo Choose an option:
echo.
echo 1. 🔐 Direct Password Reset (with email verification)
echo 2. 🔧 Admin Password Reset (bypass email)
echo 3. 📊 Test Backend Connectivity
echo 4. ❌ Exit
echo.

set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto DIRECT_RESET
if "%choice%"=="2" goto ADMIN_RESET
if "%choice%"=="3" goto TEST_CONNECTIVITY
if "%choice%"=="4" goto EXIT
goto INVALID_CHOICE

:DIRECT_RESET
echo.
echo 🔐 Starting Direct Password Reset...
echo.
python direct_password_reset.py
echo.
echo Press any key to return to menu...
pause >nul
goto MENU

:ADMIN_RESET
echo.
echo 🔧 Starting Admin Password Reset...
echo.
python admin_password_reset.py
echo.
echo Press any key to return to menu...
pause >nul
goto MENU

:TEST_CONNECTIVITY
echo.
echo 📊 Testing Backend Connectivity...
echo.
python -c "
import requests
import time
try:
    start = time.time()
    response = requests.get('https://gobarberly-backend.onrender.com/api/auth/forgot-password/', timeout=30)
    duration = (time.time() - start) * 1000
    print(f'✅ Backend reachable - Response time: {duration:.0f}ms')
    print(f'📊 Status: {response.status_code}')
except Exception as e:
    print(f'❌ Backend unreachable: {str(e)}')
"
echo.
echo Press any key to return to menu...
pause >nul
goto MENU

:INVALID_CHOICE
echo.
echo ❌ Invalid choice. Please select 1, 2, 3, or 4.
echo.
goto MENU

:EXIT
echo.
echo 👋 Goodbye!
exit /b 0