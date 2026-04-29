import { useState } from "react";
import React from "react";

export default function TablaRecepciones({ recepciones, onFinalizar }) {

  const [filaAbierta, setFilaAbierta] = useState(null);

  const toggleDetalles = (id) => {
    setFilaAbierta(filaAbierta === id ? null : id);
  };

  return (
    <div className="table-container">

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Productor</th>
            <th>Cafetal</th>
            <th>Inicial</th>
            <th>Final</th>
            <th>Empleado</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>

          {recepciones.map((r) => {

            const estado = r.pesoFinal ? "COMPLETA" : "PENDIENTE";

            return (
              <React.Fragment key={r.idRecepcion}>
                <tr>

                  <td>{r.idRecepcion}</td>

                  <td>
                    {r.productor?.nombre} {r.productor?.apellido}
                  </td>

                  <td>
                    {r.cafetal?.numParcela || r.cafetal?.ubicacion}
                  </td>

                  <td>{r.pesoInicial}</td>

                  <td>{r.pesoFinal ?? "—"}</td>

                  <td>{r.empleado?.nombre || "—"}</td>

                  <td>
                    {r.fechaHora
                      ? new Date(r.fechaHora).toLocaleString()
                      : "—"}
                  </td>

                  <td>
                    <span className={
                      estado === "COMPLETA"
                        ? "status-activo"
                        : "status-pendiente"
                    }>
                      {estado}
                    </span>
                  </td>

                  <td className="actions">

                    {!r.pesoFinal ? (
                      <button
                        className="btn-primary"
                        onClick={() => onFinalizar(r)}
                      >
                        Finalizar
                      </button>
                    ) : (
                      <button
                        className="btn-details"
                        onClick={() => toggleDetalles(r.idRecepcion)}
                      >
                        Ver
                      </button>
                    )}

                  </td>

                </tr>

                {filaAbierta === r.idRecepcion && (
                  <tr className="detalle-fila">
                    <td colSpan="9">
                      <div className="detalle-card">

                        <h3>Detalle Recepción</h3>

                        <p><b>Observaciones:</b> {r.observaciones || "—"}</p>

                        <button onClick={() => setFilaAbierta(null)}>
                          Cerrar
                        </button>

                      </div>
                    </td>
                  </tr>
                )}

              </React.Fragment>
            );
          })}

        </tbody>

      </table>

    </div>
  );
}