package com.educonnect.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Kode OTP Lupa Password - EduConnect");
            message.setText("Halo,\n\nKode OTP Anda untuk mereset password adalah: " + otp + "\n\nKode ini berlaku selama 5 menit.\nJika Anda tidak merasa meminta reset password, abaikan pesan ini.\n\nSalam,\nTim EduConnect");
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Gagal mengirim email (Pastikan konfigurasi SMTP benar): " + e.getMessage());
        }
    }
}
