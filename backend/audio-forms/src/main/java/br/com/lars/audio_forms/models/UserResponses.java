package br.com.lars.audio_forms.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "user-responses")
public class UserResponses {
    @Id
    private String id;

    private String user; // UUID string identifying the user

    private List<FormResponse> responses;
}

