package com.educonnect.grade.dto;

import lombok.Data;

@Data
public class GradeRequest {
    private java.util.UUID id;
    private java.util.UUID studentId;
    private java.util.UUID classroomId;
    private String subject;
    private String academicYear;
    private String semester;
    private Double taskScore;
    private Double examScore;
    private Double utsScore;
    private Double uasScore;
    private Double attitudeScore;
}