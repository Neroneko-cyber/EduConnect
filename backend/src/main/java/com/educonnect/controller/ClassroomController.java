package com.educonnect.controller;

import com.educonnect.entity.Classroom;
import com.educonnect.repository.ClassroomRepository;
import com.educonnect.common.response.ApiResponse;
import com.educonnect.entity.User;
import com.educonnect.entity.StudentStatus;
import com.educonnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/classrooms")
@CrossOrigin(origins = "*")
public class ClassroomController {

    @Autowired
    private ClassroomRepository classroomRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_KEPALA_SEKOLAH', 'ROLE_WAKASEK', 'ROLE_GURU', 'ROLE_TU')")
    public ResponseEntity<ApiResponse<List<Classroom>>> getAllClassrooms() {
        List<Classroom> classrooms = classroomRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK, "Data kelas berhasil diambil", classrooms));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_TU')")
    public ResponseEntity<ApiResponse<Classroom>> createClassroom(@RequestBody ClassroomRequest request) {
        Classroom classroom = new Classroom();
        classroom.setGradeClass(request.getGradeClass());
        classroom.setName(request.getName());
        classroom.setAcademicYear(request.getAcademicYear());

        Classroom saved = classroomRepository.save(classroom);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(HttpStatus.CREATED, "Data kelas berhasil disimpan", saved));
    }

    public static class ClassroomRequest {
        private String gradeClass;
        private String name;
        private String academicYear;

        public String getGradeClass() { return gradeClass; }
        public void setGradeClass(String gradeClass) { this.gradeClass = gradeClass; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getAcademicYear() { return academicYear; }
        public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
    }

    @PostMapping("/{classroomId}/students")
    @PreAuthorize("hasAuthority('ROLE_TU')")
    public ResponseEntity<ApiResponse<Void>> assignStudentsToClassroom(
            @PathVariable java.util.UUID classroomId,
            @RequestBody List<java.util.UUID> studentIds) {
        
        java.util.Optional<Classroom> classroomOpt = classroomRepository.findById(classroomId);
        if (classroomOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(HttpStatus.NOT_FOUND, "Kelas tidak ditemukan"));
        }
        Classroom classroom = classroomOpt.get();

        List<User> students = userRepository.findAllById(studentIds);
        for (User student : students) {
            if (student.getRole() == com.educonnect.entity.Role.SISWA) {
                student.setKelas(classroom);
                student.setStudentStatus(StudentStatus.ACTIVE);
            }
        }
        userRepository.saveAll(students);

        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK, "Siswa berhasil ditambahkan ke kelas", null));
    }

    @DeleteMapping("/{classroomId}/students/{studentId}")
    @PreAuthorize("hasAuthority('ROLE_TU')")
    public ResponseEntity<ApiResponse<Void>> removeStudentFromClassroom(
            @PathVariable java.util.UUID classroomId,
            @PathVariable java.util.UUID studentId,
            @RequestParam(name = "reason") String reason) {

        java.util.Optional<User> studentOpt = userRepository.findById(studentId);
        if (studentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(HttpStatus.NOT_FOUND, "Siswa tidak ditemukan"));
        }

        User student = studentOpt.get();
        if (student.getKelas() == null || !student.getKelas().getId().equals(classroomId)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(HttpStatus.BAD_REQUEST, "Siswa tidak berada di kelas ini"));
        }

        student.setKelas(null);
        if ("DROPOUT".equalsIgnoreCase(reason)) {
            student.setStudentStatus(StudentStatus.DROPOUT);
        } else if ("TRANSFERRED".equalsIgnoreCase(reason)) {
            student.setStudentStatus(StudentStatus.TRANSFERRED);
        } else {
            student.setStudentStatus(StudentStatus.UNASSIGNED);
        }
        userRepository.save(student);

        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK, "Siswa berhasil dikeluarkan dari kelas", null));
    }
}
