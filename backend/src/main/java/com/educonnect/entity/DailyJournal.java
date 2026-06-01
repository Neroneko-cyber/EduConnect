package com.educonnect.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@Entity
@Table(name = "daily_journals")
public class DailyJournal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private java.util.UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "classroom_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "students", "homeroomTeacher"})
    private Classroom classroom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "kelas"})
    private User teacher;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false, length = 1000)
    private String topic;

    @Column(name = "learning_objective", length = 1000)
    private String learningObjective;

    @Column(columnDefinition = "TEXT")
    private String activities;

    @Column(name = "evaluation_summary", columnDefinition = "TEXT")
    private String evaluationSummary;
}