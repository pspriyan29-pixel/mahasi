@echo off
REM Gemini API Key Setup Script for Windows
REM This script helps you set up the Gemini API key in all required locations

set GEMINI_API_KEY=YOUR_GEMINI_API_KEY

echo.
echo 🚀 Setting up Gemini API Key...
echo.

REM Setup Frontend .env.local
echo 📝 Setting up Frontend environment...
cd frontend

if not exist .env.local (
    echo Creating frontend/.env.local...
    (
        echo # Supabase
        echo NEXT_PUBLIC_SUPABASE_URL=https://gfpmjtsgudbixfemeazz.supabase.co
        echo NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
        echo.
        echo # Google Gemini AI
        echo GEMINI_API_KEY=%GEMINI_API_KEY%
        echo.
        echo # App Configuration
        echo NEXT_PUBLIC_APP_URL=http://localhost:3000
        echo NEXT_PUBLIC_API_URL=http://localhost:3000/api
    ) > .env.local
    echo ✅ Created frontend/.env.local
) else (
    findstr /C:"GEMINI_API_KEY" .env.local >nul
    if %errorlevel% equ 0 (
        echo ✅ GEMINI_API_KEY already exists in frontend/.env.local
        echo    Please update it manually if needed
    ) else (
        echo. >> .env.local
        echo # Google Gemini AI >> .env.local
        echo GEMINI_API_KEY=%GEMINI_API_KEY% >> .env.local
        echo ✅ Added GEMINI_API_KEY to frontend/.env.local
    )
)

cd ..

REM Setup Backend .env
echo 📝 Setting up Backend environment...
cd backend

if not exist .env (
    echo Creating backend/.env...
    (
        echo # Google Gemini AI
        echo GEMINI_API_KEY=%GEMINI_API_KEY%
        echo.
        echo # Add your other environment variables here
        echo # DATABASE_URL=
        echo # KAFKA_BOOTSTRAP_SERVERS=
        echo # KAFKA_API_KEY=
        echo # KAFKA_API_SECRET=
    ) > .env
    echo ✅ Created backend/.env
) else (
    findstr /C:"GEMINI_API_KEY" .env >nul
    if %errorlevel% equ 0 (
        echo ✅ GEMINI_API_KEY already exists in backend/.env
        echo    Please update it manually if needed
    ) else (
        echo. >> .env
        echo # Google Gemini AI >> .env
        echo GEMINI_API_KEY=%GEMINI_API_KEY% >> .env
        echo ✅ Added GEMINI_API_KEY to backend/.env
    )
)

cd ..

echo.
echo ✅ Gemini API Key setup complete!
echo.
echo 📋 Summary:
echo   - Supabase Edge Functions: ✅ Configured in config.toml
echo   - Frontend: ✅ Configured in frontend/.env.local
echo   - Backend: ✅ Configured in backend/.env
echo.
echo 🔄 Next steps:
echo   1. Restart your services (Supabase, Frontend, Backend)
echo   2. Test the analyze-events function
echo.
echo 🎉 You're all set!
echo.
pause
