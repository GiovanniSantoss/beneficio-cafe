package com.beneficio.backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "cafetal")
public class Cafetal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cafetal")
    private Long idCafetal;

    @ManyToOne
    @JoinColumn(name = "id_productor", nullable = false)
    private Productor productor;

    @Column(name = "num_parcela")
    private String numParcela;

    private String ubicacion;

    @Column(name = "area_total_ha")
    private Double areaTotalHa;

    private Double latitud;

    private Double longitud;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    private Boolean activo = true;


    public Cafetal() {
    }


    public Long getIdCafetal() {
        return idCafetal;
    }

    public void setIdCafetal(Long idCafetal) {
        this.idCafetal = idCafetal;
    }

    public Productor getProductor() {
        return productor;
    }

    public void setProductor(Productor productor) {
        this.productor = productor;
    }

    public String getNumParcela() {
        return numParcela;
    }

    public void setNumParcela(String numParcela) {
        this.numParcela = numParcela;
    }

    public String getUbicacion() {
        return ubicacion;
    }

    public void setUbicacion(String ubicacion) {
        this.ubicacion = ubicacion;
    }

    public Double getAreaTotalHa() {
        return areaTotalHa;
    }

    public void setAreaTotalHa(Double areaTotalHa) {
        this.areaTotalHa = areaTotalHa;
    }

    public Double getLatitud() {
        return latitud;
    }

    public void setLatitud(Double latitud) {
        this.latitud = latitud;
    }

    public Double getLongitud() {
        return longitud;
    }

    public void setLongitud(Double longitud) {
        this.longitud = longitud;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
}