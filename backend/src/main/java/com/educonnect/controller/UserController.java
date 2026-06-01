package com.educonnect.controller;

import com.educonnect.entity.User;
import com.educonnect.repository.UserRepository;
import com.educonnect.user.dto.UserRequest;
import com.educonnect.common.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*") // Izinkan akses dari origin mana saja
public class UserController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    @PreAuthorize("hasRole('KEPALA_SEKOLAH') or hasRole('WAKASEK') or hasRole('GURU') or hasRole('TU')")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK, "Data berhasil diambil", users));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_TU')")
    public ResponseEntity<ApiResponse<User>> createUser(@RequestBody @Valid UserRequest userRequest) {
        User user = new User();
        user.setUsername(userRequest.getUsername());
        user.setName(userRequest.getName());
        user.setRole(userRequest.getRole());
        if (userRequest.getRole() == com.educonnect.entity.Role.SISWA) {
            user.setStudentStatus(com.educonnect.entity.StudentStatus.UNASSIGNED);
        }
        // Encode password sebelum disimpan
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));

        User savedUser = userRepository.save(user);

        // Kembalikan status 201 Created dengan ApiResponse
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(HttpStatus.CREATED, "Data berhasil disimpan", savedUser));
    }

    @GetMapping("/class/{classroomId}")
    @PreAuthorize("hasRole('GURU') or hasRole('TU') or hasRole('KEPALA_SEKOLAH')")
    public ResponseEntity<ApiResponse<List<User>>> getUsersByClassroom(@PathVariable java.util.UUID classroomId) {
        List<User> users = userRepository.findByKelasId(classroomId).stream()
                .filter(u -> u.getRole() == com.educonnect.entity.Role.SISWA)
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK, "Data siswa berhasil diambil", users));
    }

    @GetMapping("/students/unassigned")
    @PreAuthorize("hasAuthority('ROLE_TU')")
    public ResponseEntity<ApiResponse<List<User>>> getUnassignedStudents() {
        List<User> users = userRepository.findByRoleAndStudentStatus(
            com.educonnect.entity.Role.SISWA, 
            com.educonnect.entity.StudentStatus.UNASSIGNED
        );
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK, "Data siswa belum punya kelas berhasil diambil", users));
    }
}