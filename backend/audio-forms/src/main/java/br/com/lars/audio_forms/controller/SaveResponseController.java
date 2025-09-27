package br.com.lars.audio_forms.controller;

import br.com.lars.audio_forms.models.SaveFormRequestModel;
import br.com.lars.audio_forms.models.UserResponses;
import br.com.lars.audio_forms.service.SaveFormService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping
public class SaveResponseController {

    private final SaveFormService saveFormService;

    public SaveResponseController(SaveFormService saveFormService) {
        this.saveFormService = saveFormService;
    }

    @PostMapping(path = "/response", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public UserResponses saveResponse(@RequestBody SaveFormRequestModel request) {
        return saveFormService.save(request);
    }
}
