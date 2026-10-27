import { useEffect, useMemo, useRef, useState } from "react";
import { normalizar } from "../utils/texto";

const etiqueta = (p) => `${p.nombre ?? ""} ${p.apellido ?? ""}`.trim();

// Resalta la parte del nombre que coincide con la búsqueda
function resaltar(texto, consulta) {
  const q = normalizar(consulta).trim();
  if (!q) return texto;

  // normalize() conserva la longitud, así que los índices sirven sobre el texto original
  const indice = normalizar(texto).indexOf(q);
  if (indice === -1) return texto;

  return (
    <>
      {texto.slice(0, indice)}
      <mark className="combo-mark">{texto.slice(indice, indice + q.length)}</mark>
      {texto.slice(indice + q.length)}
    </>
  );
}

function BuscadorProductores({
  productores = [],
  value,
  onChange,
  onSelect,
  placeholder = "Buscar productor…",
}) {
  const [abierto, setAbierto] = useState(false);
  const [resaltado, setResaltado] = useState(-1);

  const raizRef = useRef(null);
  const inputRef = useRef(null);
  const listaRef = useRef(null);

  // Sugerencias: solo cuando hay texto escrito
  const sugerencias = useMemo(() => {
    const q = normalizar(value).trim();
    if (!q) return [];

    return productores
      .filter((p) => normalizar(etiqueta(p)).includes(q))
      .slice(0, 8);
  }, [productores, value]);

  const visible = abierto && sugerencias.length > 0;

  // Cerrar al hacer click fuera
  useEffect(() => {
    if (!abierto) return;

    const fuera = (e) => {
      if (!raizRef.current?.contains(e.target)) setAbierto(false);
    };

    document.addEventListener("mousedown", fuera);
    return () => document.removeEventListener("mousedown", fuera);
  }, [abierto]);

  // Mantener visible la sugerencia navegada con el teclado
  useEffect(() => {
    if (!visible || resaltado < 0) return;

    listaRef.current
      ?.querySelector(`[data-index="${resaltado}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [visible, resaltado]);

  const seleccionar = (p) => {
    onSelect(p);
    setAbierto(false);
    setResaltado(-1);
  };

  const handleKeyDown = (e) => {
    if (!visible) {
      if (e.key === "Escape") setAbierto(false);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setResaltado((i) => Math.min(i + 1, sugerencias.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setResaltado((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (sugerencias[resaltado]) {
        e.preventDefault();
        seleccionar(sugerencias[resaltado]);
      }
    } else if (e.key === "Escape") {
      setAbierto(false);
      inputRef.current?.blur();
    } else if (e.key === "Tab") {
      setAbierto(false);
    }
  };

  return (
    <div className="buscador-productores" ref={raizRef}>
      <input
        ref={inputRef}
        type="text"
        className="search-input"
        role="combobox"
        autoComplete="off"
        aria-expanded={visible}
        aria-controls="buscador-productores-lista"
        aria-autocomplete="list"
        aria-activedescendant={
          visible && resaltado >= 0
            ? `buscador-productor-${resaltado}`
            : undefined
        }
        placeholder={placeholder}
        value={value}
        onFocus={() => setAbierto(true)}
        onKeyDown={handleKeyDown}
        onChange={(e) => {
          onChange(e.target.value);
          setResaltado(0);
          setAbierto(true);
        }}
      />

      {visible && (
        <ul
          id="buscador-productores-lista"
          ref={listaRef}
          className="combo-productor-lista"
          role="listbox"
        >
          {sugerencias.map((p, i) => (
            <li
              key={p.idProductor}
              id={`buscador-productor-${i}`}
              data-index={i}
              role="option"
              aria-selected={i === resaltado}
              className={i === resaltado ? "resaltado" : ""}
              onMouseDown={(e) => e.preventDefault()} // evita que el blur cierre antes del click
              onMouseEnter={() => setResaltado(i)}
              onClick={() => seleccionar(p)}
            >
              {resaltar(etiqueta(p), value)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default BuscadorProductores;
