package com.hrmanagement.config;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Configuration
public class JacksonConfig {

    private static final String DATETIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss";

    @Bean
    @Primary
    public ObjectMapper objectMapper(Jackson2ObjectMapperBuilder builder) {
        JavaTimeModule javaTimeModule = new JavaTimeModule();
        
        // Custom serializer/deserializer for LocalDateTime
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(DATETIME_FORMAT);
        javaTimeModule.addSerializer(LocalDateTime.class, new LocalDateTimeSerializer(formatter));
        javaTimeModule.addDeserializer(LocalDateTime.class, new LocalDateTimeDeserializer(formatter) {
            @Override
            public LocalDateTime deserialize(com.fasterxml.jackson.core.JsonParser p, com.fasterxml.jackson.databind.DeserializationContext ctxt) throws java.io.IOException {
                String dateTimeString = p.getText();
                try {
                    // Handle ISO format with timezone (e.g., "2024-11-17T14:00:00.000Z" or "2024-11-17T14:00:00Z")
                    if (dateTimeString.contains("Z") || dateTimeString.endsWith("+00:00") || dateTimeString.matches(".*[+-]\\d{2}:\\d{2}$")) {
                        // Parse ISO string with timezone and convert to local timezone
                        // Normalize format: ensure Z at end or proper timezone offset
                        String normalized = dateTimeString;
                        if (normalized.contains("Z")) {
                            normalized = normalized.replace("Z", "");
                            if (!normalized.contains(".")) {
                                normalized += ".000";
                            }
                            normalized += "Z";
                        }
                        java.time.Instant instant = java.time.Instant.parse(normalized);
                        return LocalDateTime.ofInstant(instant, java.time.ZoneId.systemDefault());
                    }
                    // Handle format without timezone (e.g., "2024-11-17T14:00:00" or "2024-11-17T14:00:00.000")
                    if (dateTimeString.contains("T")) {
                        // Remove milliseconds if present
                        String cleanString = dateTimeString.split("\\.")[0];
                        // Ensure format is "YYYY-MM-DDTHH:mm:ss"
                        if (cleanString.length() == 19) {
                            return LocalDateTime.parse(cleanString, formatter);
                        }
                        // Try parsing with default formatter
                        return LocalDateTime.parse(cleanString);
                    }
                    // Fallback to default parsing
                    return super.deserialize(p, ctxt);
                } catch (Exception e) {
                    // If all parsing fails, try default
                    try {
                        return super.deserialize(p, ctxt);
                    } catch (Exception e2) {
                        throw new java.io.IOException("Failed to parse LocalDateTime: " + dateTimeString, e2);
                    }
                }
            }
        });

        return builder
                .modules(javaTimeModule)
                .featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .featuresToDisable(DeserializationFeature.ADJUST_DATES_TO_CONTEXT_TIME_ZONE)
                .build();
    }
}

