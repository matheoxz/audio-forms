package br.com.lars.audio_forms.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "forms-responses")
public class FormResponse {
    @Id
    private String id;

    @Field("audio_name")
    private String audioName;

    @Field("original")
    private String original;

    @Field("poisoned100")
    private String poisoned100;

    @Field("poisoned300")
    private String poisoned300;

    @Field("responses")
    private Map<String, Object> responses;
}
