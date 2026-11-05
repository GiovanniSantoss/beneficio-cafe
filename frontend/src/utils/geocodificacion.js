const ULTIMA_AUTO_KEY = "__ultimaUbicacionAuto__";

function formatearDireccion(data = {}) {
  const addr = data.address || {};
  const partes = [];

  // Dirección más precisa primero
  if (addr.road) partes.push(addr.road);
  else if (addr.pedestrian) partes.push(addr.pedestrian);
  else if (addr.footway) partes.push(addr.footway);
  else if (addr.neighbourhood) partes.push(addr.neighbourhood);

  // Localidad / colonia / pueblo
  if (addr.suburb) partes.push(addr.suburb);
  else if (addr.village) partes.push(addr.village);
  else if (addr.town) partes.push(addr.town);
  else if (addr.city) partes.push(addr.city);
  else if (addr.municipality) partes.push(addr.municipality);

  // Estado opcional (solo si queda corto)
  if (partes.length > 0 && addr.state) {
    // Evita duplicados
    if (!partes.includes(addr.state)) {
      partes.push(addr.state);
    }
  }

  let resultado = partes.join(", ");
  if (!resultado && data.display_name) {
    // Tomar solo los primeros 3 fragmentos del display_name
    resultado = data.display_name.split(",").slice(0, 3).join(",").trim();
  }

  // Limitar a lo que soporta el campo (150 chars)
  if (resultado.length > 150) {
    resultado = resultado.slice(0, 147).trim() + "...";
  }
  return resultado;
}

export async function obtenerUbicacion(lat, lng, { signal } = {}) {
  if (lat == null || lng == null) return "";
  try {
    const params = new URLSearchParams({
      format: "jsonv2",
      lat: String(lat),
      lon: String(lng),
      zoom: "18",
      "accept-language": "es",
    });
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
      headers: {
        "User-Agent": "beneficio-cafe/1.0",
      },
      signal,
    });
    if (!res.ok) return "";
    const data = await res.json();
    return formatearDireccion(data);
  } catch {
    return "";
  }
}

export function marcarComoAutoGenerado(valor) {
  return `${valor}${ULTIMA_AUTO_KEY}`;
}

export function esAutoGenerado(valor) {
  return typeof valor === "string" && valor.endsWith(ULTIMA_AUTO_KEY);
}

export function limpiarMarcaAuto(valor) {
  if (typeof valor !== "string") return valor;
  return valor.replace(ULTIMA_AUTO_KEY, "");
}

export function obtenerValorAuto(valor) {
  return limpiarMarcaAuto(valor);
}
