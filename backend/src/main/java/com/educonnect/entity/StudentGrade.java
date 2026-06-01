package com.educonnect.entity;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@Entity
@Table(name = "student_grades")
public class StudentGrade {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private java.util.UUID id;

    @Column(nullable = false)
    private String academicYear; // e.g., "2026-2027"

    @Column(nullable = false)
    private String semester; // "Ganjil" or "Genap"

    @Column(nullable = false)
    private String subject;

    private Double taskScore;    // Nilai rata-rata Tugas (skala 0-100)
    private Double examScore;    // Nilai rata-rata Ulangan (skala 0-100)
    private Double utsScore;     // Nilai UTS (single input, 0-100)
    private Double uasScore;     // Nilai UAS (single input, 0-100)
    private Double finalScore;   // taskScore + examScore + utsScore + uasScore
    private Double reportScore;  // finalScore / 4 (Nilai Raport per mapel)

    private Double attitudeScore; // Sikap Siswa (skala 1.0 - 5.0)

    // Backward compatibility: dailyScore mapped to taskScore
    @Transient
    public Double getDailyScore() {
        return taskScore;
    }

    @Transient
    public void setDailyScore(Double dailyScore) {
        this.taskScore = dailyScore;
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "kelas"})
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "classroom_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "students", "homeroomTeacher"})
    private Classroom classroom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "kelas"})
    private User teacher; // Guru yang menginput nilai
}