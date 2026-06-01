package com.educonnect.controller;

import com.educonnect.common.response.ApiResponse;
import com.educonnect.entity.User;
import com.educonnect.receipt.dto.ReadReceiptRequest;
import com.educonnect.receipt.dto.ReadStatusResponse;
import com.educonnect.repository.UserRepository;
import com.educonnect.service.ReadReceiptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/receipts")
@CrossOrigin(origins = "*")
public class ReadReceiptController {

    @Autowired
    private ReadReceiptService readReceiptService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/mark-read")
    public ResponseEntity<ApiResponse<String>> markAsRead(@RequestBody ReadReceiptRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User tidak ditemukan"));

        readReceiptService.markAsRead(currentUser.getId(), request.getTargetId(), request.getTargetType());

        return ResponseEntity.ok(ApiResponse.<String>builder()
                .status(200)
                .message("Ditandai sudah dibaca.")
                .data("OK")
                .build());
    }

    @GetMapping("/status/announcement/{id}")
    @PreAuthorize("hasRole('KEPALA_SEKOLAH')")
    public ResponseEntity<ApiResponse<ReadStatusResponse>> getAnnouncementStatus(@PathVariable java.util.UUID id) {
        ReadStatusResponse response = readReceiptService.getAnnouncementReadStatus(id);
        return ResponseEntity.ok(ApiResponse.<ReadStatusResponse>builder()
                .status(200)
                .message("Status pembaca pengumuman berhasil diambil.")
                .data(response)
                .build());
    }

    @GetMapping("/status/disposition/{id}")
    public ResponseEntity<ApiResponse<Boolean>> getDispositionStatus(@PathVariable java.util.UUID id, @RequestParam java.util.UUID receiverId) {
        boolean isRead = readReceiptService.getDispositionReadStatus(id, receiverId);
        return ResponseEntity.ok(ApiResponse.<Boolean>builder()
                .status(200)
                .message("Status pembaca disposisi berhasil diambil.")
                .data(isRead)
                .build());
    }
}