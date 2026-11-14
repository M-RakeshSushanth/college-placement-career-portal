@echo off
echo ===================================================================
echo  Starting College Placement & Career Management Portal Ecosystem
echo ===================================================================

echo [1/3] Starting FastAPI AI Microservice (Port 8000)...
start "CPCM AI Service (FastAPI)" cmd /k "cd /d "%~dp0ai-service" && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Node.js Express Backend & Socket.IO (Port 5000)...
start "CPCM Backend (Node.js/Express)" cmd /k "cd /d "%~dp0backend" && npm start"

timeout /t 3 /nobreak >nul

echo [3/3] Starting React.js Vite Frontend (Port 5173)...
start "CPCM Frontend (React/Vite)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo ===================================================================
echo  All 3 services are launching!
echo  Frontend URL: http://localhost:5173
echo  Backend API:  http://localhost:5000
echo  AI Service:   http://localhost:8000
echo ===================================================================
pause
