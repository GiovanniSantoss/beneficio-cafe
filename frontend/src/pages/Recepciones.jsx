import { useEffect, useState } from "react";
import TablaRecepciones from "../components/TablaRecepciones";
import FiltroEstado from "../components/FiltroEstado";
import ProductorComboBox from "../components/ProductorComboBox";
import BuscadorProductores from "../components/BuscadorProductores";
import { normalizar } from "../utils/texto";

function Recepciones() {
  const [recepciones, setRecepciones] = useState([]);
  const [productores, setProductores] = useState([]);
  const [cafetales, setCafetales] = useState([]);
  const [empleados, setEmpleados] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  // Productor elegido desde las sugerencias: filtra exacto por id
  const [productorFiltro, setProductorFiltro] = useState(null);
  const [fecha, setFecha] = useState(""); // "YYYY-MM-DD" o "" = sin filtro
  const [filtroEstado, setFiltroEstado] = useState("PENDIENTE");

  const [showForm, setShowForm] = useState(false);
  //const [showFinalizar, setShowFinalizar] = useState(false);

  //const [recepcionSeleccionada, setRecepcionSeleccionada] = useState(null);

  //const [pesoFinalEdit, setPesoFinalEdit] = useState("");
  //const [obsEdit, setObsEdit] = useState("");

  const [loading, setLoading] = useState(true);

  const estadoInicial = {
  productor: { idProductor: "" },
  cafetal: { idCafetal: "" },
  empleado: { idEmpleado: "" },
  pesoInicial: "",
  observaciones: "",
};

  const [form, setForm] = useState(estadoInicial);

  //  CARGAR TODO
  const cargarTodo = async () => {
    const [r, p, c, e] = await Promise.all([
      fetch("http://localhost:8080/recepciones").then((r) => r.json()),
      fetch("http://localhost:8080/productores").then((r) => r.json()),
      fetch("http://localhost:8080/cafetales").then((r) => r.json()),
      fetch("http://localhost:8080/empleados").then((r) => r.json()),
    ]);

    setRecepciones(r);
    setProductores(p.filter((x) => x.activo));
    setCafetales(c.filter((x) => x.activo));
    setEmpleados(e.filter((x) => x.activo));
  };

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      try {
        const [r, p, c, e] = await Promise.all([
          fetch("http://localhost:8080/recepciones").then((r) => r.json()),
          fetch("http://localhost:8080/productores").then((r) => r.json()),
          fetch("http://localhost:8080/cafetales").then((r) => r.json()),
          fetch("http://localhost:8080/empleados").then((r) => r.json()),
        ]);

        if (!activo) return;

        setRecepciones(r);
        setProductores(p.filter((x) => x.activo));
        setCafetales(c.filter((x) => x.activo));
        setEmpleados(e.filter((x) => x.activo));

        setLoading(false);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };

    cargar();

    return () => {
      activo = false;
    };
  }, []);

  //  FILTRO CAFETALES
  const cafetalesFiltrados = cafetales.filter(
    (c) => c.productor?.idProductor === Number(form.productor.idProductor),
  );

  //  FILTRO DE LA TABLA: píldora (estado) + búsqueda de texto + fecha exacta
  const recepcionesFiltradas =
    recepciones
      ?.filter((r) => r.estado === filtroEstado)
      ?.filter((r) => {
        // Si se eligió una sugerencia, filtrar exactamente por ese productor
        if (productorFiltro) {
          return r.productor?.idProductor === productorFiltro.idProductor;
        }

        const q = normalizar(busqueda).trim();

        return (
          (r.idRecepcion + "").includes(busqueda) ||
          normalizar(
            `${r.productor?.nombre ?? ""} ${r.productor?.apellido ?? ""}`,
          ).includes(q) ||
          normalizar(r.cafetal?.numParcela).includes(q) ||
          normalizar(r.cafetal?.ubicacion).includes(q) ||
          normalizar(
            `${r.empleado?.nombre ?? ""} ${r.empleado?.apellido ?? ""}`,
          ).includes(q)
        );
      })
      ?.filter((r) => {
        if (!fecha) return true;
        // Comparar solo el día en horario local (ignora hora/minuto)
        const d = new Date(r.fechaHora);
        const local = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        return local === fecha;
      }) || [];

  //  GUARDAR RECEPCIÓN
  const handleGuardar = async () => {
    if (!form.empleado.idEmpleado) {
      alert("Selecciona un empleado");
      return;
    }

    const body = {
    productor: { idProductor: Number(form.productor.idProductor) },
    cafetal: { idCafetal: Number(form.cafetal.idCafetal) },
    usuario: { idUsuario: 1 },
    empleado: { idEmpleado: Number(form.empleado.idEmpleado) },
    pesoInicial: Number(form.pesoInicial),
    observaciones: form.observaciones,
  };

    await fetch("http://localhost:8080/recepciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    await cargarTodo();
    setShowForm(false);
    setForm(estadoInicial);
  };

  //  ABRIR FINALIZAR
  

  //  GUARDAR FINALIZACIÓN
  

  const cancelarRecepcion = async (id) => {
    await fetch(`http://localhost:8080/recepciones/${id}/cancelar`, {
      method: "PUT",
    });

    await cargarTodo();
  };

  return (
    <div>
      <div className="header-productores">
        <h2>Recepciones</h2>

        <div className="header-actions">
          <div className="search-group">
            <input
              type="date"
              className="date-input"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />

            <BuscadorProductores
              productores={productores}
              value={busqueda}
              onChange={(texto) => {
                setBusqueda(texto);
                setProductorFiltro(null);
              }}
              onSelect={(p) => {
                setBusqueda(`${p.nombre} ${p.apellido}`.trim());
                setProductorFiltro(p);
              }}
              placeholder="Buscar recepción..."
            />
          </div>

          <FiltroEstado
            valor={filtroEstado}
            onChange={setFiltroEstado}
            opciones={[
              { valor: "PENDIENTE", etiqueta: "Pendientes" },
              { valor: "COMPLETA", etiqueta: "Completas" },
              { valor: "CANCELADA", etiqueta: "Canceladas" },
            ]}
          />

          <button className="btn-primary" onClick={() => setShowForm(true)}>
            Nueva Recepción
          </button>
        </div>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <TablaRecepciones
          recepciones={recepcionesFiltradas}
          onCancelar={cancelarRecepcion}
        />
      )}

      {/* MODAL NUEVA RECEPCIÓN */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Nueva Recepción</h2>

            <form
              className="form-recepcion"
              onSubmit={(e) => {
                e.preventDefault();
                handleGuardar();
              }}
            >
              <ProductorComboBox
                productores={productores}
                value={form.productor.idProductor}
                onChange={(idProductor) =>
                  setForm({
                    ...form,
                    productor: { idProductor },
                    cafetal: { idCafetal: "" },
                  })
                }
                placeholder="Selecciona productor"
                id="recepcion-productor"
              />

              <select
                value={form.cafetal.idCafetal}
                onChange={(e) =>
                  setForm({
                    ...form,
                    cafetal: { idCafetal: e.target.value },
                  })
                }
              >
                <option value="">Selecciona cafetal</option>
                {cafetalesFiltrados.map((c) => (
                  <option key={c.idCafetal} value={c.idCafetal}>
                    Parcela {c.numParcela} - {c.ubicacion}
                  </option>
                ))}
              </select>

              <select
                value={form.empleado.idEmpleado}
                onChange={(e) =>
                  setForm({
                    ...form,
                    empleado: { idEmpleado: e.target.value },
                  })
                }
              >
                <option value="">Selecciona empleado</option>
                {empleados.map((emp) => (
                  <option key={emp.idEmpleado} value={emp.idEmpleado}>
                    {emp.nombre} {emp.apellido}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Peso inicial"
                value={form.pesoInicial}
                onChange={(e) =>
                  setForm({ ...form, pesoInicial: e.target.value })
                }
              />

              

              <textarea
                placeholder="Observaciones"
                value={form.observaciones}
                onChange={(e) =>
                  setForm({ ...form, observaciones: e.target.value })
                }
              />

              <div className="form-actions">
                <button type="submit" className="btn-primary">
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

export default Recepciones;
