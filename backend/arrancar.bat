@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo ============================================
echo  Beneficio de Cafe - Backend
echo ============================================
echo.

rem --- 1. Verificar que el puerto 8080 este libre ---
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue) { exit 1 } else { exit 0 }"
if errorlevel 1 (
    echo [ERROR] El puerto 8080 ya esta ocupado.
    powershell -NoProfile -Command "$c = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1; if ($c) { $p = Get-Process -Id $c.OwningProcess -ErrorAction SilentlyContinue; Write-Host ('  PID ' + $c.OwningProcess + ' - ' + $p.ProcessName) }"
    echo.
    echo Si es una instancia de este proyecto, ejecuta detener.bat.
    echo No se inicio una segunda instancia.
    exit /b 1
)

rem --- 2. Verificar DB_PASSWORD ---
rem Si no esta en esta sesion, se lee del entorno del usuario de Windows.
if not defined DB_PASSWORD (
    for /f "usebackq delims=" %%P in (`powershell -NoProfile -Command "[Environment]::GetEnvironmentVariable('DB_PASSWORD','User')"`) do set "DB_PASSWORD=%%P"
)

if not defined DB_PASSWORD (
    echo [ERROR] No esta definida la variable DB_PASSWORD.
    echo.
    echo Configurala una sola vez con:
    echo    powershell -ExecutionPolicy Bypass -File "%~dp0configurar-db-password.ps1"
    echo.
    echo No se inicio el backend.
    exit /b 1
)

rem --- 3. Arrancar ---
echo Iniciando backend en http://localhost:8080 ...
echo Ctrl + C para detener.
echo.
call mvnw.cmd spring-boot:run
set "EXIT_CODE=%ERRORLEVEL%"

if not "%EXIT_CODE%"=="0" (
    echo.
    echo [ERROR] El backend termino con codigo %EXIT_CODE%.
    echo Revisa los mensajes anteriores. Causas comunes:
    echo   - Contrasena de PostgreSQL incorrecta: ejecuta configurar-db-password.ps1
    echo   - PostgreSQL detenido: Get-Service postgresql-x64-17
    echo   - Puerto 8080 ocupado por otro proceso
)

exit /b %EXIT_CODE%
