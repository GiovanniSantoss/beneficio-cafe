/**
 * Filtro tipo píldora (segmented control) con indicador deslizante.
 *
 * Reutiliza las clases existentes `.filtro-estado` de styles/buttons.css.
 *
 * Dos modos:
 *
 * 1) Modo clásico (por defecto): el indicador se posiciona con la clase
 *    dinámica `estado-{VALOR}`. Cada conjunto de 3 opciones necesita sus
 *    reglas CSS ::before asociadas (Productores, Cafetales, Recepciones).
 *
 * 2) Modo `dinamico`: el indicador se calcula con las variables CSS
 *    `--i` (índice de la opción activa) y `--cols` (número de opciones),
 *    así que funciona con cualquier cantidad de opciones y cualquier
 *    nombre de estado, sin reglas CSS por estado. Se usa en Procesos.
 *
 * NO se usa en Productores ni Cafetales: esos módulos conservan su propio
 * markup inline sin cambios.
 */
export default function FiltroEstado({
  valor,
  onChange,
  opciones,
  dinamico = false,
}) {
  const indice = opciones.findIndex((op) => op.valor === valor);

  const clase = dinamico
    ? "filtro-estado filtro-dinamico"
    : `filtro-estado estado-${valor}`;

  const estilo = dinamico
    ? {
        "--i": indice < 0 ? 0 : indice,
        "--cols": Math.max(opciones.length, 1),
      }
    : undefined;

  return (
    <div className={clase} style={estilo}>
      {opciones.map((op) => (
        <label key={op.valor}>
          <input
            type="radio"
            value={op.valor}
            checked={valor === op.valor}
            onChange={(e) => onChange(e.target.value)}
          />
          <span>{op.etiqueta}</span>
        </label>
      ))}
    </div>
  );
}
