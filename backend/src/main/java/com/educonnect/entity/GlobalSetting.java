package com.educonnect.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "global_settings")
public class GlobalSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private java.util.UUID id;

    @Column(nullable = false)
    private String activeAcademicYear; // e.g. "2026-2027"

    @Column(nullable = false)
    private String activeSemester; // "Ganjil" or "Genap"

    private LocalDate gradeDeadline; // Date after which grades become read-only
}