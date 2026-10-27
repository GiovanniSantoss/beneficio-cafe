import { useEffect, useState } from "react";
import { sileo } from "sileo";
import TablaCafetales from "../components/TablaCafetales";
import MapaCafetal from "../components/MapaCafetal";
import ProductorComboBox from "../components/ProductorComboBox";
import "../styles/Cafetales.css";
function Cafetales() {
  const [cafetales, setCafetales] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editarId, setEditarId] = useState(null);
  const [productores, setProductores] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("ACTIVOS");
  const [mapKey, setMapKey] = useState(0); // fuerza reiniciar el mapa (botón Limpiar)

  const estadoInicial = {
    idProductor: "",
    numParcela: "",
    ubicacion: "",
    areaTotalHa: "",
    latitud: null,
    longitud: null,
    poligono: null,
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

  // El mapa envía solo los campos que cambian (lat, lng, polígono, área)
  const actualizarGeo = (parcial) =>
    setFormCafetal((prev) => ({ ...prev, ...parcial }));

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

  // Productores activos para el combo. Si se edita un cafetal cuyo productor
  // quedó inactivo, se conserva en la lista para poder mostrarlo.
  const productoresDisponibles = productores.filter(
    (p) => p.activo || String(p.idProductor) === String(formCafetal.idProductor),
  );

  // Carga inicial. Los setState van dentro de callbacks (then/finally), que es lo que
  // permite la regla react-hooks/set-state-in-effect. cargarCafetales() se sigue usando
  // en los handlers (guardar, eliminar), donde sí es válido.
  useEffect(() => {
    let cancelado = false;

    fetch("http://localhost:8080/cafetales")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelado) setCafetales(data.sort((a, b) => a.idCafetal - b.idCafetal));
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    fetch("http://localhost:8080/productores")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelado) setProductores(data);
      })
      .catch((err) => console.error(err));

    return () => {
      cancelado = true;
    };
  }, []);

  const limpiarDatos = (obj) => {
    return {
      idCafetal: obj.idCafetal || null,

      numParcela: obj.numParcela || null,
      ubicacion: obj.ubicacion || null,
      areaTotalHa: obj.areaTotalHa || null,

      // ?? en lugar de || para no perder coordenadas válidas con valor 0
      latitud: obj.latitud ?? null,
      longitud: obj.longitud ?? null,
      poligono: obj.poligono ?? null,

      activo: obj.activo ?? true,

      productor: {
        idProductor: Number(obj.idProductor),
      },
    };
  };

  const guardarCafetal = async () => {
    const data = limpiarDatos(formCafetal);

    const url = editarId
      ? `http://localhost:8080/cafetales/${editarId}`
      : "http://localhost:8080/cafetales";

    const method = editarId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      let detalle = "";
      try {
        const body = await res.json();
        detalle = body.message || body.error || "";
      } catch {
        /* respuesta sin JSON */
      }
      throw new Error(`El servidor respondió ${res.status}. ${detalle}`);
    }

    await cargarCafetales();

    setShowForm(false);
    setEditarId(null);
    setFormCafetal(estadoInicial);
  };

  const handleGuardar = () => {
    sileo.promise(guardarCafetal(), {
      loading: { title: "Guardando cafetal…" },
      success: { title: "Cafetal guardado correctamente" },
      position: "top-center",
      error: (err) => ({
        title: "No se pudo guardar",
        description: err?.message || "Intenta de nuevo.",
        position: "top-center",
      }),
    });
  };

  const handleEliminar = (id, activo) => {
    const ejecutar = async () => {
      const url = activo
        ? `http://localhost:8080/cafetales/${id}`
        : `http://localhost:8080/cafetales/reactivar/${id}`;

      const method = activo ? "DELETE" : "PUT";

      const res = await fetch(url, { method });

      if (!res.ok) throw new Error(`El servidor respondió ${res.status}.`);

      await cargarCafetales();
    };

    const idToast = sileo.show({
      title: activo ? "Eliminando cafetal…" : "Reactivando cafetal…",
      duration: null,
      position: "top-center",
    });

    ejecutar()
      .then(() => {
        sileo.dismiss(idToast);
        (activo ? sileo.error : sileo.success)({
          title: activo ? "Cafetal desactivado" : "Cafetal reactivado",
          position: "top-center",
        });
      })
      .catch((err) => {
        sileo.dismiss(idToast);
        sileo.error({
          title: activo ? "No se pudo desactivar" : "No se pudo reactivar",
          description: err?.message || "Intenta de nuevo.",
          position: "top-center",
        });
      });
  };

  const handleEditar = (c) => {
    setEditarId(c.idCafetal);

    setFormCafetal({
      idCafetal: c.idCafetal,
      numParcela: c.numParcela,
      ubicacion: c.ubicacion,
      areaTotalHa: c.areaTotalHa,
      latitud: c.latitud ?? null,
      longitud: c.longitud ?? null,
      poligono: c.poligono ?? null,
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
          <div className="modal modal-cafetal">
            <button className="modal-close" onClick={() => setShowForm(false)}>
              ×
            </button>

            <h2>{editarId ? "Editar Cafetal" : "Registrar Cafetal"}</h2>

            <form
              className="form-cafetal"
              onSubmit={(e) => {
                e.preventDefault();
                handleGuardar();
              }}
            >
              <div className="form-cafetal-campos">
                {/* PRODUCTOR */}
                <ProductorComboBox
                  productores={productoresDisponibles}
                  value={formCafetal.idProductor}
                  onChange={(idProductor) =>
                    setFormCafetal({
                      ...formCafetal,
                      idProductor,
                    })
                  }
                  placeholder="Seleccione productor"
                  id="cafetal-productor"
                />

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
              </div>

              {/* MAPA: reemplaza los campos manuales de latitud y longitud */}
              <div className="form-cafetal-mapa">
                <MapaCafetal
                  key={mapKey}
                  value={formCafetal}
                  onChange={actualizarGeo}
                  height="100%"
                />
              </div>

              <div className="form-cafetal-footer">
                <button
                  type="button"
                  className="btn-clear"
                  onClick={() => {
                    setFormCafetal(estadoInicial);
                    setEditarId(null);
                    setMapKey((k) => k + 1);
                  }}
                >
                  Limpiar
                </button>

                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowForm(false);
                  }}
                >
                  Cancelar
                </button>

                <button className="btn-primary" type="submit">
                  Guardar
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