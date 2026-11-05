# Integración de cambios - beneficio-cafe

Rama de integración: `desarrollo` (remoto: `origin/desarrollo`)

## Para quien publica (yo)

```powershell
git checkout desarrollo
git add -A
git commit -m "feat: <descripcion del cambio>"
git push origin desarrollo
```

## Para descargar los cambios (compañero)

### Opción A (recomendada): Stash + Pull + Pop

Si tienes cambios locales sin commitear, úsala para no perderlos:

```powershell
cd C:\Users\<usuario>\beneficio-cafe
git checkout desarrollo
git add -A
git stash push -u -m "cambios-locales-companero"
git fetch origin
git pull origin desarrollo
git stash pop
```

- `git stash push -u` guarda incluso archivos nuevos / no trackeados.
- `git pull origin desarrollo` descarga e integra los cambios publicados.
- `git stash pop` vuelve a poner tus cambios encima.

Si `stash pop` marca conflictos:

```powershell
git status
# resolver los archivos marcados en conflicto
git add -A
git commit -m "Integracion de cambios locales con desarrollo"
```

Si `stash pop` falla y quieres aplicar a mano:

```powershell
git stash show -p > ..\mis-cambios.patch
git stash drop
# resolver manualmente o: git apply --3way ..\mis-cambios.patch
```

### Opción B: Commit local + Merge

Si ya quieres dejar tus cambios en el historial:

```powershell
cd C:\Users\<usuario>\beneficio-cafe
git checkout desarrollo
git add -A
git commit -m "Cambios locales del companero"
git fetch origin
git merge origin/desarrollo
# resolver conflictos si aparecen, luego:
git add -A
git commit -m "Integracion con desarrollo"
```

## Verificación de sensibles (antes de subir)

```powershell
git ls-files | Select-String -Pattern "application\.properties$|\.env$|\.pem$|\.key$"
```

Debe salir vacío. Si aparece `application.properties`:

```powershell
git rm --cached backend/src/main/resources/application.properties
```

El archivo real queda en local (ignorado por `.gitignore`) y en el repo solo se versiona
`backend/src/main/resources/application.properties.example` con placeholders.

> Nota: `application.properties` ya había sido subido antes con credenciales
> (historial de git). Por seguridad cambia la contraseña de la BD si el repo es público.
> Quitarlo del historial requiere reescribir git (filter-repo) y coordinarlo con el equipo.

## Verificación tras integrar

```powershell
git log --oneline -10
git status
# build del backend / frontend segun el cambio
```
