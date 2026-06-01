package com.educonnect.announcement.dto;

import lombok.Data;
import org.springframework.lang.NonNull;

@Data
public class AnnouncementRequest {
    @NonNull
    private String title;
    
    @NonNull
    private String content;
    
    @NonNull
    private java.util.UUID senderId;
}