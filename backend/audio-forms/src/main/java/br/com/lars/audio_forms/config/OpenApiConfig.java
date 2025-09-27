package br.com.lars.audio_forms.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Audio Forms API")
                        .version("v1")
                        .description("API para listar e recuperar áudios e salvar respostas")
                        .contact(new Contact().name("mathe"))
                );
    }
}

