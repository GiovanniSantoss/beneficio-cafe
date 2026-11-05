# Configura DB_PASSWORD como variable de entorno del usuario de Windows.
#
# Uso:
#   powershell -ExecutionPolicy Bypass -File .\configurar-db-password.ps1
#
# La contrasena se escribe de forma oculta (no se muestra en pantalla),
# se guarda en el perfil del usuario y NO se escribe en ningun archivo
# del repositorio.

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "Configuracion de DB_PASSWORD para beneficio-cafe" -ForegroundColor Cyan
Write-Host "------------------------------------------------" -ForegroundColor DarkGray
Write-Host "La contrasena no se mostrara mientras la escribes."
Write-Host ""

$secure = Read-Host -Prompt "Contrasena del usuario postgres" -AsSecureString

$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
    $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
}
finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
}

if ([string]::IsNullOrWhiteSpace($plain)) {
    Write-Host ""
    Write-Host "[ERROR] La contrasena no puede estar vacia. No se modifico nada." -ForegroundColor Red
    exit 1
}

[Environment]::SetEnvironmentVariable("DB_PASSWORD", $plain, "User")
$plain = $null

Write-Host ""
Write-Host "[OK] DB_PASSWORD configurada para el usuario $env:USERNAME." -ForegroundColor Green
Write-Host ""
Write-Host "Siguientes pasos:"
Write-Host "  1. Ejecuta arrancar.bat (lee la variable automaticamente)."
Write-Host "  2. Si usas Maven desde una terminal abierta antes de este cambio,"
Write-Host "     cierra y vuelve a abrir la terminal."
Write-Host ""
Write-Host "La contrasena no se guardo en ningun archivo del proyecto." -ForegroundColor DarkGray
