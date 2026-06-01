package com.educonnect.grade.dto;

import lombok.Data;
import java.util.List;

@Data
public class BulkGradeUpdateRequest {
    private java.util.UUID classroomId;
    private String academicYear;
    private String semester;
    private List<GradeRequest> grades;
}