package com.educonnect.controller;

import com.educonnect.entity.User;
import com.educonnect.repository.UserRepository;
import com.educonnect.user.dto.UserRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.educonnect.config.SecurityConfig;
import org.springframework.context.annotation.Import;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc
@Import(SecurityConfig.class)
@SuppressWarnings("null")
class UserControllerTest {

    private final UUID TEST_UUID = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
    private final UUID TEST_UUID2 = UUID.fromString("123e4567-e89b-12d3-a456-426614174001");
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "KEPALA_SEKOLAH")
    void getAllUsers_success() throws Exception {
        User user1 = new User();
        user1.setId(TEST_UUID);
        user1.setUsername("kepsek");

        when(userRepository.findAll()).thenReturn(Arrays.asList(user1));

        mockMvc.perform(get("/api/users")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].username").value("kepsek"));
    }

    @Test
    @WithMockUser(authorities = "ROLE_TU")
    void createUser_success() throws Exception {
        UserRequest userToCreate = new UserRequest();
        userToCreate.setUsername("guru1");
        userToCreate.setName("Guru 1");
        userToCreate.setPassword("P@ssw0rd123");

        User savedUser = new User();
        savedUser.setId(TEST_UUID2);
        savedUser.setUsername("guru1");
        savedUser.setName("Guru 1");

        when(passwordEncoder.encode("P@ssw0rd123")).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        mockMvc.perform(post("/api/users")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(userToCreate)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.id").value(TEST_UUID2.toString()))
                .andExpect(jsonPath("$.data.username").value("guru1"));
    }

    @Test
    @WithMockUser(roles = "SISWA") // Siswa doesn't have permission to get all users according to PreAuthorize
    void getAllUsers_forbidden() throws Exception {
        mockMvc.perform(get("/api/users")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }
}
