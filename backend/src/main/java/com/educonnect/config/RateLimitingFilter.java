package com.educonnect.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;

@Component
@SuppressWarnings("null")
public class RateLimitingFilter extends OncePerRequestFilter {

    @Autowired(required = false)
    private StringRedisTemplate redisTemplate;

    private static final int MAX_REQUESTS_PER_MINUTE = 5;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (redisTemplate != null && request.getRequestURI().equals("/api/auth/login") && request.getMethod().equalsIgnoreCase("POST")) {
            try {
                String clientIp = request.getRemoteAddr();
                String key = "rate_limit:login:" + clientIp;

                Long requests = redisTemplate.opsForValue().increment(key);
                if (requests != null && requests == 1) {
                    redisTemplate.expire(key, Duration.ofMinutes(1));
                }

                if (requests != null && requests > MAX_REQUESTS_PER_MINUTE) {
                    response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                    response.setContentType("application/json");
                    response.setCharacterEncoding("UTF-8");
                    response.getWriter().write("{\"status\": 429, \"error\": \"Too Many Requests\", \"message\": \"Terlalu banyak percobaan login. Silakan coba lagi dalam 1 menit.\"}");
                    return;
                }
            } catch (Exception e) {
                // Log the exception or ignore to allow login even if Redis is down
                System.err.println("Redis rate limiting failed: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}