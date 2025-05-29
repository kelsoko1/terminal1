@echo off
echo ===================================
echo Terminal 1 Production Deployment
echo ===================================
echo.

:: Set environment to production
set NODE_ENV=production

echo Installing production dependencies...
call npm ci --production
if %ERRORLEVEL% neq 0 (
  echo Error installing dependencies
  exit /b %ERRORLEVEL%
)

echo Generating Prisma client...
call npx prisma generate
if %ERRORLEVEL% neq 0 (
  echo Error generating Prisma client
  exit /b %ERRORLEVEL%
)

echo Running database migrations...
call npx prisma migrate deploy
if %ERRORLEVEL% neq 0 (
  echo Error running migrations
  exit /b %ERRORLEVEL%
)

echo Building Next.js application...
call npm run build
if %ERRORLEVEL% neq 0 (
  echo Error building application
  exit /b %ERRORLEVEL%
)

echo Checking if PM2 is installed...
where pm2 >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo Installing PM2 globally...
  call npm install -g pm2
  if %ERRORLEVEL% neq 0 (
    echo Error installing PM2
    exit /b %ERRORLEVEL%
  )
)

echo Starting application with PM2...
call pm2 list | findstr "nextjs-app" >nul
if %ERRORLEVEL% equ 0 (
  echo Restarting application with PM2...
  call npm run pm2:restart
) else (
  echo Starting application with PM2...
  call npm run pm2:start
)

echo.
echo ===================================
echo Deployment completed successfully!
echo The application is now running in production mode.
echo.
echo To view logs: npm run pm2:logs
echo To monitor: npm run pm2:monit
echo ===================================
