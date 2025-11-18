FROM eclipse-temurin:21-jdk-alpine

# Set working directory
WORKDIR /app

# Copy backend files
COPY backend/mvnw .
COPY backend/mvnw.cmd .
COPY backend/.mvn .mvn
COPY backend/pom.xml .

# Make mvnw executable
RUN chmod +x mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY backend/src src

# Build application
RUN ./mvnw clean package -DskipTests

# Create uploads directory
RUN mkdir -p uploads/documents

# Expose port
EXPOSE 8080

# Run application
CMD ["java", "-jar", "target/hr-backend-0.0.1-SNAPSHOT.jar"]

