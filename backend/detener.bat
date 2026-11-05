@echo off
setlocal EnableExtensions

echo Deteniendo instancias del backend de beneficio-cafe...
echo.

rem Detiene unicamente procesos java de este proyecto:
rem   - la aplicacion: com.beneficio.backend.BackendApplication
rem   - el lanzador Maven: spring-boot:run dentro de beneficio-cafe\backend
rem No usa PIDs fijos ni mata cualquier proceso que use el puerto 8080.

powershell -NoProfile -ExecutionPolicy Bypass -Command "$procs = Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'java.exe' -and ( $_.CommandLine -like '*com.beneficio.backend.BackendApplication*' -or ( $_.CommandLine -like '*spring-boot:run*' -and $_.CommandLine -like '*beneficio-cafe*backend*' ) ) }; if (-not $procs) { Write-Host 'No hay ninguna instancia de este proyecto corriendo.'; exit 0 }; foreach ($p in $procs) { Write-Host ('Deteniendo PID ' + $p.ProcessId); Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue }; Start-Sleep -Seconds 3; $listen = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue; if ($listen) { Write-Host '[AVISO] El puerto 8080 sigue ocupado por otro proceso.' -ForegroundColor Yellow; exit 1 }; Write-Host '[OK] Backend detenido. Puerto 8080 libre.' -ForegroundColor Green; exit 0"

set "EXIT_CODE=%ERRORLEVEL%"
echo.
exit /b %EXIT_CODE%
