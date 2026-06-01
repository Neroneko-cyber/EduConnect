package com.educonnect.repository;

import com.educonnect.entity.DailyJournal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DailyJournalRepository extends JpaRepository<DailyJournal, java.util.UUID> {
    List<DailyJournal> findByClassroomId(java.util.UUID classroomId);
}