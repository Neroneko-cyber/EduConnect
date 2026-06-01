package com.educonnect.service;

import org.springframework.lang.NonNull;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.util.Map;

@Service
public class SseService {

    private final SimpMessagingTemplate messagingTemplate;

    public SseService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    // Tetap menyisakan method lama sebagai fallback jika ada yang memanggil, tapi kembalikan dummy emitter
    public SseEmitter createEmitter(java.util.UUID userId) {
        SseEmitter emitter = new SseEmitter(0L); // Infinite timeout
        emitter.complete();
        return emitter;
    }

    @SuppressWarnings("null")
    public void sendNotification(@NonNull java.util.UUID userId, @NonNull String eventName, @NonNull Object data) {
        // Menggunakan STOMP destination per user
        // Front-end harus subscribe ke /user/{userId}/queue/notifications
        messagingTemplate.convertAndSendToUser(
                userId.toString(), 
                "/queue/notifications", 
                Map.of("event", eventName, "payload", data)
        );
    }

    @SuppressWarnings("null")
    public void sendGlobalNotification(@NonNull String eventName, @NonNull Object data) {
        // Menggunakan STOMP global topic
        // Front-end harus subscribe ke /topic/public
        messagingTemplate.convertAndSend(
                "/topic/public",
                Map.of("event", eventName, "payload", data)
        );
    }
}