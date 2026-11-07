@echo off
echo ===================================================
echo   MEDICARE - Hospital Management System Launcher
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/3] Ensuring backend dependencies and database...
if not exist "backend\venv" (
    echo Creating Python virtual environment...
    python -m venv backend\venv
    call backend\venv\Scripts\activate.bat
    pip install -r backend\requirements.txt
) else (
    call backend\venv\Scripts\activate.bat
)

echo [2/3] Checking database seed data...
python backend\seed.py

echo [3/3] Launching Backend and Frontend servers...
echo Starting Flask backend on http://localhost:5000...
start "MEDICARE Backend API" cmd /k "call backend\venv\Scripts\activate.bat && python backend\run.py"

echo Starting React Frontend on http://localhost:3000...
cd frontend
if not exist "node_modules" (
    echo Installing npm dependencies...
    npm install
)
start "MEDICARE Frontend App" cmd /k "npm run dev"

echo.
echo ===================================================
echo   MEDICARE System is running!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo   Admin Login: admin / admin123
echo ===================================================
pause

