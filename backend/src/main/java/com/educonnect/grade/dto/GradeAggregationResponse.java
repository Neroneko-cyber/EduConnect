package com.educonnect.grade.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GradeAggregationResponse {
    private String subject;
    private Double maxScore;
    private Double avgScore;
    private Double minScore;
}
