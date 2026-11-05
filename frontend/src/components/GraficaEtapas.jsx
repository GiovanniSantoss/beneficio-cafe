const SEGMENTOS = [
  { clave: "CEREZA", etiqueta: "Cereza", color: "#b23a48" },
  { clave: "PERGAMINO", etiqueta: "Pergamino", color: "#d98c1f" },
  { clave: "ORO", etiqueta: "Oro", color: "#2e7d32" },
];

const formatoKg = (valor) =>
  Number(valor ?? 0).toLocaleString("es-MX", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

export default function GraficaEtapas({ kgPorEtapa }) {
  const etapas = kgPorEtapa ?? {};
  const total = SEGMENTOS.reduce(
    (acc, s) => acc + Number(etapas[s.clave] ?? 0),
    0,
  );

  const partes = SEGMENTOS.map((s, i) => {
    const valor = Number(etapas[s.clave] ?? 0);
    const porcentaje = total > 0 ? (valor / total) * 100 : 0;
    const inicio = SEGMENTOS.slice(0, i).reduce(
      (acc, prev) =>
        acc +
        (total > 0 ? (Number(etapas[prev.clave] ?? 0) / total) * 100 : 0),
      0,
    );
    return { ...s, valor, porcentaje, inicio };
  });

  const gradiente =
    total > 0
      ? `conic-gradient(${partes
          .filter((p) => p.porcentaje > 0)
          .map((p) => `${p.color} ${p.inicio}% ${p.inicio + p.porcentaje}%`)
          .join(", ")})`
      : "conic-gradient(#e2e8f0 0% 100%)";

  return (
    <section className="subseccion">
      <h3 className="subseccion-titulo">Distribución por etapa</h3>

      <div className="grafica-etapas">
        <div className="donut" style={{ background: gradiente }}>
          <div className="donut-centro">
            <strong>{formatoKg(total)}</strong>
            <span>kg</span>
          </div>
        </div>

        <ul className="donut-leyenda">
          {partes.map((p) => (
            <li key={p.clave}>
              <span className="punto" style={{ background: p.color }} />
              <span className="leyenda-nombre">{p.etiqueta}</span>
              <span className="leyenda-porcentaje">
                {p.porcentaje.toFixed(0)}%
              </span>
              <span className="leyenda-kg">{formatoKg(p.valor)} kg</span>
            </li>
          ))}
        </ul>
      </div>

      {total === 0 && (
        <p className="panel-vacio">Sin existencias registradas.</p>
      )}
    </section>
  );
}
