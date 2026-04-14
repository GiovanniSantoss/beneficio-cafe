import { useState } from "react";
import React from "react";

export default function TablaProductores({ productores, onEditar, onEliminar }) {

 
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
            <th>RFC</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Telefono</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>

          {productores.map((p) => (

            <React.Fragment key={p.idProductor}>

              <tr>

                <td>{p.idProductor}</td>
                <td>{p.rfc}</td>
                <td>{p.nombre}</td>
                <td>{p.apellido}</td>
                <td>{p.telefono}</td>

                <td>
                  <span className={p.activo ? "status-activo" : "status-inactivo"}>
                    {p.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>

                <td className="actions">

                  <button
                    className="btn-edit"
                    onClick={() => onEditar(p)}
                  >
                    Editar
                  </button>

                  <button
                    className="btn-delete"
                    onClick={() => onEliminar(p.idProductor)}
                  >
                    Eliminar
                  </button>

                  <button
                    className="btn-details"
                    onClick={() => toggleDetalles(p.idProductor)}
                  >
                    {filaAbierta === p.idProductor ? "Ocultar" : "Ver más"}
                  </button>

                </td>

              </tr>

              {filaAbierta === p.idProductor && (

                <tr className="detalle-fila">

                  <td colSpan="7">

                    <div className="detalle-overlay">

                      <div className="detalle-card">

                        <h3>Información del Productor</h3>

                        <div className="detalle-grid">
                          <div><b>Nombre completo:</b> {p.nombre} {p.apellido}</div>

                          <div><b>Genero:</b> {p.genero}</div>
                          <div><b>Comunidad:</b> {p.comunidad}</div>
                          <div><b>Localidad:</b> {p.localidad}</div>
                          <div><b>Estado:</b> {p.estado}</div>
                          <div><b>Tipo Socio:</b> {p.tipoSocio}</div>
                          <div><b>Activo:</b> {p.activo ? "Sí" : "No"}</div>
                          <div><b>Fecha Ingreso:</b> {p.fechaIngreso}</div>

                          

                        </div>

                        <button
                          className="btn-cerrar-detalle"
                          onClick={() => setFilaAbierta(null)}
                        >
                          Cerrar
                        </button>

                      </div>

                    </div>

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