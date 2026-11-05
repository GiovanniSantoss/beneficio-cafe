import { useCallback, useEffect, useState } from "react";
import Capa from "../components/Capa";
import ResumenInventario from "../components/ResumenInventario";
import GraficaEtapas from "../components/GraficaEtapas";
import TablaInventario from "../components/TablaInventario";
import DetalleInventario from "../components/DetalleInventario";
import "../styles/Inventario.css";

const API = "http://localhost:8080";

const FILTROS_INICIALES = {
  q: "",
  etapa: "TODAS",
  estado: "CON_STOCK",
  soloVendibles: false,
};

function EsqueletoResumen() {
  return (
    <div className="esqueleto-resumen" aria-hidden="true">
      <div className="esqueleto-kpis">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="esqueleto-bloque" />
        ))}
      </div>

      <div className="esqueleto-paneles">
        <div className="esqueleto-bloque esqueleto-alto" />
        <div className="esqueleto-bloque esqueleto-alto" />
      </div>
    </div>
  );
}

function Inventario() {
  const [resumen, setResumen] = useState(null);
  const [items, setItems] = useState([]);
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [qDebounced, setQDebounced] = useState("");

  const [loading, setLoading] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState(null);
  const [vista, setVista] = useState("graficas");

  const [detalle, setDetalle] = useState(null);

  // Evita consultar en cada tecla
  useEffect(() => {
    const t = setTimeout(() => setQDebounced(filtros.q), 300);
    return () => clearTimeout(t);
  }, [filtros.q]);

  const cargarResumen = useCallback(async () => {
    const res = await fetch(`${API}/inventario/resumen`);
    if (!res.ok) throw new Error("No se pudo cargar el resumen de inventario.");
    return res.json();
  }, []);

  const cargarListado = useCallback(async () => {
    const params = new URLSearchParams();

    if (filtros.etapa !== "TODAS") params.set("etapa", filtros.etapa);
    if (filtros.estado !== "TODOS") params.set("estado", filtros.estado);
    if (qDebounced.trim()) params.set("q", qDebounced.trim());
    if (filtros.soloVendibles) params.set("soloVendibles", "true");

    const res = await fetch(`${API}/inventario?${params.toString()}`);
    if (!res.ok) throw new Error("No se pudo cargar el inventario.");
    return res.json();
  }, [filtros.etapa, filtros.estado, filtros.soloVendibles, qDebounced]);

  const cargarTodo = useCallback(async () => {
    try {
      const [r, l] = await Promise.all([cargarResumen(), cargarListado()]);
      setResumen(r);
      setItems(l);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setActualizando(false);
    }
  }, [cargarResumen, cargarListado]);

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      try {
        const [r, l] = await Promise.all([cargarResumen(), cargarListado()]);

        if (!activo) return;

        setResumen(r);
        setItems(l);
        setError(null);
      } catch (e) {
        if (activo) setError(e.message);
      } finally {
        if (activo) {
          setLoading(false);
          setActualizando(false);
        }
      }
    };

    cargar();

    return () => {
      activo = false;
    };
  }, [cargarResumen, cargarListado]);

  const abrirDetalle = async (idLote) => {
    setDetalle({ idLote, data: null, loading: true, error: null });

    try {
      const res = await fetch(`${API}/inventario/lote/${idLote}`);
      if (!res.ok) throw new Error("No se pudo cargar el detalle del lote.");
      const data = await res.json();
      setDetalle({ idLote, data, loading: false, error: null });
    } catch (e) {
      setDetalle({ idLote, data: null, loading: false, error: e.message });
    }
  };

  const actualizar = () => {
    setActualizando(true);
    cargarTodo();
  };

  const limpiarFiltros = () => setFiltros(FILTROS_INICIALES);

  const alertas = resumen
    ? [
        {
          clave: "ubicacion",
          texto: `${resumen.lotesSinUbicacion} lote(s) sin ubicación principal`,
          activa: resumen.lotesSinUbicacion > 0,
        },
        {
          clave: "cancelados",
          texto: `${resumen.lotesCancelados} lote(s) cancelado(s)`,
          activa: resumen.lotesCancelados > 0,
        },
        {
          clave: "sin-inventario",
          texto: `${resumen.lotesSinInventario} lote(s) sin fila de inventario`,
          activa: resumen.lotesSinInventario > 0,
        },
        {
          clave: "agotados",
          texto: `${resumen.lotesAgotados} lote(s) agotado(s)`,
          activa: resumen.lotesAgotados > 0,
        },
      ]
    : [];

  const alertasActivas = alertas.filter((a) => a.activa);

  return (
    <div className="inventario-page">
      <div className="inventario-cabecera">
        <div>
          <h1 className="inventario-titulo">Inventario</h1>
          <p className="inventario-subtitulo">
            Control de existencias por etapa y lote
          </p>
        </div>

        <div className="inventario-cabecera-acciones">
          <div
            className="vista-pildora"
            data-vista={vista}
            role="group"
            aria-label="Cambiar vista de inventario"
          >
            <button
              type="button"
              aria-pressed={vista === "graficas"}
              onClick={() => setVista("graficas")}
            >
              Gráficas
            </button>
            <button
              type="button"
              aria-pressed={vista === "tabla"}
              onClick={() => setVista("tabla")}
            >
              Tabla
            </button>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={actualizar}
            disabled={actualizando}
          >
            {actualizando ? "Actualizando…" : "Actualizar"}
          </button>
        </div>
      </div>

      {error && (
        <div className="inventario-error" role="alert">
          <p>{error}</p>
          <button type="button" className="btn-primary" onClick={actualizar}>
            Reintentar
          </button>
        </div>
      )}

      {vista === "graficas" && (
        <Capa
          numero="01"
          titulo="Resumen general"
          subtitulo="Existencias actuales por etapa"
        >
          {loading ? (
            <EsqueletoResumen />
          ) : (
            <>
              <ResumenInventario resumen={resumen} />

              <div className="inventario-grid">
                <GraficaEtapas kgPorEtapa={resumen?.kgPorEtapa} />

                <section className="subseccion">
                  <h3 className="subseccion-titulo">Alertas</h3>

                  {alertasActivas.length === 0 ? (
                    <p className="alertas-ok">Sin alertas de inventario.</p>
                  ) : (
                    <ul className="alertas-lista">
                      {alertasActivas.map((a) => (
                        <li key={a.clave} className="alerta-activa">
                          {a.texto}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            </>
          )}
        </Capa>
      )}

      {vista === "tabla" && (
        <Capa
          numero="02"
          titulo="Existencias por lote"
          subtitulo="Filtra y revisa el stock de cada lote"
          flush
          acciones={
            <span className="inventario-contador">
              Mostrando {items.length} de {resumen?.lotesTotales ?? 0} lotes
            </span>
          }
        >
          <div className="capa-toolbar">
            <input
              className="search-input"
              type="text"
              aria-label="Buscar lote, productor, parcela o ubicación"
              placeholder="Buscar lote, productor, parcela o ubicación…"
              value={filtros.q}
              onChange={(e) => setFiltros({ ...filtros, q: e.target.value })}
            />

            <select
              aria-label="Filtrar por etapa"
              value={filtros.etapa}
              onChange={(e) => setFiltros({ ...filtros, etapa: e.target.value })}
            >
              <option value="TODAS">Todas las etapas</option>
              <option value="CEREZA">Cereza</option>
              <option value="PERGAMINO">Pergamino</option>
              <option value="ORO">Oro</option>
            </select>

            <select
              aria-label="Filtrar por estado"
              value={filtros.estado}
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
            >
              <option value="CON_STOCK">Con stock</option>
              <option value="VENDIBLE">Vendible</option>
              <option value="EN_PROCESO">En proceso</option>
              <option value="AGOTADO">Agotado</option>
              <option value="CANCELADO">Cancelado</option>
              <option value="SIN_INVENTARIO">Sin inventario</option>
              <option value="TODOS">Todos</option>
            </select>

            <label className="inventario-check">
              <input
                type="checkbox"
                checked={filtros.soloVendibles}
                onChange={(e) =>
                  setFiltros({ ...filtros, soloVendibles: e.target.checked })
                }
              />
              Solo ORO vendible
            </label>

            <button type="button" className="btn-clear" onClick={limpiarFiltros}>
              Limpiar
            </button>
          </div>

          {loading ? (
            <div className="capa-esqueleto-tabla" aria-hidden="true">
              <div className="esqueleto-bloque esqueleto-tabla" />
            </div>
          ) : (
            <TablaInventario items={items} onVerDetalle={abrirDetalle} />
          )}
        </Capa>
      )}

      <DetalleInventario detalle={detalle} onCerrar={() => setDetalle(null)} />
    </div>
  );
}

export default Inventario;
