package com.educonnect.controller;

import com.educonnect.common.response.ApiResponse;
import com.educonnect.entity.User;
import com.educonnect.journal.dto.JournalRequest;
import com.educonnect.journal.dto.JournalResponse;
import com.educonnect.repository.UserRepository;
import com.educonnect.service.DailyJournalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/journals")
@CrossOrigin(origins = "*")
public class DailyJournalController {

    @Autowired
    private DailyJournalService dailyJournalService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasRole('GURU')")
    public ResponseEntity<ApiResponse<JournalResponse>> createJournal(@RequestBody JournalRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User teacher = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User tidak ditemukan"));

        com.educonnect.entity.DailyJournal saved = dailyJournalService.createJournal(request, teacher);
        JournalResponse response = dailyJournalService.getJournalDetail(saved.getId());

        return ResponseEntity.status(201).body(ApiResponse.<JournalResponse>builder()
                .status(201)
                .message("Jurnal berhasil dibuat.")
                .data(response)
                .build());
    }

    @GetMapping("/class/{classroomId}")
    @PreAuthorize("hasRole('KEPALA_SEKOLAH') or hasRole('GURU')")
    public ResponseEntity<ApiResponse<List<JournalResponse>>> getJournalsByClassroom(@PathVariable java.util.UUID classroomId) {
        List<JournalResponse> journals = dailyJournalService.getJournalsByClassroom(classroomId);
        return ResponseEntity.ok(ApiResponse.<List<JournalResponse>>builder()
                .status(200)
                .message("Daftar jurnal berhasil diambil.")
                .data(journals)
                .build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('KEPALA_SEKOLAH') or hasRole('GURU')")
    public ResponseEntity<ApiResponse<JournalResponse>> getJournalDetail(@PathVariable java.util.UUID id) {
        JournalResponse response = dailyJournalService.getJournalDetail(id);
        return ResponseEntity.ok(ApiResponse.<JournalResponse>builder()
                .status(200)
                .message("Detail jurnal berhasil diambil.")
                .data(response)
                .build());
    }
}