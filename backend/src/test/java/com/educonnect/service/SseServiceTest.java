package com.educonnect.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class SseServiceTest {

    private SseService sseService;
    private SimpMessagingTemplate messagingTemplate;
    private final UUID TEST_UUID = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");

    @BeforeEach
    void setUp() {
        messagingTemplate = org.mockito.Mockito.mock(SimpMessagingTemplate.class);
        sseService = new SseService(messagingTemplate);
    }

    @Test
    void createEmitter_success() {
        SseEmitter emitter = sseService.createEmitter(TEST_UUID);
        assertNotNull(emitter);
        // We verify that the emitter is created successfully.
        // The internal state (emitters map) is private, but the fact it returns an object means success.
    }

    @Test
    void sendNotification_doesNotThrowWhenEmitterNotFound() {
        assertDoesNotThrow(() -> {
            sseService.sendNotification(TEST_UUID, "test_event", "Hello World");
        });
    }
}
