package com.educonnect.repository;

import com.educonnect.entity.GuruKelasMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GuruKelasMappingRepository extends JpaRepository<GuruKelasMapping, UUID> {
    List<GuruKelasMapping> findByGuruId(UUID guruId);
    List<GuruKelasMapping> findByClassroomId(UUID classroomId);
    boolean existsByGuruIdAndClassroomId(UUID guruId, UUID classroomId);
}
