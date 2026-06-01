package com.educonnect.repository;

import com.educonnect.entity.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface ClassroomRepository extends JpaRepository<Classroom, java.util.UUID> {
    Optional<Classroom> findByHomeroomTeacherId(java.util.UUID teacherId);
    List<Classroom> findByGradeClass(String gradeClass);
}