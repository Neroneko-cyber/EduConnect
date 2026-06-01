package com.educonnect.controller;

import com.educonnect.grade.dto.*;
import com.educonnect.service.DocumentExportService;
import com.educonnect.service.GradeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/grades")
@CrossOrigin(origins = "*") // For development purposes
@SuppressWarnings("null")
public class GradeController {

    @Autowired
    private GradeService gradeService;

    @Autowired
    private DocumentExportService documentExportService;

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<GradeResponse>> getGrades(
            @PathVariable UUID classId,
            @RequestParam String academicYear,
            @RequestParam String semester) {
        List<GradeResponse> grades = gradeService.getGradesByClassroom(classId, academicYear, semester);
        return ResponseEntity.ok(grades);
    }

    @GetMapping("/class/{classId}/subject")
    public ResponseEntity<List<GradeResponse>> getGradesBySubject(
            @PathVariable UUID classId,
            @RequestParam String academicYear,
            @RequestParam String semester,
            @RequestParam String subject) {
        List<GradeResponse> grades = gradeService.getGradesByClassroomAndSubject(classId, academicYear, semester, subject);
        return ResponseEntity.ok(grades);
    }

    @PatchMapping("/bulk")
    public ResponseEntity<?> bulkUpdateGrades(@RequestBody BulkGradeUpdateRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String teacherUsername = auth.getName();
            gradeService.bulkUpdateGrades(request, teacherUsername);
            return ResponseEntity.ok("Nilai berhasil disimpan.");
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Terjadi kesalahan sistem.");
        }
    }

    @GetMapping("/report-card/{classId}")
    public ResponseEntity<List<ReportCardResponse>> getReportCard(
            @PathVariable UUID classId,
            @RequestParam String academicYear,
            @RequestParam String semester) {
        List<ReportCardResponse> reportCards = gradeService.getReportCard(classId, academicYear, semester);
        return ResponseEntity.ok(reportCards);
    }

    @GetMapping("/aggregation/{classId}")
    public ResponseEntity<List<GradeAggregationResponse>> getGradeAggregation(
            @PathVariable UUID classId,
            @RequestParam String academicYear,
            @RequestParam String semester) {
        List<GradeAggregationResponse> aggregation = gradeService.getGradeAggregation(classId, academicYear, semester);
        return ResponseEntity.ok(aggregation);
    }

    @GetMapping("/export/pdf/{studentId}")
    public ResponseEntity<Resource> exportRaporPdf(
            @PathVariable UUID studentId,
            @RequestParam String academicYear,
            @RequestParam String semester) {
        try {
            File pdfFile = documentExportService.exportRaporPdf(studentId, academicYear, semester);
            Resource resource = new FileSystemResource(pdfFile);

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + pdfFile.getName());
            headers.add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_PDF_VALUE);

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentLength(pdfFile.length())
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}