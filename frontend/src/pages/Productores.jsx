import { useEffect, useState } from "react";
import TablaProductores from "../components/TablaProductores";

function Productores() {
  const [productores, setProductores] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editarId, setEditarId] = useState(null);
  const [errores, setErrores] = useState({});
  const [filtroEstado, setFiltroEstado] = useState("ACTIVOS");

  const estadoInicial = {
    rfc: "",
    nombre: "",
    apellido: "",
    telefono: "",
    tipoSocio: "PRODUCTOR",
    activo: true,
    fechaIngreso: new Date().toISOString().split("T")[0],
    genero: "",
    comunidad: "",
    localidad: "",
    estado: "",
  };

  const [formProductor, setFormProductor] = useState(estadoInicial);

  const productoresFiltrados =
    productores
      ?.filter((p) => {
        if (filtroEstado === "ACTIVOS") return p.activo;
        if (filtroEstado === "INACTIVOS") return !p.activo;
        return true; // TODOS
      })

      ?.filter(
        (p) =>
          (p.idProductor + "").includes(busqueda) ||
          (p.nombre || "").toLowerCase().includes(busqueda.toLowerCase()) ||
          (p.apellido || "").toLowerCase().includes(busqueda.toLowerCase()) ||
          (p.rfc || "").toLowerCase().includes(busqueda.toLowerCase()),
      ) || [];

  const cargarProductores = async () => {
    try {
      const res = await fetch("http://localhost:8080/productores");

      const data = await res.json();

      setProductores(data.sort((a, b) => a.idProductor - b.idProductor));
    } catch (err) {
      console.error(err);
    }
  };

  // Cargar productores
  useEffect(() => {
    const cargar = async () => {
      await cargarProductores();
      setLoading(false);
    };

    cargar();
  }, []);

  // Validación
  const validar = () => {
    const e = {};

    if (!formProductor.rfc) e.rfc = "RFC es obligatorio";
    if (!formProductor.nombre) e.nombre = "Nombre es obligatorio";
    if (!formProductor.apellido) e.apellido = "Apellido es obligatorio";

    setErrores(e);

    return Object.keys(e).length === 0;
  };

  const limpiarDatos = (obj) => {
    return {
      rfc: obj.rfc,
      nombre: obj.nombre,
      apellido: obj.apellido,
      telefono: obj.telefono,
      genero: obj.genero,
      comunidad: obj.comunidad,
      localidad: obj.localidad,
      estado: obj.estado,
      tipoSocio: obj.tipoSocio,
      activo: obj.activo,
      fechaIngreso: obj.fechaIngreso,
    };
  };

  // Guardar productor
  const handleGuardar = async () => {
    if (!validar()) return;

    const data = limpiarDatos(formProductor);

    const url = editarId
      ? `http://localhost:8080/productores/${editarId}`
      : "http://localhost:8080/productores";

    const method = editarId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Error guardando productor");

      // recargar desde backend
      await cargarProductores();

      setShowForm(false);
      setEditarId(null);
      setFormProductor(estadoInicial);
      setErrores({});
    } catch (err) {
      console.error(err);
    }
  };

  // Eliminar
  const handleEliminar = async (id) => {
    try {
      await fetch(`http://localhost:8080/productores/${id}`, {
        method: "DELETE",
      });

      await cargarProductores();
    } catch (err) {
      console.error(err);
    }
  };

  // Editar
  const handleEditar = (productor) => {
    setEditarId(productor.idProductor);
    setFormProductor(productor);
    setShowForm(true);
  };

  return (
    <div>
      <div className="header-productores">
        <h2>Lista de Productores</h2>

        <div className="header-actions">
          <input
            type="text"
            placeholder="Buscar productor..."
            className="search-input"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          <div className={`filtro-estado estado-${filtroEstado}`}>
            <label>
              <input
                type="radio"
                value="ACTIVOS"
                checked={filtroEstado === "ACTIVOS"}
                onChange={(e) => setFiltroEstado(e.target.value)}
              />
              <span>Activos</span>
            </label>

            <label>
              <input
                type="radio"
                value="INACTIVOS"
                checked={filtroEstado === "INACTIVOS"}
                onChange={(e) => setFiltroEstado(e.target.value)}
              />
              <span>Inactivos</span>
            </label>

            <label>
              <input
                type="radio"
                value="TODOS"
                checked={filtroEstado === "TODOS"}
                onChange={(e) => setFiltroEstado(e.target.value)}
              />
              <span>Todos</span>
            </label>
          </div>
          <button
            className="btn-primary"
            onClick={() => {
              setShowForm(true);
              setEditarId(null);
              setFormProductor(estadoInicial);
            }}
          >
            Nuevo Productor
          </button>
        </div>
      </div>

      {loading ? (
        <p>Cargando productores...</p>
      ) : (
        <TablaProductores
          productores={productoresFiltrados}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
        />
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <button
              className="modal-close"
              type="button"
              onClick={() => setShowForm(false)}
            >
              ×
            </button>

            <h2>{editarId ? "Editar Productor" : "Registrar Productor"}</h2>

            <form
              className="form-productor"
              onSubmit={(e) => {
                e.preventDefault();
                handleGuardar();
              }}
            >
              {[
                "nombre",
                "apellido",
                "rfc",
                "telefono",
                "comunidad",
                "localidad",
                "estado",
              ].map((campo) => (
                <div key={campo}>
                  <input
                    type="text"
                    placeholder={campo}
                    value={formProductor[campo] || ""}
                    onChange={(e) =>
                      setFormProductor({
                        ...formProductor,
                        [campo]: e.target.value,
                      })
                    }
                  />

                  {errores[campo] && (
                    <div className="error-text">{errores[campo]}</div>
                  )}
                </div>
              ))}

              <div>
                <select
                  value={formProductor.genero || ""}
                  onChange={(e) =>
                    setFormProductor({
                      ...formProductor,
                      genero: e.target.value,
                    })
                  }
                >
                  <option value="">Seleccione género</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMENINO">Femenino</option>
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-clear"
                  onClick={() => {
                    setFormProductor(estadoInicial);
                    setEditarId(null);
                    setErrores({});
                  }}
                >
                  Limpiar
                </button>

                <button className="btn-primary" type="submit">
                  {editarId ? "Actualizar" : "Guardar"}
                </button>

                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Productores;
