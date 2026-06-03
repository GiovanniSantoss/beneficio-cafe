import { useState } from "react";

export default function TablaProcesos({ lotes, onProcesar }) {
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>ID Lote</th>
            <th>Productor</th>
            <th>Etapa Café</th>
            <th>Peso Actual</th>
            <th>Fecha Recepción</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {lotes.map((lote) => {
            const etapaCafe = lote.estadoCafe;
            const estado = lote.estado;

            return (
              <tr key={lote.idLote}>
                <td>{lote.idLote}</td>

                <td>
                  {lote.recepcion?.productor?.nombre}{" "}
                  {lote.recepcion?.productor?.apellido}
                </td>

                <td>
                  <span className={`estado ${etapaCafe?.toLowerCase()}`}>
                    {etapaCafe}
                  </span>
                </td>

                <td>{lote.pesoActual ?? "—"} kg</td>

                <td>
                  {lote.recepcion?.fechaHora
                    ? new Date(lote.recepcion.fechaHora).toLocaleDateString()
                    : "—"}
                </td>

                <td>
                  <span className={`estado ${estado?.toLowerCase()}`}>
                    {estado}
                  </span>
                </td>

                <td className="actions">
                  {etapaCafe !== "ORO" && (
                    <button
                      className="btn-primary"
                      onClick={() => onProcesar(lote)}
                    >
                      Procesar
                    </button>
                  )}

                  {etapaCafe === "ORO" && (
                    <button
                      className="btn-details"
                      onClick={() =>
                        setDetalleSeleccionado(
                          detalleSeleccionado?.idLote === lote.idLote
                            ? null
                            : lote,
                        )
                      }
                    >
                      {detalleSeleccionado?.idLote === lote.idLote
                        ? "Ocultar"
                        : "Ver más"}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {detalleSeleccionado && (
        <div className="detalle-overlay">
          <div className="detalle-card">
            <h2>Detalle del Lote</h2>

            <div className="detalle-grid">
              <div>
                <b>ID Lote</b>
                
                {detalleSeleccionado.idLote}
              </div>

              <div>
                <b>Recepción</b>
                
                {detalleSeleccionado.recepcion?.idRecepcion}
              </div>

              <div>
                <b>Productor</b>
                
                {detalleSeleccionado.recepcion?.productor?.nombre}{" "}
                {detalleSeleccionado.recepcion?.productor?.apellido}
              </div>

              <div>
                <b>Estado Actual</b>
                
                {detalleSeleccionado.estadoCafe}
              </div>

              <div>
                <b>Peso Actual</b>
                
                {detalleSeleccionado.pesoActual} kg
              </div>

              <div>
                <b>Fecha Recepción</b>

                {detalleSeleccionado.recepcion?.fechaHora
                  ? new Date(
                      detalleSeleccionado.recepcion.fechaHora,
                    ).toLocaleString()
                  : "—"}
              </div>

              <div className="full-width">
                <b>Observaciones</b>
                
                {detalleSeleccionado.recepcion?.observaciones || "—"}
              </div>
            </div>

            <button
              className="btn-cerrar-detalle"
              onClick={() => setDetalleSeleccionado(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
