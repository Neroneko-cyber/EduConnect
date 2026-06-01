package com.educonnect.journal.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class JournalRequest {
    private java.util.UUID classroomId;
    private LocalDate date;
    private String topic;
    private String learningObjective;
    private String activities;
    private String evaluationSummary;
}