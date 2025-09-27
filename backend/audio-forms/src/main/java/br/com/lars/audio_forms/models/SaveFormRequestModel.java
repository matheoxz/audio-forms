package br.com.lars.audio_forms.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SaveFormRequestModel {
    private String user; // UUID string identifying the user
    private String audioName;
    private String original;
    private String poisoned;
    private Map<String, Object> responses;
}
