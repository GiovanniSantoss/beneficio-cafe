package com.beneficio.backend.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "productor")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Productor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_productor")
    private Long idProductor;

    @NotBlank(message = "El RFC es obligatorio")
    @Size(min = 12, max = 13, message = "El RFC debe tener entre 12 y 13 caracteres")
    @Column(nullable = false, unique = true, length = 13)
    private String rfc;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 3, max = 100, message = "El nombre debe tener entre 3 y 100 caracteres")
    @Column(nullable = false, length = 100)
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    @Size(min = 3, max = 100, message = "El apellido debe tener entre 3 y 100 caracteres")
    @Column(nullable = false, length = 100)
    private String apellido;

    @NotNull(message = "La fecha de ingreso es obligatoria")
    @Column(name = "fecha_ingreso", nullable = false)
    private LocalDate fechaIngreso;

    @Size(max = 20, message = "El género no puede exceder 20 caracteres")
    @Column(length = 20)
    private String genero;

    @Pattern(regexp = "^[0-9]{7,15}$", message = "El teléfono solo debe contener números (7 a 15 dígitos)")
    @Column(length = 20)
    private String telefono;

    @Size(max = 100, message = "La comunidad no puede exceder 100 caracteres")
    @Column(length = 100)
    private String comunidad;

    @Size(max = 100, message = "La localidad no puede exceder 100 caracteres")
    @Column(length = 100)
    private String localidad;

    @Size(max = 100, message = "El estado no puede exceder 100 caracteres")
    @Column(length = 100)
    private String estado;

    @NotBlank(message = "El tipo de socio es obligatorio")
    @Column(name = "tipo_socio", nullable = false, length = 50)
    private String tipoSocio;

    @Column(name = "fecha_creacion", insertable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(nullable = false)
    private Boolean activo;

    @PrePersist
    public void prePersist() {
        if (this.fechaIngreso == null) {
            this.fechaIngreso = LocalDate.now();
        }
        this.activo = true;
    }
}