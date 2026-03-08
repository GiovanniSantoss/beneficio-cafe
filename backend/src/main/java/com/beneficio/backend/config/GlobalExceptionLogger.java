package com.beneficio.backend.config;

import org.springframework.web.bind.annotation.ExceptionHandler;

//@RestControllerAdvice
public class GlobalExceptionLogger {

    @ExceptionHandler(Exception.class)
    public String log(Exception e) {
        e.printStackTrace(); // 👈 AQUÍ SALE TODO
        return e.getMessage();
    }
}