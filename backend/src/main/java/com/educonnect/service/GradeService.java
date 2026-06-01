package com.educonnect.service;

import com.educonnect.grade.dto.*;
import com.educonnect.entity.Classroom;
import com.educonnect.entity.GlobalSetting;
import com.educonnect.entity.StudentGrade;
import com.educonnect.entity.User;
import com.educonnect.repository.ClassroomRepository;
import com.educonnect.repository.GlobalSettingRepository;
import com.educonnect.repository.StudentGradeRepository;
import com.educonnect.repository.UserRepository;
import com.educonnect.repository.GuruKelasMappingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class GradeService {

    @Autowired
    private StudentGradeRepository studentGradeRepository;

    @Autowired
    private GlobalSettingRepository globalSettingRepository;

    @Autowired
    private ClassroomRepository classroomRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GuruKelasMappingRepository guruKelasMappingRepository;

    public List<GradeResponse> getGradesByClassroom(java.util.UUID classroomId, String academicYear, String semester) {
        List<StudentGrade> grades = studentGradeRepository.findByClassroomIdAndAcademicYearAndSemester(classroomId, academicYear, semester);
        return grades.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public List<GradeResponse> getGradesByClassroomAndSubject(java.util.UUID classroomId, String academicYear, String semester, String subject) {
        List<StudentGrade> grades = studentGradeRepository.findByClassroomIdAndAcademicYearAndSemesterAndSubject(classroomId, academicYear, semester, subject);
        return grades.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Transactional
    public void bulkUpdateGrades(BulkGradeUpdateRequest request, String teacherUsername) {
        GlobalSetting setting = globalSettingRepository.findTopByOrderByIdDesc().orElse(null);
        if (setting != null && setting.getGradeDeadline() != null) {
            if (LocalDate.now().isAfter(setting.getGradeDeadline())) {
                throw new IllegalStateException("Batas waktu pengisian nilai telah lewat.");
            }
        }

        Classroom classroom = classroomRepository.findById(request.getClassroomId())
                .orElseThrow(() -> new IllegalArgumentException("Kelas tidak ditemukan"));

        User teacher = userRepository.findByUsername(teacherUsername)
                .orElseThrow(() -> new IllegalArgumentException("Guru tidak ditemukan"));

        // Validate RBAC
        validateTeacherAccess(teacher, classroom.getId());

        for (GradeRequest dto : request.getGrades()) {
            StudentGrade grade;
            if (dto.getId() != null) {
                grade = studentGradeRepository.findById(dto.getId())
                        .orElseThrow(() -> new IllegalArgumentException("Nilai tidak ditemukan"));
            } else {
                // Try to find existing grade by student, term, and subject before creating new
                Optional<StudentGrade> existingOpt = studentGradeRepository.findByStudentIdAndAcademicYearAndSemesterAndSubject(
                        dto.getStudentId(), request.getAcademicYear(), request.getSemester(), dto.getSubject()
                );
                
                if (existingOpt.isPresent()) {
                    grade = existingOpt.get();
                } else {
                    grade = new StudentGrade();
                    User student = userRepository.findById(dto.getStudentId())
                            .orElseThrow(() -> new IllegalArgumentException("Siswa tidak ditemukan"));
                    grade.setStudent(student);
                    grade.setClassroom(classroom);
                    grade.setAcademicYear(request.getAcademicYear());
                    grade.setSemester(request.getSemester());
                    grade.setSubject(dto.getSubject());
                }
            }

            grade.setTeacher(teacher);
            grade.setTaskScore(dto.getTaskScore());
            grade.setExamScore(dto.getExamScore());
            grade.setUtsScore(dto.getUtsScore());
            grade.setUasScore(dto.getUasScore());
            grade.setAttitudeScore(dto.getAttitudeScore());
            
            // Logika kalkulasi baru: task + exam + uts + uas
            double task = grade.getTaskScore() != null ? grade.getTaskScore() : 0;
            double exam = grade.getExamScore() != null ? grade.getExamScore() : 0;
            double uts = grade.getUtsScore() != null ? grade.getUtsScore() : 0;
            double uas = grade.getUasScore() != null ? grade.getUasScore() : 0;
            
            double finalScore = task + exam + uts + uas;
            grade.setFinalScore(finalScore);
            grade.setReportScore(finalScore / 4.0);

            studentGradeRepository.save(grade);
        }
    }

    private void validateTeacherAccess(User teacher, UUID classroomId) {
        if (teacher.getRole() == com.educonnect.entity.Role.KEPALA_SEKOLAH || teacher.getRole() == com.educonnect.entity.Role.TU) {
            return; // Admin access
        }
        
        if (teacher.getTipeGuru() == com.educonnect.entity.TeacherType.KELAS) {
            if (teacher.getKelas() == null || !teacher.getKelas().getId().equals(classroomId)) {
                throw new IllegalStateException("Anda tidak memiliki akses ke kelas ini.");
            }
        } else if (teacher.getTipeGuru() == com.educonnect.entity.TeacherType.KHUSUS) {
            boolean hasAccess = guruKelasMappingRepository.existsByGuruIdAndClassroomId(teacher.getId(), classroomId);
            if (!hasAccess) {
                throw new IllegalStateException("Anda tidak ditugaskan ke kelas ini.");
            }
        }
    }

    public List<ReportCardResponse> getReportCard(UUID classroomId, String academicYear, String semester) {
        List<User> students = userRepository.findByKelasId(classroomId);
        List<StudentGrade> allGrades = studentGradeRepository.findByClassroomIdAndAcademicYearAndSemester(classroomId, academicYear, semester);
        
        List<ReportCardResponse> reportCards = new ArrayList<>();
        
        for (User student : students) {
            ReportCardResponse rc = new ReportCardResponse();
            rc.setStudentId(student.getId());
            rc.setStudentName(student.getName());
            
            List<StudentGrade> studentGrades = allGrades.stream()
                    .filter(g -> g.getStudent().getId().equals(student.getId()))
                    .collect(Collectors.toList());
                    
            List<ReportCardResponse.SubjectScore> subjects = new ArrayList<>();
            double sumReportScore = 0;
            int count = 0;
            
            for (StudentGrade g : studentGrades) {
                ReportCardResponse.SubjectScore ss = new ReportCardResponse.SubjectScore();
                ss.setSubject(g.getSubject());
                ss.setTaskScore(g.getTaskScore());
                ss.setExamScore(g.getExamScore());
                ss.setUtsScore(g.getUtsScore());
                ss.setUasScore(g.getUasScore());
                ss.setFinalScore(g.getFinalScore());
                ss.setReportScore(g.getReportScore());
                ss.setAttitudeScore(g.getAttitudeScore());
                ss.setAttitudeLabel(getAttitudeLabel(g.getAttitudeScore()));
                ss.setTeacherName(g.getTeacher() != null ? g.getTeacher().getName() : null);
                
                subjects.add(ss);
                if (g.getReportScore() != null) {
                    sumReportScore += g.getReportScore();
                    count++;
                }
            }
            
            rc.setSubjects(subjects);
            rc.setTotalReportScore(count > 0 ? sumReportScore / count : 0.0);
            reportCards.add(rc);
        }
        
        // Sort by totalReportScore descending for ranking
        reportCards.sort((a, b) -> Double.compare(b.getTotalReportScore(), a.getTotalReportScore()));
        
        // Assign ranks
        for (int i = 0; i < reportCards.size(); i++) {
            reportCards.get(i).setRanking(i + 1);
        }
        
        return reportCards;
    }

    public List<GradeAggregationResponse> getGradeAggregation(UUID classroomId, String academicYear, String semester) {
        List<Object[]> results = studentGradeRepository.getGradeAggregationByClassroom(classroomId, academicYear, semester);
        return results.stream().map(row -> new GradeAggregationResponse(
                (String) row[0],
                (Double) row[1],
                (Double) row[2],
                (Double) row[3]
        )).collect(Collectors.toList());
    }

    private String getAttitudeLabel(Double score) {
        if (score == null) return "-";
        if (score >= 4.0) return "Sangat Baik";
        if (score >= 3.0) return "Baik";
        if (score >= 2.0) return "Cukup";
        return "Kurang";
    }

    private GradeResponse convertToDto(StudentGrade grade) {
        GradeResponse dto = new GradeResponse();
        dto.setId(grade.getId());
        dto.setStudentId(grade.getStudent().getId());
        dto.setStudentName(grade.getStudent().getName());
        dto.setClassroomId(grade.getClassroom().getId());
        dto.setSubject(grade.getSubject());
        dto.setAcademicYear(grade.getAcademicYear());
        dto.setSemester(grade.getSemester());
        dto.setTaskScore(grade.getTaskScore());
        dto.setExamScore(grade.getExamScore());
        dto.setUtsScore(grade.getUtsScore());
        dto.setUasScore(grade.getUasScore());
        dto.setFinalScore(grade.getFinalScore());
        dto.setReportScore(grade.getReportScore());
        dto.setAttitudeScore(grade.getAttitudeScore());
        dto.setAttitudeLabel(getAttitudeLabel(grade.getAttitudeScore()));
        dto.setTeacherName(grade.getTeacher() != null ? grade.getTeacher().getName() : null);
        return dto;
    }
}