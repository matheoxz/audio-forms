package br.com.lars.audio_forms.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    private final String[] allowedOrigins;

    public CorsConfig(@Value("${app.frontend.url}") String frontendUrl) {
        if (frontendUrl == null || frontendUrl.isBlank()) {
            this.allowedOrigins = new String[0];
        } else {
            this.allowedOrigins = Arrays.stream(frontendUrl.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toArray(String[]::new);
        }
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        if (allowedOrigins.length > 0) {
            registry.addMapping("/**")
                    .allowedOrigins(allowedOrigins)
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true);
        }
    }
}
