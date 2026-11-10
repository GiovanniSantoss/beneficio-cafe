-- =====================================================================
-- Cambio: recepcion.observaciones -> recepcion.calidad_cafe
-- Fecha: 2026-11-05
-- Idempotente: se puede ejecutar varias veces sin error.
-- =====================================================================

SET client_encoding = 'UTF8';

BEGIN;

-- 1. Tabla de respaldo
CREATE TABLE IF NOT EXISTS recepcion_observaciones_backup (
    id_recepcion BIGINT,
    observaciones TEXT,
    respaldado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 1b. Respaldar solo si la columna observaciones todavía existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'recepcion'
          AND column_name = 'observaciones'
    ) THEN
        INSERT INTO recepcion_observaciones_backup (id_recepcion, observaciones)
        SELECT r.id_recepcion, r.observaciones
        FROM recepcion r
        WHERE r.observaciones IS NOT NULL
          AND NOT EXISTS (
              SELECT 1
              FROM recepcion_observaciones_backup b
              WHERE b.id_recepcion = r.id_recepcion
          );
    END IF;
END $$;

-- 2. Renombrar solo si observaciones existe y calidad_cafe aún no
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'recepcion'
          AND column_name = 'observaciones'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'recepcion'
          AND column_name = 'calidad_cafe'
    ) THEN
        ALTER TABLE recepcion
            RENAME COLUMN observaciones TO calidad_cafe;
    END IF;
END $$;

-- 3. Asegurar columna (si no existiera)
ALTER TABLE recepcion
    ADD COLUMN IF NOT EXISTS calidad_cafe VARCHAR(10);

-- 4. Normalizar datos existentes
UPDATE recepcion
SET calidad_cafe = 'BUENA'
WHERE calidad_cafe IS NULL
   OR calidad_cafe NOT IN ('BUENA', 'BAJA');

-- 5. Tipo, default y nullability
ALTER TABLE recepcion
    ALTER COLUMN calidad_cafe TYPE VARCHAR(10);

ALTER TABLE recepcion
    ALTER COLUMN calidad_cafe SET DEFAULT 'BUENA';

ALTER TABLE recepcion
    ALTER COLUMN calidad_cafe SET NOT NULL;

-- 6. Restricción de valores permitidos
ALTER TABLE recepcion
    DROP CONSTRAINT IF EXISTS chk_recepcion_calidad_cafe;

ALTER TABLE recepcion
    ADD CONSTRAINT chk_recepcion_calidad_cafe
    CHECK (calidad_cafe IN ('BUENA', 'BAJA'));

COMMIT;
