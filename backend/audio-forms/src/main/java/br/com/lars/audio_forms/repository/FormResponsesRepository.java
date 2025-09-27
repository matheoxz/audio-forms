package br.com.lars.audio_forms.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import br.com.lars.audio_forms.models.FormResponse;

@Repository
public interface FormResponsesRepository extends MongoRepository<FormResponse, String> {
	// Additional query methods can be defined here
}
