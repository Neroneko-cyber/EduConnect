package com.educonnect.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;


@Entity
@Table(name = "classrooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Classroom {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private java.util.UUID id;

    // Tingkat Kelas = 1, 2, 3, 4 dll
    @Column(nullable = false)
    private String gradeClass;
    
    @Column(nullable = false)
    private String name; // e.g. "Kelas X IPA 1"
    
    @Column(name = "academic_year")
    private String academicYear;

    // Relasi ke Wali Kelas
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "homeroom_teacher_id", referencedColumnName = "id")
    private User homeroomTeacher;

    //Relasi ke Siswa
    @OneToMany(mappedBy = "kelas")
    private List<User> students;
    
}