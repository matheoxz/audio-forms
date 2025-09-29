package br.com.lars.audio_forms.controller;

import br.com.lars.audio_forms.models.AudiosResponseModel;
import br.com.lars.audio_forms.models.StartFormResponseModel;
import br.com.lars.audio_forms.service.StartFormService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping
public class StartFormController {

    private final StartFormService startFormService;

    @Autowired
    public StartFormController(StartFormService startFormService) {
        this.startFormService = startFormService;
    }

    // GET /start -> returns JSON { "audios": ["a.wav", ...] }
    @GetMapping(path = "/start", produces = MediaType.APPLICATION_JSON_VALUE)
    public StartFormResponseModel start() throws IOException {
        return new StartFormResponseModel(startFormService.selectAudios());
    }

    // GET /audios/{audio_name} -> returns JSON with base64-encoded audio bytes
    @GetMapping(path = "/audios/{subfolder}/{audioName}", produces = MediaType.APPLICATION_JSON_VALUE)
    public AudiosResponseModel getAudios(
            @PathVariable("subfolder") String subfolder,
            @PathVariable("audioName") String audioName) throws IOException {
        return startFormService.getAudios(subfolder, audioName);
    }
}
