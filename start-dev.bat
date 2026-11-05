@echo off
setlocal

:: Switch to the directory where this script is located
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

echo [INFO] Verifying project structure...

if not exist "package.json" (
    echo [ERROR] package.json not found. Are you in the project root?
    pause
    exit /b 1
)

if not exist "src-tauri\" (
    echo [ERROR] src-tauri\ directory not found. Are you in the project root?
    pause
    exit /b 1
)

echo [INFO] Checking for npm...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js / npm not found.
    pause
    exit /b 1
)

echo [SUCCESS] Environment verified.
echo.
echo ==================================
echo Character Recipe Studio (Dev)
echo Running npm run tauri dev...
echo ==================================
echo.

npm run tauri dev
