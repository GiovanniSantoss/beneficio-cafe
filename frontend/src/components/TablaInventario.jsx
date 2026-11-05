const formatoKg = (valor) =>
  Number(valor ?? 0).toLocaleString("es-MX", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

const formatoFecha = (valor) => {
  if (!valor) return "—";

  const fecha = new Date(valor);

  const dia = fecha.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });

  const hora = fecha.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${dia} ${hora}`;
};

const ESTADOS = {
  VENDIBLE: { clase: "vendible", texto: "Vendible" },
  EN_PROCESO: { clase: "en-proceso", texto: "En proceso" },
  AGOTADO: { clase: "agotado", texto: "Agotado" },
  CANCELADO: { clase: "cancelado", texto: "Cancelado" },
  SIN_INVENTARIO: { clase: "sin-inventario", texto: "Sin inventario" },
};

export default function TablaInventario({ items, onVerDetalle }) {
  if (!items || items.length === 0) {
    return (
      <div className="table-container tabla-inventario">
        <p className="tabla-vacia">
          No hay lotes que coincidan con los filtros seleccionados.
        </p>
      </div>
    );
  }

  return (
    <div className="table-container tabla-inventario">
      <table>
        <thead>
          <tr>
            <th>Lote</th>
            <th>Productor</th>
            <th>Cafetal</th>
            <th>Etapa</th>
            <th>Kg</th>
            <th>Ubicación</th>
            <th>Estado</th>
            <th>Actualización</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => {
            const estado = ESTADOS[item.estadoStock] ?? {
              clase: "agotado",
              texto: item.estadoStock,
            };

            return (
              <tr key={item.idLote}>
                <td>{item.idLote}</td>

                <td>
                  {item.productor
                    ? `${item.productor.nombre} ${item.productor.apellido ?? ""}`.trim()
                    : "—"}
                </td>

                <td>
                  {item.cafetal
                    ? `Parcela ${item.cafetal.numParcela} · ${item.cafetal.ubicacion}`
                    : "—"}
                </td>

                <td>
                  <span
                    className={`badge-etapa ${(item.estadoCafe ?? "").toLowerCase()}`}
                  >
                    {item.estadoCafe}
                  </span>
                </td>

                <td>{formatoKg(item.stockActual)}</td>

                <td>{item.ubicacion || "Sin ubicación"}</td>

                <td>
                  <span className={`badge-estado ${estado.clase}`}>
                    {estado.texto}
                  </span>
                </td>

                <td>{formatoFecha(item.fechaActualizacion)}</td>

                <td className="actions">
                  <button
                    className="btn-details"
                    onClick={() => onVerDetalle(item.idLote)}
                  >
                    Ver detalle
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
