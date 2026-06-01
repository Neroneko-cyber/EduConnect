package com.educonnect.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Random;

@Service
public class OtpService {

    private final StringRedisTemplate redisTemplate;

    public OtpService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public String generateOtp(String email) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        redisTemplate.opsForValue().set("OTP:" + email, otp, Duration.ofMinutes(5));
        
        // Print to console as requested by user as backup
        System.out.println("==================================================");
        System.out.println("OTP untuk " + email + " adalah: " + otp);
        System.out.println("==================================================");
        
        return otp;
    }

    public boolean validateOtp(String email, String otp) {
        String savedOtp = redisTemplate.opsForValue().get("OTP:" + email);
        return savedOtp != null && savedOtp.equals(otp);
    }
    
    public void deleteOtp(String email) {
        redisTemplate.delete("OTP:" + email);
    }
}
