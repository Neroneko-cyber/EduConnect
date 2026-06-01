package com.educonnect.receipt.dto;

import lombok.Data;
import java.util.List;

@Data
public class ReadStatusResponse {
    private java.util.UUID targetId;
    private String targetType;
    private Integer totalTargetUsers;
    private Integer totalRead;
    private Integer totalUnread;
    private List<UserBriefResponse> usersRead;
    private List<UserBriefResponse> usersUnread;

    @Data
    public static class UserBriefResponse {
        private java.util.UUID id;
        private String name;
        private String role;
        private String readAt; // Null if unread
    }
}