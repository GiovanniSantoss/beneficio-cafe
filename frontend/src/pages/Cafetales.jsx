import { useEffect, useState } from "react";
import TablaCafetales from "../components/TablaCafetales";

function Cafetales() {
  const [cafetales, setCafetales] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editarId, setEditarId] = useState(null);
  const [productores, setProductores] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("ACTIVOS");

  const estadoInicial = {
    idProductor: "",
    numParcela: "",
    ubicacion: "",
    areaTotalHa: "",
    latitud: "",
    longitud: "",
    activo: true,
  };

  const cargarCafetales = async () => {
    try {
      const res = await fetch("http://localhost:8080/cafetales");

      const data = await res.json();

      setCafetales(data.sort((a, b) => a.idCafetal - b.idCafetal));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const [formCafetal, setFormCafetal] = useState(estadoInicial);

  const cafetalesFiltrados =
    cafetales
      ?.filter((c) => {
        if (filtroEstado === "ACTIVOS") return c.activo;
        if (filtroEstado === "INACTIVOS") return !c.activo;
        return true; 
      })
      ?.filter(
        (c) =>
          (c.idCafetal + "").includes(busqueda) ||
          (c.numParcela || "").toLowerCase().includes(busqueda.toLowerCase()) ||
          (c.ubicacion || "").toLowerCase().includes(busqueda.toLowerCase()),
      ) || [];

  useEffect(() => {
    cargarCafetales();

    const cargarProductores = async () => {
      const res = await fetch("http://localhost:8080/productores");

      const data = await res.json();

      setProductores(data);
    };

    cargarProductores();
  }, []);

  const limpiarDatos = (obj) => {
    return {
      idCafetal: obj.idCafetal || null,

      numParcela: obj.numParcela || null,
      ubicacion: obj.ubicacion || null,
      areaTotalHa: obj.areaTotalHa || null,

      latitud: obj.latitud || null,
      longitud: obj.longitud || null,

      activo: obj.activo ?? true,

      productor: {
        idProductor: Number(obj.idProductor),
      },
    };
  };

  const handleGuardar = async () => {
    const data = limpiarDatos(formCafetal);

    console.log("DATA A ENVIAR:", data);

    const url = editarId
      ? `http://localhost:8080/cafetales/${editarId}`
      : "http://localhost:8080/cafetales";

    const method = editarId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Error guardando");

      
      await cargarCafetales();

      //  limpiar formulario
      setShowForm(false);
      setEditarId(null);
      setFormCafetal(estadoInicial);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEliminar = async (id, activo) => {
    try {
      const url = activo
        ? `http://localhost:8080/cafetales/${id}`
        : `http://localhost:8080/cafetales/reactivar/${id}`;

      const method = activo ? "DELETE" : "PUT";

      await fetch(url, { method });

      await cargarCafetales();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditar = (c) => {
    setEditarId(c.idCafetal);

    setFormCafetal({
      idCafetal: c.idCafetal,
      numParcela: c.numParcela,
      ubicacion: c.ubicacion,
      areaTotalHa: c.areaTotalHa,
      latitud: c.latitud,
      longitud: c.longitud,
      activo: c.activo,

      idProductor: c.productor?.idProductor || "",
    });

    setShowForm(true);
  };

  return (
    <div>
      <div className="header-productores">
        <h2>Lista de Cafetales</h2>

        <div className="header-actions">
          <input
            type="text"
            placeholder="Buscar cafetal..."
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
              setFormCafetal(estadoInicial);
            }}
          >
            Nuevo Cafetal
          </button>
        </div>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <TablaCafetales
          cafetales={cafetalesFiltrados}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
        />
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="modal-close" onClick={() => setShowForm(false)}>
              ×
            </button>

            <h2>{editarId ? "Editar Cafetal" : "Registrar Cafetal"}</h2>

            <form
              className="form-productor"
              onSubmit={(e) => {
                e.preventDefault();
                handleGuardar();
              }}
            >
              {/* PRODUCTOR */}
              <select
                value={formCafetal.idProductor || ""}
                onChange={(e) =>
                  setFormCafetal({
                    ...formCafetal,
                    idProductor: e.target.value,
                  })
                }
              >
                <option value="">Seleccione productor</option>

                {productores.map((p) => (
                  <option key={p.idProductor} value={p.idProductor}>
                    {p.nombre} {p.apellido}
                  </option>
                ))}
              </select>

              <input
                placeholder="Número parcela"
                value={formCafetal.numParcela || ""}
                onChange={(e) =>
                  setFormCafetal({
                    ...formCafetal,
                    numParcela: e.target.value,
                  })
                }
              />

              <input
                placeholder="Ubicación"
                value={formCafetal.ubicacion || ""}
                onChange={(e) =>
                  setFormCafetal({
                    ...formCafetal,
                    ubicacion: e.target.value,
                  })
                }
              />

              <input
                placeholder="Área total (ha)"
                value={formCafetal.areaTotalHa || ""}
                onChange={(e) =>
                  setFormCafetal({
                    ...formCafetal,
                    areaTotalHa: e.target.value,
                  })
                }
              />

              <input
                placeholder="Latitud"
                value={formCafetal.latitud || ""}
                onChange={(e) =>
                  setFormCafetal({
                    ...formCafetal,
                    latitud: e.target.value,
                  })
                }
              />

              <input
                placeholder="Longitud"
                value={formCafetal.longitud || ""}
                onChange={(e) =>
                  setFormCafetal({
                    ...formCafetal,
                    longitud: e.target.value,
                  })
                }
              />

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-clear"
                  onClick={() => {
                    setFormCafetal(estadoInicial);
                    setEditarId(null);
                  }}
                >
                  Limpiar
                </button>

                <button className="btn-primary" type="submit">
                  Guardar
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

export default Cafetales;
