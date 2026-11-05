-- =====================================================================
-- Inventario inicial: correccion del lote 77 y backfill de existencias
-- Fecha: 2026-10-27
-- Idempotente: se puede ejecutar mas de una vez sin duplicar filas.
-- =====================================================================

SET client_encoding = 'UTF8';

BEGIN;

-- 1. Lote 77: su recepcion (124) esta CANCELADA.
--    Se conserva el historial (peso_actual 180 y procesos 20/21),
--    pero el lote queda cancelado y su inventario en cero e inactivo.
UPDATE lote
SET estado = 'CANCELADO',
    activo = false
WHERE id_lote = 77;

INSERT INTO inventario (id_lote, stock_actual, ubicacion, activo, fecha_actualizacion)
VALUES (77, 0, NULL, false, CURRENT_TIMESTAMP)
ON CONFLICT (id_lote) DO UPDATE
SET stock_actual = 0,
    activo = false,
    fecha_actualizacion = CURRENT_TIMESTAMP;

-- 2. Backfill: una fila de inventario por cada lote activo
--    cuya recepcion no este cancelada. Stock = peso actual del lote.
INSERT INTO inventario (id_lote, stock_actual, ubicacion, activo, fecha_actualizacion)
SELECT l.id_lote, l.peso_actual, 'Almacén principal', true, CURRENT_TIMESTAMP
FROM lote l
JOIN recepcion r ON r.id_recepcion = l.id_recepcion
WHERE r.estado <> 'CANCELADA'
  AND l.activo = true
ON CONFLICT (id_lote) DO NOTHING;

-- 3. Integridad: el stock nunca puede ser negativo.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_inventario_stock'
    ) THEN
        ALTER TABLE inventario
            ADD CONSTRAINT chk_inventario_stock CHECK (stock_actual >= 0);
    END IF;
END $$;

COMMIT;

-- =====================================================================
-- Verificacion posterior
-- =====================================================================
-- SELECT l.id_lote, l.estado_cafe, l.estado, l.activo, l.peso_actual,
--        i.stock_actual, i.ubicacion, i.activo AS inventario_activo
-- FROM lote l
-- LEFT JOIN inventario i ON i.id_lote = l.id_lote
-- ORDER BY l.id_lote;
