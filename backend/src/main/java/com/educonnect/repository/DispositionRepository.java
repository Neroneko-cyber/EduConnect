package com.educonnect.repository;

import com.educonnect.entity.Disposition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DispositionRepository extends JpaRepository<Disposition, java.util.UUID> {
    List<Disposition> findByReceiverId(java.util.UUID receiverId);
    List<Disposition> findBySenderId(java.util.UUID senderId);
    List<Disposition> findByReceiverIdOrderByCreatedAtDesc(java.util.UUID receiverId);
    List<Disposition> findBySenderIdOrderByCreatedAtDesc(java.util.UUID senderId);
}