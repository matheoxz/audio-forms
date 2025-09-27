package br.com.lars.audio_forms.service;

import br.com.lars.audio_forms.models.AudiosResponseModel;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class StartFormService {

    private static final Path ORIGINAL_DIR = Paths.get("audio", "original");
    private static final Path POISONED_DIR = Paths.get("audio", "poisoned");

    public List<String> selectAudios() throws IOException {
        if (!Files.exists(ORIGINAL_DIR) || !Files.isDirectory(ORIGINAL_DIR)) {
            return Collections.emptyList();
        }

        List<String> all;
        try (Stream<Path> stream = Files.list(ORIGINAL_DIR)) {
            all = stream
                    .filter(Files::isRegularFile)
                    .map(p -> p.getFileName().toString())
                    .collect(Collectors.toList());
        }

        Collections.shuffle(all);

        if (all.size() <= 5) {
            return new ArrayList<>(all);
        }

        return new ArrayList<>(all.subList(0, 5));
    }

    public AudiosResponseModel getAudios(String audioName) throws IOException {
        // sanitize filename to avoid path traversal
        String fileName = Paths.get(audioName).getFileName().toString();

        Path originalPath = ORIGINAL_DIR.resolve(fileName);
        Path poisonedPath = POISONED_DIR.resolve(fileName);

        if (!Files.exists(originalPath) || !Files.isRegularFile(originalPath)) {
            throw new IOException("Original audio not found: " + fileName);
        }
        if (!Files.exists(poisonedPath) || !Files.isRegularFile(poisonedPath)) {
            throw new IOException("Poisoned audio not found: " + fileName);
        }

        byte[] originalBytes = Files.readAllBytes(originalPath);
        byte[] poisonedBytes = Files.readAllBytes(poisonedPath);

        return new AudiosResponseModel(originalBytes, poisonedBytes);
    }
}
