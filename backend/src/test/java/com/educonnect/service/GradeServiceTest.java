package com.educonnect.service;

import com.educonnect.grade.dto.BulkGradeUpdateRequest;
import com.educonnect.grade.dto.GradeRequest;
import com.educonnect.grade.dto.GradeResponse;
import com.educonnect.entity.Classroom;
import com.educonnect.entity.GlobalSetting;
import com.educonnect.entity.StudentGrade;
import com.educonnect.entity.User;
import com.educonnect.repository.ClassroomRepository;
import com.educonnect.repository.GlobalSettingRepository;
import com.educonnect.repository.StudentGradeRepository;
import com.educonnect.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class GradeServiceTest {

    @Mock
    private StudentGradeRepository studentGradeRepository;

    @Mock
    private GlobalSettingRepository globalSettingRepository;

    @Mock
    private ClassroomRepository classroomRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private GradeService gradeService;

    private Classroom classroom;
    private User student;
    private StudentGrade grade;
    private GradeRequest gradeDto;
    private final UUID TEST_UUID = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");

    @BeforeEach
    void setUp() {
        classroom = new Classroom();
        classroom.setId(TEST_UUID);
        classroom.setGradeClass("Kelas 10A");

        student = new User();
        student.setId(TEST_UUID);
        student.setUsername("siswa1");

        grade = new StudentGrade();
        grade.setId(TEST_UUID);
        grade.setStudent(student);
        grade.setClassroom(classroom);
        grade.setSubject("Matematika");
        grade.setAcademicYear("2023/2024");
        grade.setSemester("Ganjil");
        grade.setTaskScore(80.0);
        grade.setExamScore(80.0);
        grade.setUtsScore(85.0);
        grade.setUasScore(90.0);
        grade.setFinalScore(335.0);

        gradeDto = new GradeRequest();
        gradeDto.setStudentId(TEST_UUID);
        gradeDto.setSubject("Matematika");
        gradeDto.setTaskScore(80.0);
        gradeDto.setExamScore(80.0);
        gradeDto.setUtsScore(85.0);
        gradeDto.setUasScore(90.0);
    }

    @Test
    void getGradesByClassroom_success() {
        when(studentGradeRepository.findByClassroomIdAndAcademicYearAndSemester(TEST_UUID, "2023/2024", "Ganjil"))
                .thenReturn(Arrays.asList(grade));

        List<GradeResponse> result = gradeService.getGradesByClassroom(TEST_UUID, "2023/2024", "Ganjil");

        assertEquals(1, result.size());
        assertEquals("Matematika", result.get(0).getSubject());
        assertEquals(335.0, result.get(0).getFinalScore());
    }

    @Test
    void bulkUpdateGrades_success() {
        BulkGradeUpdateRequest request = new BulkGradeUpdateRequest();
        request.setClassroomId(TEST_UUID);
        request.setAcademicYear("2023/2024");
        request.setSemester("Ganjil");
        request.setGrades(Arrays.asList(gradeDto));

        when(globalSettingRepository.findTopByOrderByIdDesc()).thenReturn(Optional.empty());
        when(classroomRepository.findById(TEST_UUID)).thenReturn(Optional.of(classroom));
        when(userRepository.findById(TEST_UUID)).thenReturn(Optional.of(student));

        gradeService.bulkUpdateGrades(request, "guru1");

        verify(studentGradeRepository, times(1)).save(any(StudentGrade.class));
    }

    @Test
    void bulkUpdateGrades_throwsExceptionIfDeadlinePassed() {
        GlobalSetting setting = new GlobalSetting();
        setting.setGradeDeadline(LocalDate.now().minusDays(1)); // Deadline yesterday
        
        when(globalSettingRepository.findTopByOrderByIdDesc()).thenReturn(Optional.of(setting));

        BulkGradeUpdateRequest request = new BulkGradeUpdateRequest();
        request.setClassroomId(TEST_UUID);
        request.setGrades(Arrays.asList(gradeDto));

        Exception exception = assertThrows(IllegalStateException.class, () -> {
            gradeService.bulkUpdateGrades(request, "guru1");
        });

        assertEquals("Batas waktu pengisian nilai telah lewat.", exception.getMessage());
        verify(studentGradeRepository, never()).save(any(StudentGrade.class));
    }

    @Test
    void bulkUpdateGrades_calculatesFinalScoreCorrectly() {
        BulkGradeUpdateRequest request = new BulkGradeUpdateRequest();
        request.setClassroomId(TEST_UUID);
        request.setAcademicYear("2023/2024");
        request.setSemester("Ganjil");
        
        GradeRequest newGradeDto = new GradeRequest();
        newGradeDto.setStudentId(TEST_UUID);
        newGradeDto.setSubject("Fisika");
        newGradeDto.setTaskScore(100.0);
        newGradeDto.setExamScore(80.0);
        newGradeDto.setUtsScore(80.0);
        newGradeDto.setUasScore(90.0);
        
        request.setGrades(Arrays.asList(newGradeDto));

        when(globalSettingRepository.findTopByOrderByIdDesc()).thenReturn(Optional.empty());
        when(classroomRepository.findById(TEST_UUID)).thenReturn(Optional.of(classroom));
        when(userRepository.findById(TEST_UUID)).thenReturn(Optional.of(student));

        gradeService.bulkUpdateGrades(request, "guru1");

        verify(studentGradeRepository).save(argThat(g -> 
            g.getSubject().equals("Fisika") && g.getFinalScore() == 350.0
        ));
    }
}
