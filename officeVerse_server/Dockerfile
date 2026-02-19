# ============================
# Stage 1: Build
# ============================
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copy gradle files first for layer caching
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# Make gradlew executable
RUN chmod +x ./gradlew

# Download dependencies (cached layer)
RUN ./gradlew dependencies --no-daemon || true

# Copy source code
COPY src src

# Build the fat JAR, skipping tests for faster Docker builds
RUN ./gradlew bootJar --no-daemon -x test

# ============================
# Stage 2: Run
# ============================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built JAR from the build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Expose the port Spring Boot runs on
EXPOSE 8080

# Use environment variables to configure the app at runtime
ENTRYPOINT ["java", "-jar", "app.jar"]
