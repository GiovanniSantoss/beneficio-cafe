import { Component, useEffect, useRef, useState } from "react";
import { sileo } from "sileo";
import {
  MapContainer,
  TileLayer,
  LayersControl,
  Marker,
  GeoJSON,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import area from "@turf/area";
import centroid from "@turf/centroid";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
// Ícono explícito: evita la imagen rota del marcador por defecto al usar bundlers
const iconoMarcador = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const CENTRO_DEFAULT = [19.2, -96.9]; // Ajusta a tu región
const ESTILO_POLIGONO = { color: "#facc15", weight: 3, fillOpacity: 0.2 };
const redondear = (n) => Number(Number(n).toFixed(6));
const hayValor = (v) => v !== null && v !== undefined && v !== "";

/**
 * Props:
 *  value:    objeto con { latitud, longitud, poligono, areaTotalHa } (puede ser el form completo)
 *  onChange: (parcial) => void   -> recibe SOLO los campos que cambiaron
 *  readOnly: true para solo visualizar (tabla/detalle)
 *  height:   alto del mapa
 */
function MapaCafetalInterno({
  value = {},
  onChange = () => {},
  readOnly = false,
  height = 380,
}) {
  const { latitud, longitud, poligono, areaTotalHa } = value;
  const lat = Number(latitud);
  const lng = Number(longitud);
  const tienePunto =
    hayValor(latitud) && hayValor(longitud) && Number.isFinite(lat) && Number.isFinite(lng);
  const posicion = tienePunto ? [lat, lng] : null;

  // Mantiene siempre el valor más reciente para los handlers de Geoman
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  });

  // Instancia de Leaflet, para que la barra (fuera del mapa) pueda controlarlo
  const [mapa, setMapa] = useState(null);

  return (
    <div
      style={{
        width: "100%",
        height,
        minHeight: height === "100%" ? 0 : height,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {!readOnly && (
        <div style={{ flex: "0 0 auto" }}>
          <BarraHerramientas
            mapa={mapa}
            tienePoligono={Boolean(poligono)}
            onPunto={(lat, lng) =>
              onChange({ latitud: redondear(lat), longitud: redondear(lng) })
            }
          />
        </div>
      )}

      <MapContainer
        ref={setMapa}
        center={posicion || CENTRO_DEFAULT}
        zoom={posicion ? 16 : 9}
        style={{ flex: "1 1 auto", minHeight: 0, width: "100%", borderRadius: 8 }}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Satélite">
            <TileLayer
              attribution="Tiles &copy; Esri"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Calles (OSM)">
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        <AjustarTamano />

        {posicion && (
          <Marker
            position={posicion}
            icon={iconoMarcador}
            draggable={!readOnly}
            eventHandlers={{
              dragend: (e) => {
                const { lat, lng } = e.target.getLatLng();
                onChange({ latitud: redondear(lat), longitud: redondear(lng) });
              },
            }}
          />
        )}

        {readOnly ? (
          poligono && <PoligonoLectura poligono={poligono} />
        ) : (
          <>
            <ClickParaMarcar
              onPunto={(lat, lng) =>
                onChange({ latitud: redondear(lat), longitud: redondear(lng) })
              }
            />
            <ControlesDibujo
              poligonoInicial={poligono}
              valueRef={valueRef}
              onChange={onChange}
            />
          </>
        )}
      </MapContainer>

      {!readOnly && (
        <p style={{ flex: "0 0 auto", fontSize: 13, margin: "6px 0 0" }}>
          {tienePunto
            ? `Coordenadas: ${latitud}, ${longitud}`
            : "Haz clic en el mapa para marcar la ubicación, o usa las herramientas de arriba para dibujar el terreno."}
          {hayValor(areaTotalHa) && ` · Superficie: ${areaTotalHa} ha`}
        </p>
      )}
    </div>
  );
}

/** Evita el mapa "cortado" cuando se monta dentro de un modal. */
function AjustarTamano() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 250);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

