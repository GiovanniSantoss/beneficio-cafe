const formatoKg = (valor) =>
  Number(valor ?? 0).toLocaleString("es-MX", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

export default function ResumenInventario({ resumen }) {
  if (!resumen) return null;

  const etapas = resumen.kgPorEtapa ?? {};
  const total = Number(resumen.kgTotales ?? 0);

  const porcentaje = (valor) =>
    total > 0 ? Math.round((Number(valor ?? 0) / total) * 100) : 0;

  const tarjetas = [
    {
      clase: "total",
      titulo: "Kg totales",
      valor: resumen.kgTotales,
      detalle: `${resumen.lotesTotales} lotes registrados`,
    },
    {
      clase: "cereza",
      titulo: "Cereza",
      valor: etapas.CEREZA,
      detalle: `${porcentaje(etapas.CEREZA)}% del total`,
    },
    {
      clase: "pergamino",
      titulo: "Pergamino",
      valor: etapas.PERGAMINO,
      detalle: `${porcentaje(etapas.PERGAMINO)}% del total`,
    },
    {
      clase: "oro",
      titulo: "Oro",
      valor: etapas.ORO,
      detalle: `${resumen.lotesOroVendibles} lotes vendibles`,
    },
  ];

  return (
    <div className="kpi-grid">
      {tarjetas.map((t) => (
        <div key={t.clase} className={`kpi-card ${t.clase}`}>
          <span className="kpi-titulo">{t.titulo}</span>
          <strong className="kpi-valor">
            {formatoKg(t.valor)} <small>kg</small>
          </strong>
          <span className="kpi-detalle">{t.detalle}</span>
        </div>
      ))}
    </div>
  );
}
