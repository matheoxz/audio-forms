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
        Path audioRoot = Paths.get("audio");
        if (!Files.exists(audioRoot) || !Files.isDirectory(audioRoot)) {
            return Collections.emptyList();
        }

        List<String> result = new ArrayList<>();

        try (Stream<Path> subfolders = Files.list(audioRoot)) {
            List<Path> folders = subfolders
                    .filter(Files::isDirectory)
                    .collect(Collectors.toList());

            for (Path folder : folders) {
                Path originalDir = folder.resolve("original");
                if (!Files.exists(originalDir) || !Files.isDirectory(originalDir)) {
                    continue;
                }
                try (Stream<Path> files = Files.list(originalDir)) {
                    List<Path> audioFiles = files
                            .filter(Files::isRegularFile)
                            .collect(Collectors.toList());
                    if (!audioFiles.isEmpty()) {
                        Collections.shuffle(audioFiles);
                        Path selected = audioFiles.get(0);
                        String subfolderName = folder.getFileName().toString();
                        String fileName = selected.getFileName().toString();
                        result.add(subfolderName + "/" + fileName);
                    }
                }
            }
        }

        return result;
    }

    public AudiosResponseModel getAudios(String subfolder, String audioName) throws IOException {
        Path originalPath = Paths.get("audio", subfolder, "original", audioName);

        //removes extension from audioName if exists
        if (audioName.contains(".")) {
            audioName = audioName.substring(0, audioName.lastIndexOf('.'));
        }
        Path poisoned100Path = Paths.get("audio", subfolder, "poisoned_100", audioName + "_100.wav");
        Path poisoned300Path = Paths.get("audio", subfolder, "poisoned_300", audioName + "_300.wav");

        if (!Files.exists(originalPath) || !Files.isRegularFile(originalPath)) {
            throw new IOException("Original audio not found: " + originalPath);
        }
        if (!Files.exists(poisoned100Path) || !Files.isRegularFile(poisoned100Path)) {
            throw new IOException("Poisoned_100 audio not found: " + poisoned100Path);
        }
        if (!Files.exists(poisoned300Path) || !Files.isRegularFile(poisoned300Path)) {
            throw new IOException("Poisoned_300 audio not found: " + poisoned300Path);
        }

        byte[] originalBytes = Files.readAllBytes(originalPath);
        byte[] poisoned100Bytes = Files.readAllBytes(poisoned100Path);
        byte[] poisoned300Bytes = Files.readAllBytes(poisoned300Path);

        return new AudiosResponseModel(originalBytes, poisoned100Bytes, poisoned300Bytes);
    }
}
