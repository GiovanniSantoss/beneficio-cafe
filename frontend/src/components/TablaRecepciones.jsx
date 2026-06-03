import { useState } from "react";
import React from "react";

export default function TablaRecepciones({
  recepciones,
  onCancelar,
}) {
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);

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
            const estado = r.estado;

            return (
              <tr key={r.idRecepcion}>
                <td>{r.idRecepcion}</td>

                <td>
                  {r.productor?.nombre} {r.productor?.apellido}
                </td>

                <td>{r.cafetal?.numParcela || r.cafetal?.ubicacion}</td>

                <td>{r.pesoInicial}</td>

                <td>—</td>

                <td>{r.empleado?.nombre || "—"}</td>

                <td>
                  {r.fechaHora
                    ? new Date(r.fechaHora).toLocaleString()
                    : "—"}
                </td>

                <td>
                  <span className={`estado ${estado?.toLowerCase()}`}>
                    {estado?.charAt(0) +
                      estado?.slice(1).toLowerCase()}
                  </span>
                </td>

                <td className="actions actions-recepcion">
                  {estado === "PENDIENTE" && (
                    <>
                      
                      <button
                        className="btn-delete"
                        onClick={() => onCancelar(r.idRecepcion)}
                      >
                        Cancelar
                      </button>
                    </>
                  )}

                  {estado !== "PENDIENTE" && (
                    <button
  className="btn-details"
  onClick={() =>
    setDetalleSeleccionado(
      detalleSeleccionado?.idRecepcion === r.idRecepcion ? null : r
    )
  }
>
  {detalleSeleccionado?.idRecepcion === r.idRecepcion
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

      {/* 🔥 MODAL DETALLE CENTRADO */}
      {detalleSeleccionado && (
        <div className="detalle-overlay">
          <div className="detalle-card">
            <h2>Detalle Recepción</h2>

            <div className="detalle-grid">
              <div>
                <b>Productor</b>
                {detalleSeleccionado.productor?.nombre}{" "}
                {detalleSeleccionado.productor?.apellido}
              </div>

              <div>
                <b>Cafetal</b>
                {detalleSeleccionado.cafetal?.numParcela ||
                  detalleSeleccionado.cafetal?.ubicacion}
              </div>

              <div>
                <b>Peso Inicial</b>
                {detalleSeleccionado.pesoInicial}
              </div>

              <div>
                <b>Peso Final</b>
                {detalleSeleccionado.pesoFinal ?? "—"}
              </div>

              <div>
                <b>Empleado</b>
                {detalleSeleccionado.empleado?.nombre || "—"}
              </div>

              <div>
                <b>Fecha</b>
                {detalleSeleccionado.fechaHora
                  ? new Date(
                      detalleSeleccionado.fechaHora
                    ).toLocaleString()
                  : "—"}
              </div>

              <div className="full-width">
                <b>Observaciones</b>
                {detalleSeleccionado.observaciones || "—"}
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