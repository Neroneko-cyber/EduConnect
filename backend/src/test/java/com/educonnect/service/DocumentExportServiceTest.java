package com.educonnect.service;

import com.educonnect.entity.Asset;
import com.educonnect.entity.AssetCondition;
import com.educonnect.entity.Classroom;
import com.educonnect.entity.StudentGrade;
import com.educonnect.entity.User;
import com.educonnect.repository.AssetRepository;
import com.educonnect.repository.StudentGradeRepository;
import com.educonnect.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.File;
import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentExportServiceTest {

    @Mock
    private StudentGradeRepository studentGradeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AssetRepository assetRepository;

    @InjectMocks
    private DocumentExportService documentExportService;

    private User student;
    private StudentGrade grade;
    private Asset asset;
    private final UUID TEST_UUID = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");

    @BeforeEach
    void setUp() {
        Classroom classroom = new Classroom();
        classroom.setId(TEST_UUID);
        classroom.setGradeClass("10A");

        student = new User();
        student.setId(TEST_UUID);
        student.setUsername("siswa1");
        student.setName("Siswa Satu");
        student.setKelas(classroom);

        grade = new StudentGrade();
        grade.setSubject("Matematika");
        grade.setDailyScore(80.0);
        grade.setUtsScore(85.0);
        grade.setUasScore(90.0);
        grade.setFinalScore(85.5);

        asset = new Asset();
        asset.setId(TEST_UUID);
        asset.setCode("PRJ-01");
        asset.setName("Proyektor Epson");
        asset.setCondition(AssetCondition.GOOD);
        asset.setLocation("Kelas 10A");
    }

    @Test
    void exportRaporPdf_success() throws Exception {
        when(userRepository.findById(TEST_UUID)).thenReturn(Optional.of(student));
        when(studentGradeRepository.findByStudentIdAndAcademicYearAndSemester(TEST_UUID, "2023/2024", "Ganjil"))
                .thenReturn(Arrays.asList(grade));

        File result = documentExportService.exportRaporPdf(TEST_UUID, "2023/2024", "Ganjil");

        assertNotNull(result);
        assertTrue(result.exists());
        assertTrue(result.getName().endsWith(".pdf"));
        assertTrue(result.length() > 0);
        
        // Clean up
        result.delete();
    }

    @Test
    void exportRaporPdf_throwsExceptionIfStudentNotFound() {
        when(userRepository.findById(TEST_UUID)).thenReturn(Optional.empty());

        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            documentExportService.exportRaporPdf(TEST_UUID, "2023/2024", "Ganjil");
        });

        assertEquals("Siswa tidak ditemukan", exception.getMessage());
    }

    @Test
    void exportAssetRecapExcel_success() throws Exception {
        when(assetRepository.findAll()).thenReturn(Arrays.asList(asset));

        File result = documentExportService.exportAssetRecapExcel();

        assertNotNull(result);
        assertTrue(result.exists());
        assertTrue(result.getName().endsWith(".xlsx"));
        assertTrue(result.length() > 0);
        
        // Clean up
        result.delete();
    }

    @Test
    void exportAssetStatsPptx_success() throws Exception {
        when(assetRepository.findAll()).thenReturn(Arrays.asList(asset));

        File result = documentExportService.exportAssetStatsPptx();

        assertNotNull(result);
        assertTrue(result.exists());
        assertTrue(result.getName().endsWith(".pptx"));
        assertTrue(result.length() > 0);

        // Clean up
        result.delete();
    }
}
