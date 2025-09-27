package br.com.lars.audio_forms.repository;

import br.com.lars.audio_forms.models.UserResponses;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserResponsesRepository extends MongoRepository<UserResponses, String> {
    Optional<UserResponses> findByUser(String user);
}
