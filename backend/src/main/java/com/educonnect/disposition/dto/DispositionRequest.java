package com.educonnect.disposition.dto;

import lombok.Data;
import org.springframework.lang.NonNull;

@Data
public class DispositionRequest {
    @NonNull
    private String title;
    
    @NonNull
    private String description;
    
    @NonNull
    private java.util.UUID senderId;
    
    @NonNull
    private java.util.UUID receiverId;
}