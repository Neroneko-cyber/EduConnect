package com.educonnect.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@SuppressWarnings("null")
public class SessionManagementService {

    @Autowired
    private StringRedisTemplate redisTemplate;

    /**
     * Daftarkan sesi pengguna baru saat login berhasil.
     * Ini akan menimpa token login sebelumnya (Concurrent Session Limit = 1).
     */
    public void registerSession(String username, String token) {
        redisTemplate.opsForValue().set("session:user:" + username, token, Duration.ofHours(24));
    }

    /**
     * Validasi apakah token yang diberikan adalah sesi aktif saat ini.
     * Dipanggil pada JWT Filter.
     */
    public boolean isSessionValid(String username, String token) {
        String activeToken = redisTemplate.opsForValue().get("session:user:" + username);
        return token != null && token.equals(activeToken);
    }

    /**
     * Hapus sesi saat logout.
     */
    public void invalidateSession(String username) {
        redisTemplate.delete("session:user:" + username);
    }
}