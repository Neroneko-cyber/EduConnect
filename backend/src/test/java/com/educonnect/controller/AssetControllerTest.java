package com.educonnect.controller;

import com.educonnect.entity.Asset;
import com.educonnect.entity.AssetTicket;
import com.educonnect.entity.AssetTicketStatus;
import com.educonnect.service.AssetService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.educonnect.config.SecurityConfig;
import org.springframework.context.annotation.Import;
import com.educonnect.service.DocumentExportService;

@WebMvcTest(AssetController.class)
@AutoConfigureMockMvc
@Import(SecurityConfig.class)
@SuppressWarnings("null")
class AssetControllerTest {

    private final UUID TEST_UUID = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AssetService assetService;

    @MockBean
    private DocumentExportService documentExportService;



    @Test
    @WithMockUser(roles = "GURU")
    void searchAssets_success() throws Exception {
        Asset asset = new Asset();
        asset.setId(TEST_UUID);
        asset.setName("Laptop");
        asset.setCode("LPT-01");

        when(assetService.searchAssets("Laptop")).thenReturn(Arrays.asList(asset));

        mockMvc.perform(get("/api/assets/search")
                .param("keyword", "Laptop")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Laptop"))
                .andExpect(jsonPath("$[0].code").value("LPT-01"));
    }

    @Test
    @WithMockUser(roles = "TU")
    void getAllTickets_success() throws Exception {
        AssetTicket ticket = new AssetTicket();
        ticket.setId(TEST_UUID);
        ticket.setDescription("Rusak layar");
        ticket.setStatus(AssetTicketStatus.REPORTED);

        when(assetService.getAllTickets()).thenReturn(Arrays.asList(ticket));

        mockMvc.perform(get("/api/assets/tickets")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].description").value("Rusak layar"));
    }

    @Test
    @WithMockUser(roles = "GURU")
    void getTicketsByReporter_success() throws Exception {
        AssetTicket ticket = new AssetTicket();
        ticket.setId(TEST_UUID);
        ticket.setDescription("Keyboard error");

        when(assetService.getTicketsByReporter(TEST_UUID)).thenReturn(Arrays.asList(ticket));

        mockMvc.perform(get("/api/assets/tickets/reporter/" + TEST_UUID)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].description").value("Keyboard error"));
    }

    @Test
    @WithMockUser(roles = "GURU")
    void reportBrokenAsset_success() throws Exception {
        AssetTicket ticket = new AssetTicket();
        ticket.setId(TEST_UUID);
        ticket.setDescription("Lampu putus");
        ticket.setStatus(AssetTicketStatus.REPORTED);

        when(assetService.reportBrokenAsset(eq(TEST_UUID), eq(TEST_UUID), eq("Lampu putus"), any()))
                .thenReturn(ticket);

        MockMultipartFile file = new MockMultipartFile("photo", "test.jpg", "image/jpeg", "data".getBytes());

        mockMvc.perform(multipart("/api/assets/tickets")
                .file(file)
                .param("assetId", TEST_UUID.toString())
                .param("reporterId", TEST_UUID.toString())
                .param("description", "Lampu putus")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Lampu putus"));
    }
}
