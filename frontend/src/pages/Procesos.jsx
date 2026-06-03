import { useEffect, useState } from "react";
import TablaProcesos from "../components/TablaProcesos";
//import ModalProcesar from "../components/TablaProcesos";

export default function Procesos() {
  const [lotes, setLotes] = useState([]);
  const [loteSeleccionado, setLoteSeleccionado] = useState(null);


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
  

  return (
    <div>
      <div className="header-productores">
        <h2>Procesos</h2>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <TablaProcesos
          lotes={lotes}
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