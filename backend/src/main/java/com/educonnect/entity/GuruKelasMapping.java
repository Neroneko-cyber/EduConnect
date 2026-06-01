package com.educonnect.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@Entity
@Table(name = "guru_kelas_mapping",
       uniqueConstraints = @UniqueConstraint(columnNames = {"guru_id", "classroom_id"}))
@NoArgsConstructor
@AllArgsConstructor
public class GuruKelasMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private java.util.UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guru_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "kelas"})
    private User guru;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "classroom_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "students", "homeroomTeacher"})
    private Classroom classroom;
}
