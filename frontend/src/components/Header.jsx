
export default function Header({ usuario, onLogout }) {
  const nombreCompleto = `${usuario?.nombre || ""} ${usuario?.apellido || ""}`.trim();

  return (
    <div className="header">

      <h2>Sistema Beneficio de Café</h2>

      <div className="header-user">
        <span>
          {nombreCompleto || usuario?.username}
        </span>

        <span className="user-role">
          {usuario?.rol}
        </span>

        <button onClick={onLogout}>
          Cerrar sesión
        </button>
      </div>

    </div>
  );
}

