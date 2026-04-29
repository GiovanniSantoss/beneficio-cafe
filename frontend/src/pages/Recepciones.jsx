import { useEffect, useState } from "react";
import TablaRecepciones from "../components/TablaRecepciones";

function Recepciones() {
  const [recepciones, setRecepciones] = useState([]);
  const [productores, setProductores] = useState([]);
  const [cafetales, setCafetales] = useState([]);
  const [empleados, setEmpleados] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [showFinalizar, setShowFinalizar] = useState(false);

  const [recepcionSeleccionada, setRecepcionSeleccionada] = useState(null);

  const [pesoFinalEdit, setPesoFinalEdit] = useState("");
  const [obsEdit, setObsEdit] = useState("");

  const [loading, setLoading] = useState(true);

  const estadoInicial = {
    productor: { idProductor: "" },
    cafetal: { idCafetal: "" },
    empleado: { idEmpleado: "" },
    pesoInicial: "",
    pesoFinal: "",
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
      empleado: form.empleado.idEmpleado
        ? { idEmpleado: Number(form.empleado.idEmpleado) }
        : null,
      pesoInicial: Number(form.pesoInicial),
      pesoFinal: form.pesoFinal ? Number(form.pesoFinal) : null,
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
  const handleFinalizar = (r) => {
    setRecepcionSeleccionada(r);
    setPesoFinalEdit("");
    setObsEdit("");
    setShowFinalizar(true);
  };

  //  GUARDAR FINALIZACIÓN
  const guardarFinalizacion = async () => {
    await fetch(
      `http://localhost:8080/recepciones/${recepcionSeleccionada.idRecepcion}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pesoFinal: Number(pesoFinalEdit),
          observaciones: obsEdit,
        }),
      },
    );

    setShowFinalizar(false);
    await cargarTodo();
  };

  return (
    <div>
      <div className="header-productores">
        <h2>Recepciones</h2>

        <button className="btn-primary" onClick={() => setShowForm(true)}>
          Nueva Recepción
        </button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <TablaRecepciones
          recepciones={recepciones}
          onFinalizar={handleFinalizar}
        />
      )}

      {/* MODAL NUEVA RECEPCIÓN */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Nueva Recepción</h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleGuardar();
              }}
            >
              <select
                value={form.productor.idProductor}
                onChange={(e) =>
                  setForm({
                    ...form,
                    productor: { idProductor: e.target.value },
                    cafetal: { idCafetal: "" },
                  })
                }
              >
                <option value="">Selecciona productor</option>
                {productores.map((p) => (
                  <option key={p.idProductor} value={p.idProductor}>
                    {p.nombre} {p.apellido}
                  </option>
                ))}
              </select>

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

              <input
                type="number"
                placeholder="Peso final (opcional)"
                value={form.pesoFinal}
                onChange={(e) =>
                  setForm({ ...form, pesoFinal: e.target.value })
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
                <button type="button" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/*  MODAL FINALIZAR */}
      {showFinalizar && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Finalizar Recepción</h2>

            <input
              type="number"
              placeholder="Peso final"
              value={pesoFinalEdit}
              onChange={(e) => setPesoFinalEdit(e.target.value)}
            />

            <textarea
              placeholder="Observaciones"
              value={obsEdit}
              onChange={(e) => setObsEdit(e.target.value)}
            />

            <div className="form-actions">
              <button onClick={guardarFinalizacion} className="btn-primary">
                Guardar
              </button>

              <button onClick={() => setShowFinalizar(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Recepciones;
