package com.educonnect.repository;

import com.educonnect.entity.StudentGrade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentGradeRepository extends JpaRepository<StudentGrade, java.util.UUID> {
    List<StudentGrade> findByClassroomIdAndAcademicYearAndSemester(java.util.UUID classroomId, String academicYear, String semester);
    List<StudentGrade> findByStudentIdAndAcademicYearAndSemester(java.util.UUID studentId, String academicYear, String semester);
    List<StudentGrade> findByStudentId(java.util.UUID studentId);

    Optional<StudentGrade> findByStudentIdAndAcademicYearAndSemesterAndSubject(java.util.UUID studentId, String academicYear, String semester, String subject);
    List<StudentGrade> findByClassroomIdAndAcademicYearAndSemesterAndSubject(java.util.UUID classroomId, String academicYear, String semester, String subject);

    @Query("SELECT g.subject, MAX(g.finalScore), AVG(g.finalScore), MIN(g.finalScore) FROM StudentGrade g WHERE g.classroom.id = :classroomId AND g.academicYear = :academicYear AND g.semester = :semester GROUP BY g.subject")
    List<Object[]> getGradeAggregationByClassroom(@Param("classroomId") java.util.UUID classroomId, @Param("academicYear") String academicYear, @Param("semester") String semester);
}