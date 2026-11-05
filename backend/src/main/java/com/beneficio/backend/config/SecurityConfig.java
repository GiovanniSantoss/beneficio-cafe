package com.beneficio.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .cors(cors -> {})
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth

                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/productores/**").permitAll()
                .requestMatchers("/cafetales/**").permitAll()
                .requestMatchers("/recepciones/**").permitAll()
                .requestMatchers("/lotes/**").permitAll()
                .requestMatchers("/procesos/**").permitAll()
                .requestMatchers("/compradores/**").permitAll()
                .requestMatchers("/ventas/**").permitAll()
                .requestMatchers("/empleados/**").permitAll()
                .requestMatchers("/inventario/**").permitAll()
                .requestMatchers("/error").permitAll()

                .anyRequest().authenticated()
            )
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable());

        return http.build();
    }
}