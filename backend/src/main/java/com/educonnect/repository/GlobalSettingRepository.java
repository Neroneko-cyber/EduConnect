package com.educonnect.repository;

import com.educonnect.entity.GlobalSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GlobalSettingRepository extends JpaRepository<GlobalSetting, java.util.UUID> {
    // Assuming there is usually only one global setting record
    Optional<GlobalSetting> findTopByOrderByIdDesc();
}