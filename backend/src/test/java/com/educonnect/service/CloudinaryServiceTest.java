package com.educonnect.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CloudinaryServiceTest {

    @Mock
    private Cloudinary cloudinary;

    @Mock
    private Uploader uploader;

    @InjectMocks
    private CloudinaryService cloudinaryService;

    @BeforeEach
    void setUp() {
        when(cloudinary.uploader()).thenReturn(uploader);
    }

    @Test
    void uploadImage_success() throws IOException {
        MockMultipartFile file = new MockMultipartFile("file", "test.jpg", "image/jpeg", "dummy data".getBytes());
        Map<String, Object> expectedResponse = Map.of("secure_url", "https://res.cloudinary.com/demo/image/upload/v123456/test.jpg");
        
        when(uploader.upload(any(byte[].class), anyMap())).thenReturn(expectedResponse);

        String url = cloudinaryService.uploadImage(file, "test_folder");

        assertEquals("https://res.cloudinary.com/demo/image/upload/v123456/test.jpg", url);
    }
}
