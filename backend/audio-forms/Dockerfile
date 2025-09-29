# Multi-stage Dockerfile for production
# Build stage
FROM maven:3.9.4-eclipse-temurin-21 AS build
WORKDIR /workspace
# Copy only the files needed for dependency resolution first to leverage Docker layer caching
COPY pom.xml ./
# Copy sources
COPY src ./src
# Build the application (skip tests in image build) using the maven CLI available in this image
RUN mvn -B -DskipTests package

# Run stage
FROM eclipse-temurin:21-jre
WORKDIR /app
# Copy the built jar from the build stage
COPY --from=build /workspace/target/*.jar app.jar

# Copy the audio assets into the image so the app can serve them at runtime
# (this includes the audio/ folder at the repository root)
COPY audio /app/audio

# Expose default Spring Boot port
EXPOSE 8080

# Use a non-root user for better security (optional)
# RUN addgroup --system app && adduser --system --ingroup app app
# USER app

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
