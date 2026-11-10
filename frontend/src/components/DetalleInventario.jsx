const formatoKg = (valor) =>
  Number(valor ?? 0).toLocaleString("es-MX", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

const formatoFecha = (valor) => {
  if (!valor) return "—";
  return new Date(valor).toLocaleString("es-MX", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

const ESTADOS = {
  VENDIBLE: { clase: "vendible", texto: "Vendible" },
  EN_PROCESO: { clase: "en-proceso", texto: "En proceso" },
  AGOTADO: { clase: "agotado", texto: "Agotado" },
  CANCELADO: { clase: "cancelado", texto: "Cancelado" },
  SIN_INVENTARIO: { clase: "sin-inventario", texto: "Sin inventario" },
};

export default function DetalleInventario({ detalle, onCerrar }) {
  if (!detalle) return null;

  const { data, loading, error } = detalle;

  return (
    <div className="detalle-overlay" onClick={onCerrar}>
      <div
        className="detalle-card detalle-inventario"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="detalle-cabecera">
          <h2>Detalle de inventario — Lote {detalle.idLote}</h2>
          <button
            type="button"
            className="btn-cerrar-detalle"
            onClick={onCerrar}
          >
            Cerrar
          </button>
        </div>

        {loading && <p className="panel-vacio">Cargando detalle…</p>}

        {error && <p className="panel-vacio">{error}</p>}

        {data && (
          <>
            <div className="detalle-badges">
              <span
                className={`badge-etapa ${(data.inventario.estadoCafe ?? "").toLowerCase()}`}
              >
                {data.inventario.estadoCafe}
              </span>

              <span
                className={`badge-estado ${
                  (ESTADOS[data.inventario.estadoStock] ?? {}).clase ?? "agotado"
                }`}
              >
                {(ESTADOS[data.inventario.estadoStock] ?? {}).texto ??
                  data.inventario.estadoStock}
              </span>

              <span className="badge-neutral">{data.estadoLote}</span>
            </div>

            <div className="detalle-grid">
              <div>
                <b>Kg actuales</b>
                {formatoKg(data.inventario.stockActual)} kg
              </div>

              <div>
                <b>Ubicación</b>
                {data.inventario.ubicacion || "Sin ubicación"}
              </div>

              <div>
                <b>Última actualización</b>
                {formatoFecha(data.inventario.fechaActualizacion)}
              </div>

              <div>
                <b>Inventario activo</b>
                {data.inventario.activo ? "Sí" : "No"}
              </div>
            </div>

            <h3 className="detalle-subtitulo">Origen</h3>

            <div className="detalle-grid">
              <div>
                <b>Recepción</b>
                {data.inventario.recepcion
                  ? `#${data.inventario.recepcion.idRecepcion} · ${formatoFecha(
                      data.inventario.recepcion.fechaHora,
                    )}`
                  : "—"}
              </div>

              <div>
                <b>Peso inicial</b>
                {data.inventario.recepcion
                  ? `${formatoKg(data.inventario.recepcion.pesoInicial)} kg`
                  : "—"}
              </div>

              <div>
                <b>Productor</b>
                {data.inventario.productor
                  ? `${data.inventario.productor.nombre} ${
                      data.inventario.productor.apellido ?? ""
                    }`.trim()
                  : "—"}
              </div>

              <div>
                <b>Cafetal</b>
                {data.inventario.cafetal
                  ? `Parcela ${data.inventario.cafetal.numParcela} · ${data.inventario.cafetal.ubicacion}`
                  : "—"}
              </div>
            </div>

            <h3 className="detalle-subtitulo">Trazabilidad</h3>

            <ul className="linea-tiempo">
              <li>
                <span className="punto-linea" />
                <div>
                  <strong>RECEPCIÓN</strong>
                  <span>
                    {data.inventario.recepcion
                      ? `${formatoKg(data.inventario.recepcion.pesoInicial)} kg · ${formatoFecha(
                          data.inventario.recepcion.fechaHora,
                        )} · ${data.inventario.recepcion.estado}`
                      : "Sin recepción asociada"}
                  </span>
                </div>
              </li>

              {data.procesos.map((p) => (
                <li key={`proceso-${p.idProceso}`}>
                  <span className="punto-linea" />
                  <div>
                    <strong>{p.tipoProceso}</strong>
                    <span>
                      {formatoKg(p.pesoResultante)} kg · {formatoFecha(p.fecha)}
                      {p.empleado ? ` · ${p.empleado}` : ""}
                    </span>
                  </div>
                </li>
              ))}

              {data.ventas.map((v) => (
                <li key={`venta-${v.idVenta}`}>
                  <span className="punto-linea punto-venta" />
                  <div>
                    <strong>Venta · {v.comprador ?? "Comprador"}</strong>
                    <span>
                      {formatoKg(v.cantidadVendida)} kg · {formatoFecha(v.fechaVenta)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            {data.ventas.length === 0 && (
              <p className="panel-vacio">Sin ventas registradas.</p>
            )}

            {data.alertas.length > 0 && (
              <>
                <h3 className="detalle-subtitulo">Alertas</h3>
                <ul className="alertas-lista">
                  {data.alertas.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
