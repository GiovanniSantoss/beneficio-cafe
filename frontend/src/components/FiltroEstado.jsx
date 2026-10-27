/**
 * Filtro tipo píldora (segmented control) con indicador deslizante.
 *
 * Reutiliza las clases existentes `.filtro-estado` de styles/buttons.css.
 * El indicador se posiciona con la clase dinámica `estado-{VALOR}`, por lo
 * que cada conjunto de opciones necesita sus reglas CSS ::before asociadas.
 *
 * NO se usa en Productores ni Cafetales: esos módulos conservan su propio
 * markup inline sin cambios. Se usa en Recepciones y Procesos.
 */
export default function FiltroEstado({ valor, onChange, opciones }) {
  return (
    <div className={`filtro-estado estado-${valor}`}>
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
