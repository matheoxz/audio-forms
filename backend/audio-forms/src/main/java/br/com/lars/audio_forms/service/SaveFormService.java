package br.com.lars.audio_forms.service;

import br.com.lars.audio_forms.models.FormResponse;
import br.com.lars.audio_forms.models.SaveFormRequestModel;
import br.com.lars.audio_forms.models.UserResponses;
import br.com.lars.audio_forms.repository.UserResponsesRepository;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class SaveFormService {

    private final UserResponsesRepository userResponsesRepository;
    private final MongoOperations mongoOperations;

    public SaveFormService(UserResponsesRepository userResponsesRepository, MongoOperations mongoOperations) {
        this.userResponsesRepository = userResponsesRepository;
        this.mongoOperations = mongoOperations;
    }

    public UserResponses save(SaveFormRequestModel request) {
        if (request.getUser() == null || request.getUser().isBlank()) {
            throw new IllegalArgumentException("user is required");
        }

        // generate id for the entry so each pushed response has its own id
        String entryId = new ObjectId().toString();
        
        FormResponse entry = new FormResponse(
                entryId,
                request.getAudioName(),
                request.getOriginal(),
                request.getPoisoned100(),
                request.getPoisoned300(),
                request.getResponses()
        );

        String user = request.getUser();

        // Atomic upsert + push to avoid race conditions
        Query q = new Query(Criteria.where("user").is(user));
        Update u = new Update()
                .setOnInsert("user", user)
                .push("responses", entry);

        FindAndModifyOptions options = new FindAndModifyOptions().returnNew(true).upsert(true);
        UserResponses updated = mongoOperations.findAndModify(q, u, options, UserResponses.class);

        if (updated != null) {
            return updated;
        }

        // Fallback: if findAndModify didn't return (shouldn't happen), read via repository
        Optional<UserResponses> existing = userResponsesRepository.findByUser(user);
        if (existing.isPresent()) {
            return existing.get();
        }

        // As last resort, create a new document
        List<FormResponse> list = new ArrayList<>();
        list.add(entry);
        UserResponses ur = new UserResponses(null, user, list);
        return userResponsesRepository.save(ur);
    }
}
