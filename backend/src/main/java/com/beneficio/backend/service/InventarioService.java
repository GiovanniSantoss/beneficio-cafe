package com.beneficio.backend.service;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.beneficio.backend.dto.CafetalResumenDTO;
import com.beneficio.backend.dto.InventarioDetalleDTO;
import com.beneficio.backend.dto.InventarioItemDTO;
import com.beneficio.backend.dto.InventarioResumenDTO;
import com.beneficio.backend.dto.ProcesoHistorialDTO;
import com.beneficio.backend.dto.ProductorResumenDTO;
import com.beneficio.backend.dto.RecepcionResumenDTO;
import com.beneficio.backend.dto.VentaHistorialDTO;
import com.beneficio.backend.model.Cafetal;
import com.beneficio.backend.model.Inventario;
import com.beneficio.backend.model.Lote;
import com.beneficio.backend.model.Procesos;
import com.beneficio.backend.model.Productor;
import com.beneficio.backend.model.Recepcion;
import com.beneficio.backend.model.Venta;
import com.beneficio.backend.repository.InventarioRepository;
import com.beneficio.backend.repository.LoteRepository;
import com.beneficio.backend.repository.ProcesosRepository;
import com.beneficio.backend.repository.VentaRepository;

@Service
public class InventarioService {

    public static final String VENDIBLE = "VENDIBLE";
    public static final String EN_PROCESO = "EN_PROCESO";
    public static final String AGOTADO = "AGOTADO";
    public static final String CANCELADO = "CANCELADO";
    public static final String SIN_INVENTARIO = "SIN_INVENTARIO";

    private static final BigDecimal CERO = BigDecimal.ZERO;

    private final InventarioRepository inventarioRepository;
    private final LoteRepository loteRepository;
    private final ProcesosRepository procesosRepository;
    private final VentaRepository ventaRepository;

    public InventarioService(
            InventarioRepository inventarioRepository,
            LoteRepository loteRepository,
            ProcesosRepository procesosRepository,
            VentaRepository ventaRepository) {

        this.inventarioRepository = inventarioRepository;
        this.loteRepository = loteRepository;
        this.procesosRepository = procesosRepository;
        this.ventaRepository = ventaRepository;
    }

    // =================================================================
    // CONSULTAS
    // =================================================================

    public InventarioResumenDTO resumen() {

        List<Lote> lotes = loteRepository.findAllConDetalle();
        Map<Long, Inventario> inventarios = mapaInventarios();

        BigDecimal kgTotales = CERO;
        Map<String, BigDecimal> kgPorEtapa = new LinkedHashMap<>();
        kgPorEtapa.put("CEREZA", CERO);
        kgPorEtapa.put("PERGAMINO", CERO);
        kgPorEtapa.put("ORO", CERO);

        long lotesConStock = 0;
        long lotesOroVendibles = 0;
        long lotesCancelados = 0;
        long lotesAgotados = 0;
        long lotesSinInventario = 0;
        long lotesSinUbicacion = 0;

        for (Lote lote : lotes) {

            if (esCancelado(lote)) {
                lotesCancelados++;
                continue;
            }

            Inventario inv = inventarios.get(lote.getIdLote());

            if (inv == null) {
                if (Boolean.TRUE.equals(lote.getActivo())) {
                    lotesSinInventario++;
                }
                continue;
            }

            if (!Boolean.TRUE.equals(inv.getActivo())) {
                continue;
            }

            BigDecimal stock = stockDe(inv);

            if (stock.compareTo(CERO) > 0) {
                lotesConStock++;
                kgTotales = kgTotales.add(stock);

                String etapa = lote.getEstadoCafe() == null ? "" : lote.getEstadoCafe().toUpperCase(Locale.ROOT);
                kgPorEtapa.merge(etapa, stock, BigDecimal::add);

                if ("ORO".equals(etapa) && Boolean.TRUE.equals(lote.getActivo())) {
                    lotesOroVendibles++;
                }
            } else {
                lotesAgotados++;
            }

            if (sinUbicacion(inv)) {
                lotesSinUbicacion++;
            }
        }

        return new InventarioResumenDTO(
                kgTotales,
                kgPorEtapa,
                lotes.size(),
                lotesConStock,
                lotesOroVendibles,
                lotesCancelados,
                lotesAgotados,
                lotesSinInventario,
                lotesSinUbicacion);
    }

    public List<InventarioItemDTO> listar(String etapa, String estado, String q, Boolean soloVendibles) {

        List<Lote> lotes = loteRepository.findAllConDetalle();
        Map<Long, Inventario> inventarios = mapaInventarios();

        String texto = normalizar(q);
        String etapaFiltro = etapa == null ? "" : etapa.trim().toUpperCase(Locale.ROOT);
        String estadoFiltro = estado == null ? "" : estado.trim().toUpperCase(Locale.ROOT);

        return lotes.stream()
                .map(lote -> toItem(lote, inventarios.get(lote.getIdLote())))
                .filter(item -> etapaFiltro.isEmpty()
                        || "TODAS".equals(etapaFiltro)
                        || etapaFiltro.equalsIgnoreCase(item.estadoCafe()))
                .filter(item -> coincideEstado(item, estadoFiltro))
                .filter(item -> Boolean.TRUE.equals(soloVendibles) ? item.vendible() : true)
                .filter(item -> texto.isEmpty() || coincideTexto(item, texto))
                .sorted(Comparator.comparing(InventarioItemDTO::idLote))
                .collect(Collectors.toList());
    }

