import { useEffect, useMemo, useState } from "react";
import TablaProcesos from "../components/TablaProcesos";
import FiltroEstado from "../components/FiltroEstado";
import BuscadorProductores from "../components/BuscadorProductores";
import { normalizar } from "../utils/texto";
//import ModalProcesar from "../components/TablaProcesos";

export default function Procesos() {
  const [lotes, setLotes] = useState([]);
  const [loteSeleccionado, setLoteSeleccionado] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("PENDIENTE");
  const [filtroEtapa, setFiltroEtapa] = useState("TODAS");
  const [fecha, setFecha] = useState(""); // "YYYY-MM-DD" o "" = sin filtro
  const [busqueda, setBusqueda] = useState("");
  // Productor elegido desde las sugerencias: filtra exacto por id
  const [productorFiltro, setProductorFiltro] = useState(null);


const [pesoResultante, setPesoResultante] = useState("");
const [observaciones, setObservaciones] = useState("");

const [loading, setLoading] = useState(true);

  const cargarLotes = async () => {
  try {
    const r = await fetch("http://localhost:8080/lotes");
    const data = await r.json();

    setLotes(data);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
    cargarLotes();
  }, []);

  const guardarProceso = async () => {
  try {
    const body = {
      lote: {
        idLote: loteSeleccionado.idLote,
      },
      empleado: {
        idEmpleado: 1,
      },
      tipoProceso:
        loteSeleccionado.estadoCafe === "CEREZA"
          ? "DESPULPADO"
          : "SECADO",
      pesoResultante: Number(pesoResultante),
      observaciones: observaciones,
    };

    const response = await fetch(
      "http://localhost:8080/procesos",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      alert(error);
      return;
    }

    alert("Proceso registrado correctamente");

    setLoteSeleccionado(null);
    setPesoResultante("");
    setObservaciones("");

    await cargarLotes();

  } catch (error) {
    console.error(error);
    alert("Error al registrar el proceso");
  }
};

  // Productores únicos que aparecen en los lotes cargados (sin fetch extra)
  const productores = useMemo(() => {
    const mapa = new Map();

    lotes.forEach((l) => {
      const p = l.recepcion?.productor;
      if (p?.idProductor != null) mapa.set(p.idProductor, p);
    });

    return [...mapa.values()];
  }, [lotes]);

  const lotesFiltrados = lotes
    .filter((l) => filtroEstado === "TODOS" || l.estado === filtroEstado)
    .filter((l) => filtroEtapa === "TODAS" || l.estadoCafe === filtroEtapa)
    .filter((l) => {
      // Si se eligió una sugerencia, filtrar exactamente por ese productor
      if (productorFiltro) {
        return (
          l.recepcion?.productor?.idProductor === productorFiltro.idProductor
        );
      }

      const q = normalizar(busqueda).trim();
      if (!q) return true;

      return normalizar(
        `${l.recepcion?.productor?.nombre ?? ""} ${l.recepcion?.productor?.apellido ?? ""}`,
      ).includes(q);
    })
    .filter((l) => {
      if (!fecha) return true;

      // Mismo criterio que Recepciones: día local de la fecha de recepción
      const d = new Date(l.recepcion?.fechaHora);
      if (Number.isNaN(d.getTime())) return false;

      const local = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return local === fecha;
    });

  return (
    <div>
      <div className="header-productores">
        <h2>Procesos</h2>

        <div className="header-actions">
          <input
            type="date"
            className="date-input"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            aria-label="Filtrar por fecha de recepción"
          />

          <select
            className="select-filtro"
            value={filtroEtapa}
            onChange={(e) => setFiltroEtapa(e.target.value)}
            aria-label="Filtrar por etapa del café"
          >
            <option value="TODAS">Todas las etapas</option>
            <option value="CEREZA">Cereza</option>
            <option value="PERGAMINO">Pergamino</option>
            <option value="ORO">Oro</option>
          </select>

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
            placeholder="Buscar productor..."
          />

          <FiltroEstado
            valor={filtroEstado}
            onChange={setFiltroEstado}
            opciones={[
              { valor: "PENDIENTE", etiqueta: "Pendientes" },
              { valor: "PROCESADO", etiqueta: "Procesados" },
              { valor: "TODOS", etiqueta: "Todos" },
            ]}
          />
        </div>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <TablaProcesos
          lotes={lotesFiltrados}
          onProcesar={setLoteSeleccionado}
        />
      )}

      {loteSeleccionado && (
  <div className="modal-overlay">
    <div className="modal">

      <h2>Procesar Lote</h2>

      <form
        className="form-recepcion"
        onSubmit={(e) => {
          e.preventDefault();
          guardarProceso();
        }}
      >

        <input
          type="text"
          value={loteSeleccionado.idLote}
          disabled
        />

        <input
          type="text"
          value={loteSeleccionado.estadoCafe}
          disabled
        />

        <input
          type="number"
          placeholder="Peso resultante"
          value={pesoResultante}
          onChange={(e) =>
            setPesoResultante(e.target.value)
          }
        />

        <textarea
          placeholder="Observaciones"
          value={observaciones}
          onChange={(e) =>
            setObservaciones(e.target.value)
          }
        />

        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
          >
            Guardar
          </button>

          <button
            type="button"
            className="btn-cancel"
            onClick={() => setLoteSeleccionado(null)}
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