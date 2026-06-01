package com.educonnect.service;

import com.educonnect.entity.ReadReceipt;
import com.educonnect.entity.Role;
import com.educonnect.entity.User;
import com.educonnect.receipt.dto.ReadStatusResponse;
import com.educonnect.repository.ReadReceiptRepository;
import com.educonnect.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReadReceiptService {

    private final ReadReceiptRepository readReceiptRepository;
    private final UserRepository userRepository;

    public ReadReceiptService(ReadReceiptRepository readReceiptRepository, UserRepository userRepository) {
        this.readReceiptRepository = readReceiptRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    @SuppressWarnings("null")
    public void markAsRead(java.util.UUID userId, java.util.UUID targetId, String targetType) {
        boolean exists = readReceiptRepository.existsByUserIdAndTargetIdAndTargetType(userId, targetId, targetType);
        if (!exists) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User tidak ditemukan"));

            ReadReceipt receipt = new ReadReceipt();
            receipt.setUser(user);
            receipt.setTargetId(targetId);
            receipt.setTargetType(targetType);
            readReceiptRepository.save(receipt);
        }
    }

    public ReadStatusResponse getAnnouncementReadStatus(java.util.UUID announcementId) {
        // Hanya untuk GURU dan TU sesuai request (Target Pembaca)
        List<User> targetUsers = userRepository.findByRoleIn(Arrays.asList(Role.GURU, Role.TU));
        List<ReadReceipt> receipts = readReceiptRepository.findByTargetIdAndTargetType(announcementId, "ANNOUNCEMENT");

        Map<java.util.UUID, ReadReceipt> receiptMap = receipts.stream()
                .collect(Collectors.toMap(r -> r.getUser().getId(), r -> r));

        List<ReadStatusResponse.UserBriefResponse> usersRead = new ArrayList<>();
        List<ReadStatusResponse.UserBriefResponse> usersUnread = new ArrayList<>();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

        for (User u : targetUsers) {
            ReadStatusResponse.UserBriefResponse brief = new ReadStatusResponse.UserBriefResponse();
            brief.setId(u.getId());
            brief.setName(u.getName());
            brief.setRole(u.getRole().name());

            if (receiptMap.containsKey(u.getId())) {
                ReadReceipt receipt = receiptMap.get(u.getId());
                brief.setReadAt(receipt.getReadAt() != null ? receipt.getReadAt().format(formatter) : "Read");
                usersRead.add(brief);
            } else {
                brief.setReadAt(null);
                usersUnread.add(brief);
            }
        }

        ReadStatusResponse res = new ReadStatusResponse();
        res.setTargetId(announcementId);
        res.setTargetType("ANNOUNCEMENT");
        res.setTotalTargetUsers(targetUsers.size());
        res.setTotalRead(usersRead.size());
        res.setTotalUnread(usersUnread.size());
        res.setUsersRead(usersRead);
        res.setUsersUnread(usersUnread);

        return res;
    }
    
    public boolean getDispositionReadStatus(java.util.UUID dispositionId, java.util.UUID receiverId) {
        return readReceiptRepository.existsByUserIdAndTargetIdAndTargetType(receiverId, dispositionId, "DISPOSITION");
    }
}