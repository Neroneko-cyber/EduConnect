package com.educonnect.controller;

import com.educonnect.entity.Disposition;
import com.educonnect.entity.DispositionStatus;
import com.educonnect.repository.DispositionRepository;
import com.educonnect.repository.UserRepository;
import com.educonnect.service.SseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping("/api/dispositions")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@SuppressWarnings("null")
public class DispositionController {
    
    private final DispositionRepository dispositionRepository;
    private final UserRepository userRepository;
    private final SseService sseService;

    private final com.educonnect.service.CloudinaryService cloudinaryService;
    private final com.educonnect.service.DocumentExportService documentExportService;

    public DispositionController(DispositionRepository dispositionRepository, UserRepository userRepository, SseService sseService, com.educonnect.service.CloudinaryService cloudinaryService, com.educonnect.service.DocumentExportService documentExportService) {
        this.dispositionRepository = dispositionRepository;
        this.userRepository = userRepository;
        this.sseService = sseService;
        this.cloudinaryService = cloudinaryService;
        this.documentExportService = documentExportService;
    }

    @GetMapping("/receiver/{userId}")
    public List<Disposition> getDispositionsByReceiver(@PathVariable java.util.UUID userId) {
        return dispositionRepository.findByReceiverIdOrderByCreatedAtDesc(userId);
    }

    @PostMapping
    public ResponseEntity<?> createDisposition(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("senderId") java.util.UUID senderId,
            @RequestParam("receiverId") java.util.UUID receiverId,
            @RequestParam(value = "file", required = false) org.springframework.web.multipart.MultipartFile file) {
        
        try {
            Disposition disposition = new Disposition();
            disposition.setTitle(title);
            disposition.setDescription(description);
            disposition.setStatus(DispositionStatus.TODO);
            
            disposition.setSender(userRepository.findById(senderId).orElseThrow(() -> new IllegalArgumentException("Sender not found")));
            disposition.setReceiver(userRepository.findById(receiverId).orElseThrow(() -> new IllegalArgumentException("Receiver not found")));
            
            if (file != null && !file.isEmpty()) {
                String fileUrl = cloudinaryService.uploadImage(file, "educonnect_dispositions");
                disposition.setAttachmentUrl(fileUrl);
            }
            
            Disposition saved = dispositionRepository.save(disposition);
            sseService.sendNotification(saved.getReceiver().getId(), "NEW_DISPOSITION", saved);
            
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Gagal membuat disposisi: " + e.getMessage());
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable java.util.UUID id, @RequestBody com.educonnect.disposition.dto.DispositionStatusUpdateRequest statusReq) {
        Disposition disposition = dispositionRepository.findById(java.util.Objects.requireNonNull(id)).orElseThrow();
        disposition.setStatus(statusReq.getStatus());
        Disposition saved = dispositionRepository.save(disposition);
        
        sseService.sendNotification(java.util.Objects.requireNonNull(saved.getSender().getId()), "DISPOSITION_UPDATED", saved);
        
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{id}/export-word")
    public ResponseEntity<org.springframework.core.io.Resource> exportToWord(@PathVariable java.util.UUID id) {
        try {
            Disposition disposition = dispositionRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Disposition not found"));
            java.io.File wordFile = documentExportService.exportDispositionToWord(disposition);
            org.springframework.core.io.InputStreamResource resource = new org.springframework.core.io.InputStreamResource(new java.io.FileInputStream(wordFile));
            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + wordFile.getName())
                    .contentType(org.springframework.http.MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
                    .contentLength(wordFile.length())
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}