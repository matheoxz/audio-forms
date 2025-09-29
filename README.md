# audio-forms

Audio Forms is a formulary application built to support research on audio poisoning attacks against Generative AI models. The system serves randomized sets of original and poisoned audio samples to users, collects their feedback via dynamic forms, and persists responses in a MongoDB database.

## Architecture

- **Frontend**: React (Create React App)
- **Backend**: Spring Boot 3
- **Database**: MongoDB (via Docker Compose)
- **Communication**: RESTful APIs

## Audio Data Organization

Audio samples must be arranged under the `backend/audio-forms/audio/` directory by concept. Each concept folder should contain three subfolders:
  
```plaintext
backend/audio-forms/audio/<concept>/
├── original/        # clean audio samples
├── poisoned_100/    # lightly poisoned samples
└── poisoned_300/    # heavily poisoned samples
```

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Java 21 & Maven
- Node.js (>=16) & npm

### Setup MongoDB

From the project root:
  
```powershell
cd backend/audio-forms
docker-compose up -d
```

This will start a MongoDB container with the database named `audio-forms`.

### Run Backend

```powershell
cd backend/audio-forms
./mvnw clean spring-boot:run  # or mvnw.cmd on Windows
```

The backend exposes two main endpoints:
  
- `GET  /start`  – returns a random audio entry for each concept
- `GET  /audios/{concept}/{file_name}`  – returns original and poisoned audio files in base64 format
- `POST /response`   – accepts a JSON payload and stores it in MongoDB

### Run Frontend

```powershell
cd frontend/audio-forms
npm install
npm start
```

The frontend will request the list of audios from `/start`, display a form page for each returned sample (original, poisoned_100, poisoned_300), and post user responses back to `/save`.

## Database Schema

**Database**: `audio-forms`  
**Collection**: `forms-responses`  
**Document fields**:
  
- `audio_name` (String) – identifier of the sample
- `original`    (String) – Label in the frontend
- `poisoned_100`    (String) – Label in the frontend
- `poisoned_300`    (String) – Label in the frontend
- `responses`   (Object) – user feedback as JSON

## License

MIT License – see LICENSE file for details.
  