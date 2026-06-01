package com.educonnect.grade.dto;

import lombok.Data;

@Data
public class GradeResponse {
    private java.util.UUID id;
    private java.util.UUID studentId;
    private String studentName;
    private java.util.UUID classroomId;
    private String subject;
    private String academicYear;
    private String semester;
    private Double taskScore;
    private Double examScore;
    private Double utsScore;
    private Double uasScore;
    private Double finalScore;
    private Double reportScore;
    private Double attitudeScore;
    private String attitudeLabel;
    private String teacherName;
}