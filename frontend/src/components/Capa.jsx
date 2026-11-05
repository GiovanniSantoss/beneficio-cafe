/**
 * Capa numerada de contenido.
 *
 * Cada capa es una superficie independiente con su propio encabezado
 * (número, título, subtítulo y acciones) y su cuerpo. Se apilan en vertical
 * para dar la lectura "01", "02", ... sin depender del header global.
 */
export default function Capa({
  numero,
  titulo,
  subtitulo,
  acciones,
  flush = false,
  children,
}) {
  return (
    <section className="capa">
      <header className="capa-header">
        {numero && (
          <span className="capa-numero" aria-hidden="true">
            {numero}
          </span>
        )}

        <div className="capa-titulos">
          <h2 className="capa-titulo">{titulo}</h2>
          {subtitulo && <p className="capa-subtitulo">{subtitulo}</p>}
        </div>

        {acciones && <div className="capa-acciones">{acciones}</div>}
      </header>

      <div className={`capa-cuerpo${flush ? " capa-cuerpo--flush" : ""}`}>
        {children}
      </div>
    </section>
  );
}
