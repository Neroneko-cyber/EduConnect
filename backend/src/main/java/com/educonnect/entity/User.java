package com.educonnect.entity;

import jakarta.persistence.*;
import lombok.Data;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Data
@Entity
@Table(name = "users")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private java.util.UUID id;

    private String username;
    
    @JsonIgnore
    private String password;
    
    @Column(unique = true, nullable = false)
    private String identityNumber; // NIP/NISN
    
    @Column(unique = true, nullable = false)
    private String email;
    
    private String name;
    
    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipe_guru")
    private TeacherType tipeGuru; // Hanya relevan jika role = GURU

    @Column(name = "special_subject")
    private String specialSubject; // Mapel khusus: "Agama", "Kesenian", "Olahraga" (nullable)

    @Enumerated(EnumType.STRING)
    @Column(name = "student_status")
    private StudentStatus studentStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "classroom_id")
    @JsonBackReference
    private Classroom kelas;
}