    public InventarioDetalleDTO detalle(Long idLote) {

        Lote lote = loteRepository.findById(idLote)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Lote no encontrado"));

        Inventario inv = inventarioRepository.findByLoteIdLote(idLote).orElse(null);
        InventarioItemDTO item = toItem(lote, inv);

        List<ProcesoHistorialDTO> procesos = procesosRepository.findByLote_IdLote(idLote).stream()
                .sorted(Comparator.comparing(Procesos::getFecha,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .map(this::toProceso)
                .collect(Collectors.toList());

        List<VentaHistorialDTO> ventas = ventaRepository.findByLoteIdLote(idLote).stream()
                .sorted(Comparator.comparing(Venta::getFechaVenta,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .map(this::toVenta)
                .collect(Collectors.toList());

        return new InventarioDetalleDTO(
                item,
                lote.getEstado(),
                lote.getFechaCreacion(),
                lote.getPesoActual(),
                procesos,
                ventas,
                alertas(lote, inv));
    }

    // =================================================================
    // MUTACIONES (uso interno, no expuestas como CRUD)
    // =================================================================

    @Transactional
    public Inventario crearParaLote(Lote lote, BigDecimal stock, String ubicacion) {

        Inventario inv = inventarioRepository.findByLoteIdLote(lote.getIdLote())
                .orElseGet(Inventario::new);

        inv.setLote(lote);
        inv.setStockActual(stock == null ? CERO : stock);
        inv.setUbicacion(ubicacion);
        inv.setActivo(true);
        inv.setFechaActualizacion(LocalDateTime.now());

        return inventarioRepository.save(inv);
    }

    @Transactional
    public void actualizarStock(Lote lote, BigDecimal stock) {

        Inventario inv = inventarioRepository.findByLoteIdLoteForUpdate(lote.getIdLote())
                .orElseGet(Inventario::new);

        inv.setLote(lote);
        inv.setStockActual(stock == null ? CERO : stock);
        inv.setActivo(true);
        inv.setFechaActualizacion(LocalDateTime.now());

        inventarioRepository.save(inv);
    }

    @Transactional
    public BigDecimal descontarPorVenta(Lote lote, BigDecimal cantidad) {

        Inventario inv = inventarioRepository.findByLoteIdLoteForUpdate(lote.getIdLote())
                .orElseThrow(() -> new RuntimeException(
                        "El lote no tiene inventario registrado"));

        BigDecimal stock = stockDe(inv);

        if (cantidad == null || cantidad.compareTo(CERO) <= 0) {
            throw new RuntimeException("Cantidad inválida");
        }

        if (cantidad.compareTo(stock) > 0) {
            throw new RuntimeException("No hay suficiente café en el lote");
        }

        BigDecimal nuevoStock = stock.subtract(cantidad);

        inv.setStockActual(nuevoStock);
        inv.setFechaActualizacion(LocalDateTime.now());
        inventarioRepository.save(inv);

        return nuevoStock;
    }

    @Transactional
    public void anularPorCancelacion(Lote lote) {

        inventarioRepository.findByLoteIdLoteForUpdate(lote.getIdLote()).ifPresent(inv -> {
            inv.setStockActual(CERO);
            inv.setActivo(false);
            inv.setFechaActualizacion(LocalDateTime.now());
            inventarioRepository.save(inv);
        });
    }

    // =================================================================
    // APOYO
    // =================================================================

    private Map<Long, Inventario> mapaInventarios() {
        return inventarioRepository.findAllConDetalle().stream()
                .collect(Collectors.toMap(
                        inv -> inv.getLote().getIdLote(),
                        Function.identity(),
                        (a, b) -> a));
    }

    private InventarioItemDTO toItem(Lote lote, Inventario inv) {

        Recepcion recepcion = lote.getRecepcion();
        Productor productor = recepcion == null ? null : recepcion.getProductor();
        Cafetal cafetal = recepcion == null ? null : recepcion.getCafetal();

        String estadoStock = calcularEstado(lote, inv);

        return new InventarioItemDTO(
                inv == null ? null : inv.getIdInventario(),
                lote.getIdLote(),
                lote.getEstadoCafe(),
                inv == null ? CERO : stockDe(inv),
                inv == null ? null : inv.getUbicacion(),
                inv == null ? null : inv.getFechaActualizacion(),
                inv != null && Boolean.TRUE.equals(inv.getActivo()),
                estadoStock,
                VENDIBLE.equals(estadoStock),
                productor == null ? null : new ProductorResumenDTO(
                        productor.getIdProductor(), productor.getNombre(), productor.getApellido()),
                cafetal == null ? null : new CafetalResumenDTO(
                        cafetal.getIdCafetal(), cafetal.getNumParcela(), cafetal.getUbicacion()),
                recepcion == null ? null : new RecepcionResumenDTO(
                        recepcion.getIdRecepcion(), recepcion.getFechaHora(),
                        recepcion.getPesoInicial(), recepcion.getEstado()));
    }

    private String calcularEstado(Lote lote, Inventario inv) {

        if (esCancelado(lote)) {
            return CANCELADO;
        }

        if (inv == null) {
            return SIN_INVENTARIO;
        }

        BigDecimal stock = stockDe(inv);

        if (stock.compareTo(CERO) <= 0) {
            return AGOTADO;
        }

        boolean oro = "ORO".equalsIgnoreCase(lote.getEstadoCafe());

        if (oro && Boolean.TRUE.equals(lote.getActivo()) && Boolean.TRUE.equals(inv.getActivo())) {
            return VENDIBLE;
        }

        return EN_PROCESO;
    }

    private boolean coincideEstado(InventarioItemDTO item, String estadoFiltro) {

        if (estadoFiltro.isEmpty() || "TODOS".equals(estadoFiltro)) {
            return true;
        }

        if ("CON_STOCK".equals(estadoFiltro)) {
            return item.stockActual() != null
                    && item.stockActual().compareTo(CERO) > 0
                    && !CANCELADO.equals(item.estadoStock());
        }

        return estadoFiltro.equals(item.estadoStock());
    }

    private boolean coincideTexto(InventarioItemDTO item, String texto) {

        StringBuilder sb = new StringBuilder();
        sb.append(item.idLote()).append(' ');

        if (item.productor() != null) {
            sb.append(item.productor().nombre()).append(' ')
                    .append(item.productor().apellido()).append(' ');
        }

        if (item.cafetal() != null) {
            sb.append(item.cafetal().numParcela()).append(' ')
                    .append(item.cafetal().ubicacion()).append(' ');
        }

        sb.append(item.ubicacion()).append(' ');
        sb.append(item.estadoCafe()).append(' ');

        return normalizar(sb.toString()).contains(texto);
    }

    private List<String> alertas(Lote lote, Inventario inv) {

        List<String> alertas = new ArrayList<>();

        if (esCancelado(lote)) {
            alertas.add("La recepción está cancelada. El lote se conserva solo como historial.");
        }

        if (inv == null) {
            alertas.add("El lote no tiene fila de inventario.");
            return alertas;
        }

        if (sinUbicacion(inv)) {
            alertas.add("Sin ubicación principal registrada.");
        }

        if (stockDe(inv).compareTo(CERO) == 0) {
            alertas.add("Stock en cero.");
        }

        if (lote.getPesoActual() != null
                && lote.getPesoActual().compareTo(stockDe(inv)) != 0
                && !esCancelado(lote)) {
            alertas.add("El peso del lote (" + lote.getPesoActual()
                    + " kg) no coincide con el inventario (" + stockDe(inv) + " kg).");
        }

        return alertas;
    }

    private ProcesoHistorialDTO toProceso(Procesos proceso) {

        String empleado = null;

        if (proceso.getEmpleado() != null) {
            empleado = (proceso.getEmpleado().getNombre() + " "
                    + (proceso.getEmpleado().getApellido() == null
                            ? ""
                            : proceso.getEmpleado().getApellido()))
                    .trim();
        }

        return new ProcesoHistorialDTO(
                proceso.getIdProceso(),
                proceso.getTipoProceso(),
                proceso.getPesoResultante(),
                proceso.getFecha(),
                empleado,
                proceso.getObservaciones());
    }

    private VentaHistorialDTO toVenta(Venta venta) {

        String comprador = venta.getComprador() == null
                ? null
                : venta.getComprador().getNombreEmpresa();

        return new VentaHistorialDTO(
                venta.getIdVenta(),
                venta.getFechaVenta(),
                comprador,
                venta.getCantidadVendida(),
                venta.getPrecioVenta());
    }

    private boolean esCancelado(Lote lote) {

        if ("CANCELADO".equalsIgnoreCase(lote.getEstado())) {
            return true;
        }

        return lote.getRecepcion() != null
                && "CANCELADA".equalsIgnoreCase(lote.getRecepcion().getEstado());
    }

    private boolean sinUbicacion(Inventario inv) {
        return inv.getUbicacion() == null || inv.getUbicacion().isBlank();
    }

    private BigDecimal stockDe(Inventario inv) {
        return inv.getStockActual() == null ? CERO : inv.getStockActual();
    }

    private static String normalizar(String texto) {

        if (texto == null) {
            return "";
        }

        return Normalizer.normalize(texto, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .trim();
    }
}
