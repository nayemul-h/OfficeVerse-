# ============================
# Stage 1: Build
# ============================
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Install Gradle directly (avoids needing gradle-wrapper.jar)
RUN apk add --no-cache gradle

# Copy Gradle configuration first for layer caching
COPY build.gradle .
COPY settings.gradle .

# Download dependencies as a separate cached layer
RUN gradle dependencies --no-daemon || true

# Copy source code
COPY src src

# Build the fat JAR, skipping tests for faster Docker builds
RUN gradle bootJar --no-daemon -x test

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
