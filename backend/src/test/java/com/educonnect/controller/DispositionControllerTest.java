package com.educonnect.controller;

import com.educonnect.disposition.dto.DispositionRequest;
import com.educonnect.entity.Disposition;
import com.educonnect.entity.DispositionStatus;
import com.educonnect.entity.User;
import com.educonnect.repository.DispositionRepository;
import com.educonnect.repository.UserRepository;
import com.educonnect.service.SseService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.educonnect.config.SecurityConfig;
import org.springframework.context.annotation.Import;

@WebMvcTest(DispositionController.class)
@AutoConfigureMockMvc
@Import(SecurityConfig.class)
@SuppressWarnings("null")
class DispositionControllerTest {

    private final UUID TEST_UUID = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
    private final UUID TEST_UUID2 = UUID.fromString("123e4567-e89b-12d3-a456-426614174001");
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DispositionRepository dispositionRepository;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private SseService sseService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "GURU")
    void getDispositionsByReceiver_success() throws Exception {
        Disposition disposition = new Disposition();
        disposition.setId(TEST_UUID);
        disposition.setTitle("Tugas 1");

        when(dispositionRepository.findByReceiverIdOrderByCreatedAtDesc(TEST_UUID)).thenReturn(Arrays.asList(disposition));

        mockMvc.perform(get("/api/dispositions/receiver/" + TEST_UUID)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Tugas 1"));
    }

    @Test
    @WithMockUser(roles = "KEPALA_SEKOLAH")
    void createDisposition_success() throws Exception {
        DispositionRequest req = new DispositionRequest("Rapat", "Bahas anggaran", TEST_UUID, TEST_UUID2);

        User sender = new User();
        sender.setId(TEST_UUID);
        
        User receiver = new User();
        receiver.setId(TEST_UUID2);

        Disposition saved = new Disposition();
        saved.setId(TEST_UUID);
        saved.setTitle("Rapat");
        saved.setStatus(DispositionStatus.TODO);
        saved.setSender(sender);
        saved.setReceiver(receiver);

        when(userRepository.findById(TEST_UUID)).thenReturn(Optional.of(sender));
        when(userRepository.findById(TEST_UUID2)).thenReturn(Optional.of(receiver));
        when(dispositionRepository.save(any(Disposition.class))).thenReturn(saved);

        mockMvc.perform(post("/api/dispositions")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Rapat"));
    }
}