/** Modo lectura: dibuja el polígono y ajusta la vista. */
function PoligonoLectura({ poligono }) {
  const map = useMap();
  useEffect(() => {
    try {
      map.fitBounds(L.geoJSON(poligono).getBounds(), { padding: [30, 30] });
    } catch {
      /* geometría inválida: se ignora */
    }
  }, [map, poligono]);
  return <GeoJSON data={poligono} style={ESTILO_POLIGONO} />;
}

/** Clic en el mapa = coloca/mueve el marcador (si no se está dibujando/editando). */
function ClickParaMarcar({ onPunto }) {
  const map = useMap();
  useMapEvents({
    click(e) {
      if (
        map.pm.globalDrawModeEnabled() ||
        map.pm.globalEditModeEnabled() ||
        map.pm.globalRemovalModeEnabled()
      ) {
        return;
      }
      onPunto(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/** Herramientas de dibujo (Leaflet-Geoman). Un cafetal = un polígono. */
function ControlesDibujo({ poligonoInicial, valueRef, onChange }) {
  const map = useMap();
  const capaRef = useRef(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    map.pm.setLang("es");
    map.pm.setPathOptions(ESTILO_POLIGONO);

    const publicar = (layer) => {
      const geometry = layer.toGeoJSON().geometry;
      const ha = Number((area({ type: "Feature", geometry, properties: {} }) / 10000).toFixed(2));
      const parcial = { poligono: geometry, areaTotalHa: ha };

      // Si todavía no hay punto, usar el centro del polígono
      const actual = valueRef.current;
      if (!hayValor(actual.latitud) || !hayValor(actual.longitud)) {
        const [lng, lat] = centroid({ type: "Feature", geometry, properties: {} }).geometry.coordinates;
        parcial.latitud = redondear(lat);
        parcial.longitud = redondear(lng);
      }
      onChangeRef.current(parcial);
    };

    const registrar = (layer) => {
      capaRef.current = layer;
      layer.on("pm:edit", () => publicar(layer));
    };

    // Cargar polígono existente (edición)
    if (poligonoInicial) {
      try {
        const layer = L.geoJSON(poligonoInicial, { style: ESTILO_POLIGONO }).getLayers()[0];
        layer.addTo(map);
        registrar(layer);
        map.fitBounds(layer.getBounds(), { padding: [30, 30] });
      } catch {
        /* geometría inválida: se ignora */
      }
    }

    const onCreate = (e) => {
      if (e.shape === "Marker") return;
      if (capaRef.current) map.removeLayer(capaRef.current);
      registrar(e.layer);
      publicar(e.layer);
    };
    const onRemove = (e) => {
      if (e.layer === capaRef.current) {
        capaRef.current = null;
        onChangeRef.current({ poligono: null, areaTotalHa: "" });
      }
    };

    map.on("pm:create", onCreate);
    map.on("pm:remove", onRemove);

    return () => {
      map.off("pm:create", onCreate);
      map.off("pm:remove", onRemove);
      try {
        map.pm.disableDraw();
        map.pm.disableGlobalEditMode();
        map.pm.disableGlobalRemovalMode();
        if (capaRef.current) map.removeLayer(capaRef.current);
      } catch {
        /* el mapa ya se destruyó */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  return null;
}

/**
 * Barra de herramientas FUERA del mapa: búsqueda, "mi ubicación" y dibujo del terreno.
 * Controla el mapa mediante su instancia (mapa) y la API de Leaflet-Geoman.
 */
const PAIS = "mx"; // restringe la búsqueda a un país; usa "" para buscar en todo el mundo

const estiloBoton = {
  width: "auto",
  margin: 0,
  padding: "7px 14px",
  background: "#fff",
  color: "#374151",
  border: "1px solid #d1d5db",
  borderRadius: 999,
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 500,
  whiteSpace: "nowrap",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  transition: "background 0.15s ease, border-color 0.15s ease",
};
const estiloBotonActivo = {
  ...estiloBoton,
  background: "#5c381e",
  color: "#fff",
  borderColor: "#5c381e",
};
const estiloDeshabilitado = { opacity: 0.45, cursor: "not-allowed" };

const HERRAMIENTAS = [
  { id: "Polygon", etiqueta: "Dibujar terreno", icono: "✏️" },
  { id: "Rectangle", etiqueta: "Rectángulo", icono: "▭" },
  { id: "Edit", etiqueta: "Editar vértices", icono: "✎", requierePoligono: true },
  { id: "Remove", etiqueta: "Borrar terreno", icono: "🗑️", requierePoligono: true },
];

const AYUDA = {
  Polygon:
    "Haz clic para colocar cada vértice del terreno y ciérralo haciendo clic en el primer punto.",
  Rectangle: "Haz clic en una esquina y luego en la esquina opuesta.",
  Edit: "Arrastra los vértices para ajustar el terreno. Vuelve a pulsar «Editar vértices» para terminar.",
  Remove: "Haz clic sobre el terreno dibujado para borrarlo.",
};

function BarraHerramientas({ mapa, tienePoligono, onPunto }) {
  const [texto, setTexto] = useState("");
  const [resultados, setResultados] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [modo, setModo] = useState(null); // null | Polygon | Rectangle | Edit | Remove

  // Mantener sincronizado el botón activo con el estado real de Geoman
  useEffect(() => {
    if (!mapa) return;
    const alDibujar = (e) =>
      setModo((m) => (e.enabled ? e.shape : m === e.shape ? null : m));
    const alEditar = (e) => setModo((m) => (e.enabled ? "Edit" : m === "Edit" ? null : m));
    const alBorrar = (e) => setModo((m) => (e.enabled ? "Remove" : m === "Remove" ? null : m));

    mapa.on("pm:globaldrawmodetoggled", alDibujar);
    mapa.on("pm:globaleditmodetoggled", alEditar);
    mapa.on("pm:globalremovalmodetoggled", alBorrar);
    return () => {
      mapa.off("pm:globaldrawmodetoggled", alDibujar);
      mapa.off("pm:globaleditmodetoggled", alEditar);
      mapa.off("pm:globalremovalmodetoggled", alBorrar);
    };
  }, [mapa]);

  // Aviso del modo activo como toast interactivo (sticky, con botón "Entendido").
  // Se apoya en Sileo (portal flotante) para NO robarle alto al mapa.
  const toastIdRef = useRef(null);
  useEffect(() => {
    if (toastIdRef.current) {
      sileo.dismiss(toastIdRef.current);
      toastIdRef.current = null;
    }
    if (!modo) return;

    toastIdRef.current = sileo.action({
      title: `Modo: ${HERRAMIENTAS.find((h) => h.id === modo)?.etiqueta ?? modo}`,
      description: AYUDA[modo],
      duration: null, // sticky: se queda hasta que el usuario lo cierre
      button: {
        title: "Entendido",
        onClick: () => sileo.dismiss(toastIdRef.current),
      },
    });

    return () => {
      if (toastIdRef.current) {
        sileo.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
    };
  }, [modo]);

  const apagarHerramientas = () => {
    mapa.pm.disableDraw();
    mapa.pm.disableGlobalEditMode();
    mapa.pm.disableGlobalRemovalMode();
  };

  const alternar = (herramienta) => {
    if (!mapa) return;
    const estabaActiva = modo === herramienta;
    apagarHerramientas();
    if (estabaActiva) return;
    if (herramienta === "Edit") mapa.pm.enableGlobalEditMode();
    else if (herramienta === "Remove") mapa.pm.enableGlobalRemovalMode();
    else mapa.pm.enableDraw(herramienta);
  };

  const irA = (lat, lng, zoom = 17) => {
    mapa.flyTo([lat, lng], zoom);
    onPunto(lat, lng);
  };

  const buscar = async () => {
    const q = texto.trim();
    if (!q || !mapa) return;
    setCargando(true);
    setMensaje("");
    setResultados([]);
    try {
      const params = new URLSearchParams({
        format: "jsonv2",
        limit: "5",
        q,
        "accept-language": "es",
      });
      if (PAIS) params.set("countrycodes", PAIS);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
      if (!res.ok) throw new Error("Error de búsqueda");
      const data = await res.json();

      if (data.length === 0) {
        setMensaje("Sin resultados. Prueba con otro nombre, dirección o coordenadas.");
      } else if (data.length === 1) {
        irA(Number(data[0].lat), Number(data[0].lon));
      } else {
        setResultados(data);
      }
    } catch {
      setMensaje("No se pudo realizar la búsqueda. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  const usarMiUbicacion = () => {
    if (!mapa) return;
    if (!navigator.geolocation) {
      setMensaje("Tu navegador no soporta geolocalización.");
      return;
    }
    setResultados([]);
    setMensaje("Obteniendo ubicación...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        irA(latitude, longitude, 18);
        setMensaje(`Ubicación obtenida (precisión ±${Math.round(accuracy)} m)`);
      },
      (err) =>
        setMensaje(
          err.code === 1
            ? "Permiso de ubicación denegado. Actívalo en el navegador."
            : "No se pudo obtener la ubicación.",
        ),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  return (
    <div style={{ marginBottom: 8, fontSize: 13 }}>
      {/* Fila 1: búsqueda y ubicación */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <input
          type="text"
          value={texto}
          placeholder="Buscar lugar, dirección o coordenadas..."
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            // Evita que Enter envíe el formulario del cafetal
            if (e.key === "Enter") {
              e.preventDefault();
              buscar();
            }
          }}
          style={{
            flex: "1 1 220px",
            minWidth: 0,
            margin: 0,
            padding: "7px 12px",
            border: "1px solid #d1d5db",
            borderRadius: 999,
            fontSize: 13,
            outline: "none",
          }}
        />
        <button
          type="button"
          onClick={buscar}
          disabled={cargando || !mapa}
          style={{ ...estiloBoton, ...(!mapa ? estiloDeshabilitado : {}) }}
        >
          {cargando ? "Buscando…" : "Buscar"}
        </button>
        <button
          type="button"
          onClick={usarMiUbicacion}
          disabled={!mapa}
          title="Usar mi ubicación actual"
          style={{ ...estiloBoton, ...(!mapa ? estiloDeshabilitado : {}) }}
        >
          📍 Mi ubicación
        </button>
      </div>

      {resultados.length > 0 && (
        <ul
          style={{
            listStyle: "none",
            margin: "4px 0 0",
            padding: 0,
            background: "#fff",
            color: "#222",
            border: "1px solid #ccc",
            borderRadius: 4,
            maxHeight: 160,
            overflowY: "auto",
          }}
        >
          {resultados.map((r) => (
            <li
              key={r.place_id}
              onClick={() => {
                irA(Number(r.lat), Number(r.lon));
                setResultados([]);
              }}
              style={{ padding: "6px 8px", cursor: "pointer", borderBottom: "1px solid #eee" }}
            >
              {r.display_name}
            </li>
          ))}
        </ul>
      )}

      {mensaje && <div style={{ marginTop: 4 }}>{mensaje}</div>}

      {/* Fila 2: herramientas de dibujo del terreno */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
        {HERRAMIENTAS.map((h) => {
          const deshabilitada = !mapa || (h.requierePoligono && !tienePoligono);
          return (
            <button
              key={h.id}
              type="button"
              disabled={deshabilitada}
              onClick={() => alternar(h.id)}
              style={{
                ...(modo === h.id ? estiloBotonActivo : estiloBoton),
                ...(deshabilitada ? estiloDeshabilitado : {}),
              }}
            >
              <span aria-hidden="true">{h.icono}</span>
              {h.etiqueta}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Evita que un error del mapa deje toda la pantalla en blanco. */
class MapaErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Error en MapaCafetal:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            padding: 12,
            border: "1px solid #dc2626",
            borderRadius: 8,
            background: "#fef2f2",
            color: "#7f1d1d",
            fontSize: 13,
          }}
        >
          <b>No se pudo cargar el mapa.</b>
          <div style={{ marginTop: 4 }}>{String(this.state.error?.message || this.state.error)}</div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function MapaCafetal(props) {
  return (
    <MapaErrorBoundary>
      <MapaCafetalInterno {...props} />
    </MapaErrorBoundary>
  );
}