package org.example.pettrainerbe.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Tắt CSRF để test API dễ dàng
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().authenticated() // Mọi yêu cầu đều phải xác thực
                )
                .httpBasic(withDefaults()); // Sử dụng HTTP Basic Authentication

        return http.build();
    }
}