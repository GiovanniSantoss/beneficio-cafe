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

function ProductorComboBox({
  productores = [],
  value,
  onChange,
  placeholder = "Seleccione productor",
  disabled = false,
  id = "combo-productor",
  name = "idProductor",
}) {
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState("");
  const [resaltado, setResaltado] = useState(-1);

  const raizRef = useRef(null);
  const inputRef = useRef(null);
  const listaRef = useRef(null);

  const seleccionado = productores.find(
    (p) => String(p.idProductor) === String(value ?? ""),
  );

  // ==== FILTRO ====
  const opciones = useMemo(() => {
    const q = normalizar(texto).trim();
    if (!q) return productores; // sin texto: lista completa
    return productores.filter((p) => normalizar(etiqueta(p)).includes(q));
  }, [productores, texto]);

  // Cerrar al hacer click fuera
  useEffect(() => {
    if (!abierto) return;

    const fuera = (e) => {
      if (!raizRef.current?.contains(e.target)) setAbierto(false);
    };

    document.addEventListener("mousedown", fuera);
    return () => document.removeEventListener("mousedown", fuera);
  }, [abierto]);

  // Mantener visible la opción navegada con el teclado
  useEffect(() => {
    if (!abierto || resaltado < 0) return;

    listaRef.current
      ?.querySelector(`[data-index="${resaltado}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [abierto, resaltado]);

  const abrir = () => {
    if (disabled || abierto) return;

    setAbierto(true);
    setTexto("");
    setResaltado(-1);
  };

  const cerrar = () => {
    setAbierto(false);
    setTexto("");
    setResaltado(-1);
  };

  const seleccionar = (p) => {
    onChange(String(p.idProductor));
    cerrar();
  };

  const limpiar = (e) => {
    e.stopPropagation();
    onChange("");
    setTexto("");
    setAbierto(false);
    setResaltado(-1);
  };

  const handleKeyDown = (e) => {
    if (
      !abierto &&
      (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter")
    ) {
      e.preventDefault();
      abrir();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setResaltado((i) => Math.min(i + 1, opciones.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setResaltado((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (abierto && opciones[resaltado]) seleccionar(opciones[resaltado]);
    } else if (e.key === "Escape") {
      cerrar();
      inputRef.current?.blur();
    } else if (e.key === "Tab") {
      cerrar();
    }
  };

  const valorVisible = abierto
    ? texto
    : seleccionado
      ? etiqueta(seleccionado)
      : "";

  return (
    <div className="combo-productor" ref={raizRef}>
      <div className="combo-productor-input">
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-expanded={abierto}
          aria-controls={`${id}-lista`}
          aria-autocomplete="list"
          aria-activedescendant={
            abierto && resaltado >= 0 ? `${id}-opcion-${resaltado}` : undefined
          }
          placeholder={abierto ? "Buscar productor…" : placeholder}
          value={valorVisible}
          disabled={disabled}
          onFocus={abrir}
          onClick={abrir}
          onKeyDown={handleKeyDown}
          onChange={(e) => {
            setTexto(e.target.value);
            setResaltado(0); // Enter selecciona el primer resultado
            setAbierto(true);
          }}
        />

        {seleccionado && !disabled && !abierto && (
          <button
            type="button"
            className="combo-productor-clear"
            aria-label="Quitar productor seleccionado"
            onClick={limpiar}
          >
            ×
          </button>
        )}
      </div>

      {abierto && (
        <ul
          id={`${id}-lista`}
          ref={listaRef}
          className="combo-productor-lista"
          role="listbox"
        >
          {opciones.length === 0 && (
            <li className="combo-productor-vacio">Sin coincidencias</li>
          )}

          {opciones.map((p, i) => (
            <li
              key={p.idProductor}
              id={`${id}-opcion-${i}`}
              data-index={i}
              role="option"
              aria-selected={String(p.idProductor) === String(value ?? "")}
              className={i === resaltado ? "resaltado" : ""}
              onMouseDown={(e) => e.preventDefault()} // evita que el blur cierre antes del click
              onMouseEnter={() => setResaltado(i)}
              onClick={() => seleccionar(p)}
            >
              {resaltar(etiqueta(p), texto)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProductorComboBox;
