package com.educonnect.repository;

import com.educonnect.entity.ReadReceipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReadReceiptRepository extends JpaRepository<ReadReceipt, java.util.UUID> {
    Optional<ReadReceipt> findByUserIdAndTargetIdAndTargetType(java.util.UUID userId, java.util.UUID targetId, String targetType);
    List<ReadReceipt> findByUserId(java.util.UUID userId);

    List<ReadReceipt> findByTargetIdAndTargetType(java.util.UUID targetId, String targetType);
    boolean existsByUserIdAndTargetIdAndTargetType(java.util.UUID userId, java.util.UUID targetId, String targetType);
}