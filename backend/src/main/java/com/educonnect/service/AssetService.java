package com.educonnect.service;

import com.educonnect.entity.*;
import com.educonnect.repository.AssetRepository;
import com.educonnect.repository.AssetTicketRepository;
import com.educonnect.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

@Service
@SuppressWarnings("null")
public class AssetService {

    private final AssetRepository assetRepository;
    private final AssetTicketRepository assetTicketRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    public AssetService(AssetRepository assetRepository, AssetTicketRepository assetTicketRepository,
                        UserRepository userRepository, CloudinaryService cloudinaryService) {
        this.assetRepository = assetRepository;
        this.assetTicketRepository = assetTicketRepository;
        this.userRepository = userRepository;
        this.cloudinaryService = cloudinaryService;
    }

    public List<Asset> getAllAssets() {
        return assetRepository.findAll();
    }

    public List<Asset> searchAssets(String keyword) {
        if (keyword == null || keyword.isEmpty()) {
            return assetRepository.findAll();
        }
        return assetRepository.findByNameContainingIgnoreCaseOrCodeContainingIgnoreCase(keyword, keyword);
    }

    @Transactional
    public Asset createAsset(Asset asset) {
        return assetRepository.save(asset);
    }

    public List<AssetTicket> getAllTickets() {
        return assetTicketRepository.findAll();
    }

    public List<AssetTicket> getTicketsByReporter(java.util.UUID reporterId) {
        return assetTicketRepository.findByReporterId(reporterId);
    }

    @Transactional
    public AssetTicket reportBrokenAsset(java.util.UUID assetId, java.util.UUID reporterId, String description, MultipartFile photo) throws IOException {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new RuntimeException("Asset not found"));
        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        asset.setCondition(AssetCondition.BROKEN);
        assetRepository.save(asset);

        AssetTicket ticket = new AssetTicket();
        ticket.setAsset(asset);
        ticket.setReporter(reporter);
        ticket.setDescription(description);
        ticket.setStatus(AssetTicketStatus.REPORTED);

        if (photo != null && !photo.isEmpty()) {
            String photoUrl = cloudinaryService.uploadImage(photo, "educonnect/assets");
            ticket.setPhotoUrl(photoUrl);
        }

        return assetTicketRepository.save(ticket);
    }

    @Transactional
    public AssetTicket forwardToKepsek(java.util.UUID ticketId, BigDecimal estimatedCost) {
        AssetTicket ticket = assetTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        ticket.setEstimatedCost(estimatedCost);
        ticket.setStatus(AssetTicketStatus.FORWARDED);
        return assetTicketRepository.save(ticket);
    }

    @Transactional
    public AssetTicket kepsekRespond(java.util.UUID ticketId, boolean approved, String feedback) {
        AssetTicket ticket = assetTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        ticket.setStatus(approved ? AssetTicketStatus.APPROVED : AssetTicketStatus.POSTPONED);
        ticket.setKepsekFeedback(feedback);
        return assetTicketRepository.save(ticket);
    }

    @Transactional
    public AssetTicket tuRespondToGuru(java.util.UUID ticketId, String feedback) {
        AssetTicket ticket = assetTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        ticket.setTuFeedback(feedback);
        // We consider it resolved from the ticket flow perspective once TU informs Guru
        ticket.setStatus(AssetTicketStatus.RESOLVED);
        return assetTicketRepository.save(ticket);
    }
}