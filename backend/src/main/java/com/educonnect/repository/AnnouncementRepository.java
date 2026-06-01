package com.educonnect.repository;

import com.educonnect.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, java.util.UUID> {
    List<Announcement> findAllByOrderByCreatedAtDesc();
}