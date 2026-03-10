import { useEffect, useState } from "react";
import TablaProductores from "../components/TablaProductores";



function Productores() {
  const [productores, setProductores] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editarId, setEditarId] = useState(null);
  const [errores, setErrores] = useState({});

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
    estado: ""
  };

  const [formProductor, setFormProductor] = useState(estadoInicial);

  // Cargar productores
  useEffect(() => {
    const cargarProductores = async () => {
      try {
        const res = await fetch("http://localhost:8080/productores");

        if (!res.ok) throw new Error("Error al obtener productores");

        const data = await res.json();

        if (Array.isArray(data)) {
          setProductores(data);
        } else {
          console.error("La API no devolvió un array:", data);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    cargarProductores();
  }, []);

  // Validación básica
  const validar = () => {
    const e = {};

    if (!formProductor.rfc) e.rfc = "RFC es obligatorio";
    if (!formProductor.nombre) e.nombre = "Nombre es obligatorio";
    if (!formProductor.apellido) e.apellido = "Apellido es obligatorio";

    setErrores(e);
    return Object.keys(e).length === 0;
  };

  // Limpia campos vacíos -> null
  const limpiarDatos = (obj) => {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, v === "" ? null : v])
    );
  };

  // Guardar / actualizar productor
  const handleGuardar = async () => {

    if (!validar()) return;
    console.log("FORM ENVIADO:", formProductor);

    const data = limpiarDatos(formProductor);

    const url = editarId
      ? `http://localhost:8080/productores/${editarId}`
      : "http://localhost:8080/productores";

    const method = editarId ? "PUT" : "POST";

    try {

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      const nuevo = await res.json();

      if (editarId) {
        setProductores(prev =>
          prev.map(p => p.idProductor === editarId ? nuevo : p)
        );
      } else {
        setProductores(prev => [...prev, nuevo]);
      }

      setShowForm(false);
      setEditarId(null);
      setFormProductor(estadoInicial);
      setErrores({});

    } catch (err) {
      console.error(err);
      alert("Error al guardar productor");
    }
  };

  // Eliminar productor
  const handleEliminar = async (id) => {
    try {

      await fetch(`http://localhost:8080/productores/${id}`, { method: "DELETE" });

      setProductores(prev =>
        prev.map(p => p.idProductor === id ? { ...p, activo: false } : p)
      );

    } catch (err) {
      console.error(err);
    }
  };

  // Editar productor
  const handleEditar = (productor) => {
    setEditarId(productor.idProductor);
    setFormProductor(productor);
    setShowForm(true);
  };

  return (
    <div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Lista de Productores</h2>
       <button 
        className="btn-primary"
        onClick={() => { setShowForm(true); setEditarId(null); }}
      >
        Nuevo Productor
      </button>
      </div>

      {loading ? (
        <p>Cargando productores...</p>
      ) : (

        <table border="1" style={{ width: "100%", marginTop: "10px" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>RFC</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Teléfono</th>
              <th>Tipo</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {Array.isArray(productores) && productores.map(p => (
              <tr key={p.idProductor}>
                <td>{p.idProductor}</td>
                <td>{p.rfc}</td>
                <td>{p.nombre}</td>
                <td>{p.apellido}</td>
                <td>{p.telefono}</td>
                <td>{p.tipoSocio}</td>
                <td>{p.activo ? "Sí" : "No"}</td>
                <td className="actions">
                <button 
                  className="btn-edit"
                  onClick={() => handleEditar(p)}
                >
                  Editar
                </button>

                <button 
                  className="btn-delete"
                  onClick={() => handleEliminar(p.idProductor)}
                >
                  Eliminar
                </button>
              </td>
              </tr>
            ))}
          </tbody>

        </table>

      )}

      {showForm && (

        <div style={{ marginTop: "20px", border: "1px solid #ccc", padding: "10px" }}>

          <h3>{editarId ? "Editar Productor" : "Crear Nuevo Productor"}</h3>

          {["rfc", "nombre", "apellido", "telefono", "comunidad", "localidad", "estado"].map(campo => (
            <div key={campo} style={{ marginBottom: "8px" }}>
              <input
                type="text"
                placeholder={campo.charAt(0).toUpperCase() + campo.slice(1)}
                value={formProductor[campo] || ""}
                onChange={e =>
                  setFormProductor({
                    ...formProductor,
                    [campo]: e.target.value
                  })
                }
              />
              {errores[campo] && <div style={{ color: "red" }}>{errores[campo]}</div>}
            </div>
          ))}

          <div style={{ marginBottom: "8px" }}>
            <label>Género</label>
            <select
              value={formProductor.genero || ""}
              onChange={e =>
                setFormProductor({
                  ...formProductor,
                  genero: e.target.value
                })
              }
            >
              <option value="">Seleccione género</option>
              <option value="MASCULINO">Masculino</option>
              <option value="FEMENINO">Femenino</option>
              
            </select>
          </div>

          <div style={{ marginTop: "10px" }}>
            <button onClick={handleGuardar}>
              {editarId ? "Actualizar" : "Guardar"}
            </button>

            <button
              onClick={() => setShowForm(false)}
              style={{ marginLeft: "10px" }}
            >
              Cancelar
            </button>
          </div>

        </div>
      )}

    </div>
  );
}

export default Productores;