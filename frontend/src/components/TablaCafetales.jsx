import { useState } from "react";
import React from "react";
import MapaCafetal from "./MapaCafetal";

export default function TablaCafetales({ cafetales, onEditar, onEliminar }) {
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
            <th>Parcela</th>
            <th>Ubicación</th>
            <th>Área</th>
            <th>Productor</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {cafetales.map((c) => (
            <React.Fragment key={c.idCafetal}>
              <tr>
                <td>{c.idCafetal}</td>
                <td>{c.numParcela}</td>
                <td>{c.ubicacion}</td>
                <td>{c.areaTotalHa}</td>

                <td>
                  {c.productor?.nombre} {c.productor?.apellido}
                </td>

                <td>
                  <span
                    className={c.activo ? "status-activo" : "status-inactivo"}
                  >
                    {c.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>

                <td className="actions">
                  <button className="btn-edit" onClick={() => onEditar(c)}>
                    Editar
                  </button>

                  <button
                    className={c.activo ? "btn-delete" : "btn-reactivar"}
                    onClick={() => onEliminar(c.idCafetal, c.activo)}
                  >
                    {c.activo ? "Eliminar" : "Reactivar"}
                  </button>

                  <button
                    className="btn-details"
                    onClick={() => toggleDetalles(c.idCafetal)}
                  >
                    {filaAbierta === c.idCafetal ? "Ocultar" : "Ver más"}
                  </button>
                </td>
              </tr>

              {filaAbierta === c.idCafetal && (
                <tr className="detalle-fila">
                  <td colSpan="7">
                    {(() => {
                      const hayMapa = c.latitud != null || c.poligono != null;

                      return (
                        <div className="detalle-overlay detalle-cafetal-overlay">
                          <div className="detalle-card detalle-cafetal-card">
                            <h3>Información del Cafetal</h3>

                            <div
                              className={
                                hayMapa
                                  ? "detalle-cafetal-cuerpo con-mapa"
                                  : "detalle-cafetal-cuerpo sin-mapa"
                              }
                            >
                              <div className="detalle-grid">
                                <div>
                                  <b>Parcela:</b> {c.numParcela}
                                </div>
                                <div>
                                  <b>Ubicación:</b> {c.ubicacion}
                                </div>
                                <div>
                                  <b>Área:</b> {c.areaTotalHa} ha
                                </div>
                                <div>
                                  <b>Latitud:</b> {c.latitud}
                                </div>
                                <div>
                                  <b>Longitud:</b> {c.longitud}
                                </div>

                                <div>
                                  <b>Productor:</b> {c.productor?.nombre}{" "}
                                  {c.productor?.apellido}
                                </div>

                                <div>
                                  <b>Activo:</b> {c.activo ? "Sí" : "No"}
                                </div>
                              </div>

                              {hayMapa && (
                                <div className="detalle-cafetal-mapa">
                                  <MapaCafetal
                                    value={c}
                                    readOnly
                                    height="100%"
                                  />
                                </div>
                              )}
                            </div>

                            <button
                              className="btn-cerrar-detalle"
                              onClick={() => setFilaAbierta(null)}
                            >
                              Cerrar
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}