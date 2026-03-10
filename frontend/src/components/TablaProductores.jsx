export default function TablaProductores({ productores }) {

  return(

    <div className="table-container">

      <div className="table-header">

        <input placeholder="Buscar productor..." />

        <button className="btn-primary">
          Nuevo Productor
        </button>

      </div>

      <table>

        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Comunidad</th>
            <th>Telefono</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>

          {productores.map(p => (

            <tr key={p.idProductor}>

              <td>{p.idProductor}</td>
              <td>{p.nombre}</td>
              <td>{p.comunidad}</td>
              <td>{p.telefono}</td>
              <td>{p.estado}</td>

              <td 
              className="actions">
              <button className="btn-edit">Editar</button>
              <button className="btn-delete">Eliminar</button>
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  )

}