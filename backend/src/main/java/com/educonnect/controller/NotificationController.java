package com.educonnect.controller;

import com.educonnect.service.SseService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class NotificationController {
    private final SseService sseService;

    public NotificationController(SseService sseService) {
        this.sseService = sseService;
    }

    @GetMapping(value = "/stream/{userId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@PathVariable java.util.UUID userId) {
        return sseService.createEmitter(userId);
    }
}