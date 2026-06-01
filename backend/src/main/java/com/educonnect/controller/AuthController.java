package com.educonnect.controller;

import com.educonnect.config.JwtUtil;
import com.educonnect.entity.User;
import com.educonnect.entity.GuruKelasMapping;
import com.educonnect.repository.UserRepository;
import com.educonnect.repository.GuruKelasMappingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.educonnect.service.OtpService;
import com.educonnect.service.EmailService;

import java.util.Optional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final GuruKelasMappingRepository guruKelasMappingRepository;
    private final OtpService otpService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager, JwtUtil jwtUtil, UserRepository userRepository, GuruKelasMappingRepository guruKelasMappingRepository, OtpService otpService, EmailService emailService, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.guruKelasMappingRepository = guruKelasMappingRepository;
        this.otpService = otpService;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(401).body("User not found");
            }
            User user = userOpt.get();
            String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());

            UUID classroomId = user.getKelas() != null ? user.getKelas().getId() : null;
            List<UUID> classrooms = null;
            
            if (user.getRole() == com.educonnect.entity.Role.GURU && user.getTipeGuru() == com.educonnect.entity.TeacherType.KHUSUS) {
                List<GuruKelasMapping> mappings = guruKelasMappingRepository.findByGuruId(user.getId());
                classrooms = mappings.stream().map(m -> m.getClassroom().getId()).collect(Collectors.toList());
            }

            return ResponseEntity.ok(new AuthResponse(
                token, 
                user.getId(),
                user.getUsername(), 
                user.getRole().name(), 
                user.getName(),
                user.getTipeGuru() != null ? user.getTipeGuru().name() : null,
                classroomId,
                classrooms,
                user.getSpecialSubject()
            ));
        } catch (AuthenticationException e) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmailAndIdentityNumberAndUsername(request.getEmail(), request.getIdentityNumber(), request.getUsername());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Data pengguna tidak ditemukan atau tidak cocok");
        }
        
        String otp = otpService.generateOtp(request.getEmail());
        emailService.sendOtpEmail(request.getEmail(), otp);
        
        return ResponseEntity.ok("OTP telah dikirim ke email Anda");
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest request) {
        boolean isValid = otpService.validateOtp(request.getEmail(), request.getOtp());
        if (!isValid) {
            return ResponseEntity.status(400).body("OTP tidak valid atau sudah kadaluarsa");
        }
        return ResponseEntity.ok("OTP valid");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        boolean isValid = otpService.validateOtp(request.getEmail(), request.getOtp());
        if (!isValid) {
            return ResponseEntity.status(400).body("OTP tidak valid atau sudah kadaluarsa");
        }
        
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User tidak ditemukan");
        }
        
        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        otpService.deleteOtp(request.getEmail());
        
        return ResponseEntity.ok("Password berhasil direset");
    }

    public static class AuthRequest {
        private String username;
        private String password;
        
        // Getters and Setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class AuthResponse {
        private String token;
        private UUID id;
        private String username;
        private String role;
        private String name;
        private String tipeGuru;
        private UUID classroomId;
        private List<UUID> classrooms;
        private String specialSubject;

        public AuthResponse(String token, UUID id, String username, String role, String name, String tipeGuru, UUID classroomId, List<UUID> classrooms, String specialSubject) {
            this.token = token;
            this.id = id;
            this.username = username;
            this.role = role;
            this.name = name;
            this.tipeGuru = tipeGuru;
            this.classroomId = classroomId;
            this.classrooms = classrooms;
            this.specialSubject = specialSubject;
        }
        
        // Getters
        public String getToken() { return token; }
        public UUID getId() { return id; }
        public String getUsername() { return username; }
        public String getRole() { return role; }
        public String getName() { return name; }
        public String getTipeGuru() { return tipeGuru; }
        public UUID getClassroomId() { return classroomId; }
        public List<UUID> getClassrooms() { return classrooms; }
        public String getSpecialSubject() { return specialSubject; }
    }

    public static class ForgotPasswordRequest {
        private String email;
        private String identityNumber;
        private String username;
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getIdentityNumber() { return identityNumber; }
        public void setIdentityNumber(String identityNumber) { this.identityNumber = identityNumber; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
    }

    public static class VerifyOtpRequest {
        private String email;
        private String otp;
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getOtp() { return otp; }
        public void setOtp(String otp) { this.otp = otp; }
    }

    public static class ResetPasswordRequest {
        private String email;
        private String otp;
        private String newPassword;
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getOtp() { return otp; }
        public void setOtp(String otp) { this.otp = otp; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}
