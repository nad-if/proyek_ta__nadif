@echo off
echo Starting Backend Service...
cd /d "%~dp0"
call venv\Scripts\activate.bat
python sdr_backend_service.py
pause

