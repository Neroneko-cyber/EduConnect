package com.educonnect.receipt.dto;

import lombok.Data;

@Data
public class ReadReceiptRequest {
    private java.util.UUID targetId;
    private String targetType; // "ANNOUNCEMENT" or "DISPOSITION"
}