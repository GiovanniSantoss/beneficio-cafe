import { useEffect, useId, useRef, useState } from "react";

const ETIQUETAS_ROL = {
  dueno: "Dueño",
  propietario: "Dueño",
  admin: "Administrador",
  administrador: "Administrador",
  recepcionista: "Recepcionista",
};

function normalizar(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function formatearRol(rol) {
  const clave = normalizar(rol);

  if (ETIQUETAS_ROL[clave]) return ETIQUETAS_ROL[clave];
  if (!rol) return "Usuario";

  const texto = String(rol).trim();
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function obtenerIniciales(nombre, apellido, username) {
  const partes = [nombre, apellido]
    .map((parte) => String(parte || "").trim())
    .filter(Boolean);

  if (partes.length > 0) {
    return partes
      .map((parte) => parte.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  return String(username || "?").trim().charAt(0).toUpperCase() || "?";
}

export default function Header({ usuario, onLogout }) {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef(null);
  const botonRef = useRef(null);
  const menuId = useId();

  const nombreCompleto = [usuario?.nombre, usuario?.apellido]
    .map((parte) => String(parte || "").trim())
    .filter(Boolean)
    .join(" ");

  const nombreVisible = nombreCompleto || usuario?.username || "Usuario";
  const rolVisible = formatearRol(usuario?.rol);
  const iniciales = obtenerIniciales(
    usuario?.nombre,
    usuario?.apellido,
    usuario?.username,
  );

  useEffect(() => {
    if (!abierto) return undefined;

    const cerrarPorClick = (evento) => {
      if (!contenedorRef.current?.contains(evento.target)) {
        setAbierto(false);
      }
    };

    const cerrarPorTecla = (evento) => {
      if (evento.key === "Escape") {
        setAbierto(false);
        botonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", cerrarPorClick);
    document.addEventListener("keydown", cerrarPorTecla);

    return () => {
      document.removeEventListener("pointerdown", cerrarPorClick);
      document.removeEventListener("keydown", cerrarPorTecla);
    };
  }, [abierto]);

  const cerrarSesion = () => {
    setAbierto(false);
    onLogout?.();
  };

  return (
    <header className="header">
      <h2>Sistema Beneficio de Café</h2>

      {usuario && (
        <div className="header-user" ref={contenedorRef}>
          <button
            type="button"
            className="user-pill"
            ref={botonRef}
            aria-haspopup="true"
            aria-expanded={abierto}
            aria-controls={menuId}
            onClick={() => setAbierto((valor) => !valor)}
          >
            <span className="user-avatar" aria-hidden="true">
              {iniciales}
              <span className="user-status" />
            </span>

            <span className="user-info">
              <span className="user-name">{nombreVisible}</span>
              <span className="user-role">{rolVisible}</span>
            </span>

            <svg
              className="user-caret"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {abierto && (
            <div
              className="user-dropdown"
              id={menuId}
              role="menu"
              aria-label="Opciones de usuario"
            >
              <div className="user-dropdown-head">
                <span className="user-dropdown-name">{nombreVisible}</span>
                {usuario?.username && (
                  <span className="user-dropdown-username">
                    @{usuario.username}
                  </span>
                )}
              </div>

              <button
                type="button"
                className="user-dropdown-item"
                role="menuitem"
                onClick={cerrarSesion}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
