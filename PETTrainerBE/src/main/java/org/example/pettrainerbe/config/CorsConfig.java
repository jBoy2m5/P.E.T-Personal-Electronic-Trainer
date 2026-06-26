package org.example.pettrainerbe.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Áp dụng cho toàn bộ API của bạn
                .allowedOrigins(
                        "http://localhost:3000", // Port mặc định của React (Create React App)
                        "http://localhost:5173"  // Port mặc định của React (Vite)
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Các phương thức cho phép
                .allowedHeaders("*") // Cho phép mọi loại Header
                .allowCredentials(true);
    }
}