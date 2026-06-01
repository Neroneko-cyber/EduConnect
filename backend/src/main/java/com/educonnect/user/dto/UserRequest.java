package com.educonnect.user.dto;

import com.educonnect.entity.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UserRequest {

    @NotBlank(message = "Username tidak boleh kosong")
    private String username;

    @NotBlank(message = "Password tidak boleh kosong")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
            message = "Password harus memiliki minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan simbol")
    private String password;

    @NotBlank(message = "Nama tidak boleh kosong")
    private String name;

    private Role role;
    
    private java.util.UUID classroomId;
}