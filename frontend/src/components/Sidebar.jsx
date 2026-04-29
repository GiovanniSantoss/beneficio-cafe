export default function Sidebar({ setVista, vista }) {

  return (

    <div className="sidebar">

      <h2 className="logo">☕ Beneficio</h2>

      <ul>

        <li
          className={vista === "inicio" ? "active" : ""}
          onClick={() => setVista("inicio")}
        >
          Inicio
        </li>

        <li
          className={vista === "productores" ? "active" : ""}
          onClick={() => setVista("productores")}
        >
          Productores
        </li>

        <li
          className={vista === "cafetales" ? "active" : ""}
          onClick={() => setVista("cafetales")}
        >
          Cafetales
        </li>

        <li
        className={vista === "recepciones" ? "active" : ""}
        onClick={() => setVista("recepciones")}
      >
        Recepción
      </li>
        <li>Procesos</li>
        <li>Inventario</li>
        <li>Ventas</li>
        <li>Reportes</li>

      </ul>

    </div>

  );

}
