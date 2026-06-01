package com.educonnect.config;

import com.educonnect.entity.*;
import com.educonnect.repository.ClassroomRepository;
import com.educonnect.repository.GuruKelasMappingRepository;
import com.educonnect.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseSeeder.class);

    private final UserRepository userRepository;
    private final ClassroomRepository classroomRepository;
    private final GuruKelasMappingRepository guruKelasMappingRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(UserRepository userRepository,
                          ClassroomRepository classroomRepository,
                          GuruKelasMappingRepository guruKelasMappingRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.classroomRepository = classroomRepository;
        this.guruKelasMappingRepository = guruKelasMappingRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            logger.info("Database is already seeded. Skipping Data Seeder...");
            return;
        }

        logger.info("Starting Database Seeder...");

        // 1. Create Kepala Sekolah
        User kepsek = new User();
        kepsek.setUsername("kepsek");
        kepsek.setPassword(passwordEncoder.encode("kepsek"));
        kepsek.setIdentityNumber("NIP-100");
        kepsek.setEmail("kepsek@educonnect.com");
        kepsek.setName("Budi Santoso, S.Pd");
        kepsek.setRole(Role.KEPALA_SEKOLAH);
        kepsek.setCreatedAt(LocalDateTime.now());
        userRepository.save(kepsek);

        // 2. Create TU
        User tu = new User();
        tu.setUsername("tu");
        tu.setPassword(passwordEncoder.encode("tu"));
        tu.setIdentityNumber("NIP-200");
        tu.setEmail("tu@educonnect.com");
        tu.setName("Siti Aminah");
        tu.setRole(Role.TU);
        tu.setCreatedAt(LocalDateTime.now());
        userRepository.save(tu);

        // 3. Create Classrooms & Guru Kelas
        List<Classroom> classrooms = new ArrayList<>();
        for (int i = 1; i <= 6; i++) {
            // Create Guru Kelas
            String username = "gurukelas" + i;
            User guruKelas = new User();
            guruKelas.setUsername(username);
            guruKelas.setPassword(passwordEncoder.encode(username));
            guruKelas.setIdentityNumber("NIP-30" + i);
            guruKelas.setEmail(username + "@educonnect.com");
            guruKelas.setName("Guru Kelas " + i);
            guruKelas.setRole(Role.GURU);
            guruKelas.setTipeGuru(TeacherType.KELAS);
            guruKelas.setCreatedAt(LocalDateTime.now());
            User savedGuruKelas = userRepository.save(guruKelas);

            // Create Classroom
            Classroom classroom = new Classroom();
            classroom.setGradeClass(String.valueOf(i));
            classroom.setName("Kelas " + i + "A");
            classroom.setAcademicYear("2026-2027");
            classroom.setHomeroomTeacher(savedGuruKelas);
            Classroom savedClassroom = classroomRepository.save(classroom);
            classrooms.add(savedClassroom);

            // Update user to link back to classroom
            savedGuruKelas.setKelas(savedClassroom);
            userRepository.save(savedGuruKelas);
        }

        // 4. Create Guru Khusus
        String[] mapelKhusus = {"Agama", "Kesenian", "Olahraga"};
        int nipCounter = 401;
        for (String mapel : mapelKhusus) {
            String username = "guru" + mapel.toLowerCase();
            User guruKhusus = new User();
            guruKhusus.setUsername(username);
            guruKhusus.setPassword(passwordEncoder.encode(username));
            guruKhusus.setIdentityNumber("NIP-" + nipCounter++);
            guruKhusus.setEmail(username + "@educonnect.com");
            guruKhusus.setName("Guru " + mapel);
            guruKhusus.setRole(Role.GURU);
            guruKhusus.setTipeGuru(TeacherType.KHUSUS);
            guruKhusus.setSpecialSubject(mapel);
            guruKhusus.setCreatedAt(LocalDateTime.now());
            User savedGuruKhusus = userRepository.save(guruKhusus);

            // Map Guru Khusus to all Classrooms
            for (Classroom classroom : classrooms) {
                GuruKelasMapping mapping = new GuruKelasMapping();
                mapping.setGuru(savedGuruKhusus);
                mapping.setClassroom(classroom);
                guruKelasMappingRepository.save(mapping);
            }
        }

        logger.info("Database Seeder successfully executed.");
    }
}
