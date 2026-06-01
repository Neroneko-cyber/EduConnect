package com.educonnect.controller;

import com.educonnect.entity.Announcement;
import com.educonnect.repository.AnnouncementRepository;
import com.educonnect.repository.UserRepository;
import com.educonnect.service.SseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AnnouncementController {

    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;
    private final SseService sseService;

    public AnnouncementController(AnnouncementRepository announcementRepository, UserRepository userRepository, SseService sseService) {
        this.announcementRepository = announcementRepository;
        this.userRepository = userRepository;
        this.sseService = sseService;
    }

    @GetMapping
    public List<Announcement> getAllAnnouncements() {
        return announcementRepository.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    public ResponseEntity<?> createAnnouncement(@RequestBody com.educonnect.announcement.dto.AnnouncementRequest announcementReq) {
        Announcement announcement = new Announcement();
        announcement.setTitle(announcementReq.getTitle());
        announcement.setContent(announcementReq.getContent());
        
        java.util.UUID senderId = java.util.Objects.requireNonNull(announcementReq.getSenderId(), "Sender ID must not be null");
        announcement.setSender(userRepository.findById(senderId).orElseThrow());
        
        Announcement saved = announcementRepository.save(announcement);
        
        sseService.sendGlobalNotification("NEW_ANNOUNCEMENT", saved);
        
        return ResponseEntity.ok(saved);
    }
}