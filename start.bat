@echo off
cd /d "%~dp0"
echo Starting the portfolio at http://localhost:8000  (close this window to stop)
start "" http://localhost:8000
py -m http.server 8000 2>nul || python -m http.server 8000
