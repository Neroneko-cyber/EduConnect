package com.educonnect.repository;

import com.educonnect.entity.User;
import com.educonnect.entity.TeacherType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;
import com.educonnect.entity.Role;

@Repository
public interface UserRepository extends JpaRepository<User, java.util.UUID> {
    Optional<User> findByUsername(String username);
    Optional<User> findByIdentityNumber(String identityNumber);
    Optional<User> findByEmailAndIdentityNumberAndUsername(String email, String identityNumber, String username);
    Optional<User> findByEmail(String email);

    List<User> findByRoleIn(List<Role> roles);
    List<User> findByKelasId(java.util.UUID classId);
    List<User> findByRoleAndTipeGuru(Role role, TeacherType tipeGuru);
    List<User> findByRole(Role role);
    List<User> findByRoleAndStudentStatus(Role role, com.educonnect.entity.StudentStatus status);
}