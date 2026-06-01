package com.educonnect.journal.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class JournalResponse {
    private java.util.UUID id;
    private java.util.UUID classroomId;
    private String classroomName;
    private java.util.UUID teacherId;
    private String teacherName;
    private LocalDate date;
    private String topic;
    private String learningObjective;
    private String activities;
    private String evaluationSummary;
}