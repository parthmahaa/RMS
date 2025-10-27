package com.rms.service;

import com.rms.entity.UserEntity;
import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    private static final Logger logger = LogManager.getLogger(EmailService.class);

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void sendOtpAsync(String toEmail, String otp, String name) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setFrom(fromEmail);
            message.setSubject("Your Verification Code for RMS");
            message.setText(
                    "Dear " + name + ",\n\n" +
                            "Please use the following OTP to complete your registration:\n\n" +
                            "OTP: " + otp + "\n\n" +
                            "This OTP is valid for 10 minutes.\n\n" +
                            "Best regards,\n" +
                            "The RMS Team"
            );
            mailSender.send(message);
            logger.info("Registration OTP email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send registration OTP email to {}: {}", toEmail, e.getMessage(), e);
        }
    }
}
