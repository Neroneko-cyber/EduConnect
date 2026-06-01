package com.educonnect.grade.dto;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class ReportCardResponse {
    private UUID studentId;
    private String studentName;
    private List<SubjectScore> subjects;
    private Double totalReportScore;
    private Integer ranking;

    @Data
    public static class SubjectScore {
        private String subject;
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
}
