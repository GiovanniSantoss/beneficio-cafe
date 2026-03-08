import { useEffect, useState } from "react";

function Productores() {

  const [productores, setProductores] = useState([]);

  useEffect(() => {
  fetch("http://localhost:8080/productores")
    .then(response => response.json())
    .then(data => {
      console.log("DATOS:", data);
      setProductores(data);
    })
    .catch(error => console.error("Error:", error));
}, []);

  return (
    <div>
      <h2>Lista de Productores</h2>

      <table border="1">
        <thead>
        <tr>
          <th>ID</th>
          <th>RFC</th>
          <th>Nombre</th>
          <th>Apellido</th>
          <th>Teléfono</th>
          <th>Tipo</th>
          <th>Activo</th>
          <th>Acciones</th>
        </tr>
      </thead>

              <tbody>
        {productores.map((p) => (
          <tr key={p.idProductor}>
            <td>{p.idProductor}</td>
            <td>{p.rfc}</td>
            <td>{p.nombre}</td>
            <td>{p.apellido}</td>
            <td>{p.telefono}</td>
            <td>{p.tipoSocio}</td>
            <td>{p.activo ? "Sí" : "No"}</td>
            <td>
              <button>Editar</button>
            <button>Eliminar</button>
            </td>
          </tr>
        ))}
      </tbody>

      </table>
    </div>
  );
}

export default Productores;