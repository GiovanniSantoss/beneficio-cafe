// Normaliza texto para comparar sin distinguir mayúsculas ni acentos
// ("Pérez" y "perez" se consideran iguales)
export const normalizar = (texto) =>
  (texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
