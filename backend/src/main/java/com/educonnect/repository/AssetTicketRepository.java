package com.educonnect.repository;

import com.educonnect.entity.AssetTicket;
import com.educonnect.entity.AssetTicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetTicketRepository extends JpaRepository<AssetTicket, java.util.UUID> {
    List<AssetTicket> findByReporterId(java.util.UUID reporterId);
    List<AssetTicket> findByStatus(AssetTicketStatus status);
}