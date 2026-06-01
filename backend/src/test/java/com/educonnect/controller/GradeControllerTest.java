package com.educonnect.controller;

import com.educonnect.grade.dto.BulkGradeUpdateRequest;
import com.educonnect.grade.dto.GradeResponse;
import com.educonnect.service.DocumentExportService;
import com.educonnect.service.GradeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.io.File;
import java.util.Arrays;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.educonnect.config.SecurityConfig;
import org.springframework.context.annotation.Import;

@WebMvcTest(GradeController.class)
@AutoConfigureMockMvc
@Import(SecurityConfig.class)
@SuppressWarnings("null")
class GradeControllerTest {

    private final UUID TEST_UUID = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GradeService gradeService;

    @MockBean
    private DocumentExportService documentExportService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "GURU")
    void getGrades_success() throws Exception {
        GradeResponse grade = new GradeResponse();
        grade.setSubject("Matematika");
        grade.setFinalScore(90.0);

        when(gradeService.getGradesByClassroom(TEST_UUID, "2023/2024", "Ganjil")).thenReturn(Arrays.asList(grade));

        mockMvc.perform(get("/api/grades/class/" + TEST_UUID)
                .param("academicYear", "2023/2024")
                .param("semester", "Ganjil")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].subject").value("Matematika"))
                .andExpect(jsonPath("$[0].finalScore").value(90.0));
    }

    @Test
    @WithMockUser(roles = "GURU", username = "guru1")
    void bulkUpdateGrades_success() throws Exception {
        BulkGradeUpdateRequest req = new BulkGradeUpdateRequest();
        req.setClassroomId(TEST_UUID);
        req.setAcademicYear("2023/2024");
        req.setSemester("Ganjil");

        doNothing().when(gradeService).bulkUpdateGrades(any(BulkGradeUpdateRequest.class), any(String.class));

        mockMvc.perform(patch("/api/grades/bulk")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(content().string("Nilai berhasil disimpan."));
    }

    @Test
    @WithMockUser(roles = "GURU", username = "guru1")
    void bulkUpdateGrades_deadlinePassed_returnsBadRequest() throws Exception {
        BulkGradeUpdateRequest req = new BulkGradeUpdateRequest();
        req.setClassroomId(TEST_UUID);
        
        doThrow(new IllegalStateException("Batas waktu pengisian nilai telah lewat."))
                .when(gradeService).bulkUpdateGrades(any(BulkGradeUpdateRequest.class), any(String.class));

        mockMvc.perform(patch("/api/grades/bulk")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Batas waktu pengisian nilai telah lewat."));
    }

    @Test
    @WithMockUser(roles = "GURU")
    void exportRaporPdf_success() throws Exception {
        File tempFile = File.createTempFile("rapor_test", ".pdf");
        
        when(documentExportService.exportRaporPdf(TEST_UUID, "2023/2024", "Ganjil")).thenReturn(tempFile);

        mockMvc.perform(get("/api/grades/export/pdf/" + TEST_UUID)
                .param("academicYear", "2023/2024")
                .param("semester", "Ganjil"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=" + tempFile.getName()))
                .andExpect(content().contentType(MediaType.APPLICATION_PDF));

        tempFile.delete();
    }
}
