@echo off
echo Starting Backend and Frontend...
cd /d "%~dp0"
start "Backend" cmd /k "call venv\Scripts\activate.bat && python sdr_backend_service.py"
timeout /t 2 /nobreak >nul
start "Frontend" cmd /k "npm run dev"
echo.
echo Backend and Frontend started in separate windows.
echo Close the windows to stop the services.
pause

