
export default function Sidebar({ setVista, vista, usuario }) {

  const rol = (usuario?.rol || "")
    .trim()
    .toLowerCase();

  const esDueno = rol === "dueño" || rol === "dueno";
  const esAdministrador = rol === "administrador";
  const esRecepcionista = rol === "recepcionista";

  const opciones = [];

  // Opciones del Dueño
  if (esDueno) {
    opciones.push(
      { id: "inicio", nombre: "Inicio" },
      { id: "productores", nombre: "Productores" },
      { id: "cafetales", nombre: "Cafetales" },
      { id: "recepciones", nombre: "Recepción" },
      { id: "procesos", nombre: "Procesos" },
      { id: "inventario", nombre: "Inventario" },
      { id: "ventas", nombre: "Ventas" },
      { id: "reportes", nombre: "Reportes" }
    );
  }

  // Opciones del Administrador
  else if (esAdministrador) {
    opciones.push(
      { id: "inicio", nombre: "Inicio" },
      { id: "productores", nombre: "Productores" },
      { id: "cafetales", nombre: "Cafetales" },
      { id: "recepciones", nombre: "Recepción" },
      { id: "procesos", nombre: "Procesos" }
    );
  }

  // Opciones del Recepcionista
  else if (esRecepcionista) {
    opciones.push(
      { id: "recepciones", nombre: "Recepción" }
    );
  }

    return (
    <div className="sidebar">
      <h2 className="logo">☕ Beneficio</h2>

      <ul>
        {opciones.map((opcion) => (
          <li
            key={opcion.id}
            className={vista === opcion.id ? "active" : ""}
            onClick={() => setVista(opcion.id)}
          >
            {opcion.nombre}
          </li>
        ))}
      </ul>
    </div>
  );
}
