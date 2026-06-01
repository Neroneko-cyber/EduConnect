package com.educonnect.disposition.dto;

import com.educonnect.entity.DispositionStatus;
import lombok.Data;
import org.springframework.lang.NonNull;

@Data
public class DispositionStatusUpdateRequest {
    @NonNull
    private DispositionStatus status;
}