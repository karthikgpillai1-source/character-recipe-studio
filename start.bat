@echo off
setlocal

:: Switch to the directory where this script is located
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

set "EXE_PATH=src-tauri\target\release\characterrecipestudio.exe"

echo [INFO] Checking for release executable...

if not exist "%EXE_PATH%" (
    echo [ERROR] Release executable not found.
    echo.
    echo Please run:
    echo npm run tauri build
    echo.
    pause
    exit /b 1
)

echo [SUCCESS] Executable found.
echo.
echo ==================================
echo Character Recipe Studio
echo Starting...
echo ==================================

start "" "%EXE_PATH%"
