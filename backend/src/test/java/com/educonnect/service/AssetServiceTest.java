package com.educonnect.service;

import com.educonnect.entity.*;
import com.educonnect.repository.AssetRepository;
import com.educonnect.repository.AssetTicketRepository;
import com.educonnect.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class AssetServiceTest {

    @Mock
    private AssetRepository assetRepository;

    @Mock
    private AssetTicketRepository assetTicketRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CloudinaryService cloudinaryService;

    @InjectMocks
    private AssetService assetService;

    private Asset testAsset;
    private User testUser;
    private AssetTicket testTicket;
    private final UUID TEST_UUID = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");

    @BeforeEach
    void setUp() {
        testAsset = new Asset();
        testAsset.setId(TEST_UUID);
        testAsset.setName("Proyektor Epson");
        testAsset.setCode("PRJ-01");
        testAsset.setCondition(AssetCondition.GOOD);

        testUser = new User();
        testUser.setId(TEST_UUID);
        testUser.setUsername("guru1");

        testTicket = new AssetTicket();
        testTicket.setId(TEST_UUID);
        testTicket.setAsset(testAsset);
        testTicket.setReporter(testUser);
        testTicket.setStatus(AssetTicketStatus.REPORTED);
    }

    @Test
    void searchAssets_withNullKeyword_returnsAll() {
        when(assetRepository.findAll()).thenReturn(Arrays.asList(testAsset));

        List<Asset> result = assetService.searchAssets(null);

        assertEquals(1, result.size());
        verify(assetRepository).findAll();
    }

    @Test
    void searchAssets_withKeyword_returnsMatching() {
        when(assetRepository.findByNameContainingIgnoreCaseOrCodeContainingIgnoreCase("Epson", "Epson"))
                .thenReturn(Arrays.asList(testAsset));

        List<Asset> result = assetService.searchAssets("Epson");

        assertEquals(1, result.size());
        verify(assetRepository).findByNameContainingIgnoreCaseOrCodeContainingIgnoreCase("Epson", "Epson");
    }

    @Test
    void reportBrokenAsset_success() throws IOException {
        when(assetRepository.findById(TEST_UUID)).thenReturn(Optional.of(testAsset));
        when(userRepository.findById(TEST_UUID)).thenReturn(Optional.of(testUser));
        when(cloudinaryService.uploadImage(any(), anyString())).thenReturn("http://image.url");
        when(assetTicketRepository.save(any(AssetTicket.class))).thenAnswer(i -> i.getArguments()[0]);

        MockMultipartFile file = new MockMultipartFile("photo", "test.jpg", "image/jpeg", "test data".getBytes());
        
        AssetTicket result = assetService.reportBrokenAsset(TEST_UUID, TEST_UUID, "Layar buram", file);

        assertNotNull(result);
        assertEquals(AssetCondition.BROKEN, testAsset.getCondition());
        assertEquals("http://image.url", result.getPhotoUrl());
        assertEquals(AssetTicketStatus.REPORTED, result.getStatus());
        verify(assetRepository).save(testAsset);
        verify(assetTicketRepository).save(any(AssetTicket.class));
    }

    @Test
    void forwardToKepsek_success() {
        when(assetTicketRepository.findById(TEST_UUID)).thenReturn(Optional.of(testTicket));
        when(assetTicketRepository.save(any(AssetTicket.class))).thenAnswer(i -> i.getArguments()[0]);

        AssetTicket result = assetService.forwardToKepsek(TEST_UUID, new BigDecimal("1500000"));

        assertEquals(AssetTicketStatus.FORWARDED, result.getStatus());
        assertEquals(new BigDecimal("1500000"), result.getEstimatedCost());
        verify(assetTicketRepository).save(testTicket);
    }

    @Test
    void kepsekRespond_approved() {
        when(assetTicketRepository.findById(TEST_UUID)).thenReturn(Optional.of(testTicket));
        when(assetTicketRepository.save(any(AssetTicket.class))).thenAnswer(i -> i.getArguments()[0]);

        AssetTicket result = assetService.kepsekRespond(TEST_UUID, true, "Setuju perbaikan");

        assertEquals(AssetTicketStatus.APPROVED, result.getStatus());
        assertEquals("Setuju perbaikan", result.getKepsekFeedback());
        verify(assetTicketRepository).save(testTicket);
    }

    @Test
    void tuRespondToGuru_success() {
        when(assetTicketRepository.findById(TEST_UUID)).thenReturn(Optional.of(testTicket));
        when(assetTicketRepository.save(any(AssetTicket.class))).thenAnswer(i -> i.getArguments()[0]);

        AssetTicket result = assetService.tuRespondToGuru(TEST_UUID, "Sudah diperbaiki");

        assertEquals(AssetTicketStatus.RESOLVED, result.getStatus());
        assertEquals("Sudah diperbaiki", result.getTuFeedback());
        verify(assetTicketRepository).save(testTicket);
    }
}
