package com.rms.service;

import com.rms.constants.EmailType;
import com.rms.dto.EmailDTO;
import com.rms.entity.UserEntity;
import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    private static final Logger logger = LogManager.getLogger(EmailService.class);

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendMail(EmailDTO dto) {
        try {
            Map<String,String> data = dto.getBody();
            String subject = getSubject(dto.getEmailType(),data);
            String body = getBody(dto.getEmailType(), dto.getBody());

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(dto.getTo());
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);

            logger.info("Email sent: {}",dto.getTo());
        } catch (Exception e) {
            logger.error("Failed to process email for {} :{}", dto.getTo(), e.getMessage());
        }
    }

    private String getSubject(EmailType emailType, Map<String, String> data) {
        return switch (emailType) {
            case OTP -> "RMS Verification Code";
            case APPLICATION_STATUS_UPDATE ->
                    "Application Update: " + data.get("jobTitle");

            case JOB_APPLICATION_ACCEPTED ->
                    "Application Accepted: " + data.get("jobTitle");

            case JOB_MATCHED ->
                    "New Job Match: " + data.get("jobTitle");

            case INTERVIEW_SCHEDULED ->
                    "Interview Scheduled: " + data.get("jobTitle");

            case INTERVIEW_MEETING_INVITE ->
                    "Meeting Invitation: " + data.get("roundType") + " - " + data.get("jobTitle");

            case ONLINE_TEST_LINK ->
                    "Online Test Invitation: " + data.get("jobTitle");
            case ADD_CANDIDATE ->
                "Profile Created in RMS";
            case PROFILE_CREATED ->
                "Profile Created";

            case OFFER_LETTER ->
                    "Offer Letter: Welcome to " + data.get("companyName");

            default -> "Notification from RMS";
        };
    }

    private String getBody(EmailType emailType, Map<String, String> data) {
        return switch (emailType) {
            case OTP -> """
                Welcome to RMS!
                
                Your verification code is: %s
                
                This code will expire in 10 minutes.
                """.formatted(data.get("otp"));

            case APPLICATION_STATUS_UPDATE -> """
                
                The status of your application for %s at %s has been updated to: %s
                
                Please login to view more details or remarks.
                """.formatted(
                    data.get("jobTitle").toUpperCase(),
                    data.get("company"),
                    data.get("status").toUpperCase()
            );

            case JOB_APPLICATION_ACCEPTED -> """
                
                Congratulations! Your application for %s has been accepted.
                
                Our team will contact you shortly regarding the next steps.
                """.formatted(data.get("jobTitle").toUpperCase());

            case JOB_MATCHED -> """
                
                We matched you to a %s role.
                
                Login to see your application.
                """.formatted(data.get("jobTitle").toUpperCase());

            case INTERVIEW_SCHEDULED -> """
                
                Your interview for %s has been scheduled.
                
                Below is the meeting link for the interview.
                """.formatted(data.get("jobTitle"));

            case ONLINE_TEST_LINK -> """
                Dear Candidate,
                
                You have been shortlisted for an Online Test for the %s position at %s.
                
                Access the RMS portal o get the test link.
                
                Please complete the test within 24 hours without fail and ensure a proper internet connection.
                Good Luck!
                """.formatted(
                    data.get("jobTitle"),
                    data.get("company")
            );

            case INTERVIEW_MEETING_INVITE -> """
                Hello,
                
                A %s has been scheduled for the %s position at %s.
                
                Date & Time: %s
                Meeting Link: %s
                
                Candidate: %s
                
                Please join using the link above at the scheduled time.
                """.formatted(
                    data.get("roundType"),
                    data.get("jobTitle"),
                    data.get("company"),
                    data.get("time"),
                    data.get("link"),
                    data.get("candidateName")
            );

            // WHEN CREATED BY RECRUITER FOR ROLES
            case PROFILE_CREATED -> """
                    Your profile has been created with %s and you are assigned the %s role.
                    
                    Kindly login with this email to see more details.
                    """.formatted(data.get("company"),data.get("role"));
            case ADD_CANDIDATE -> """
                    Hello %s
                    Your profile has been created by %s at %s.
                    
                    Kindly login to RMS to see more details.
                    """.formatted(data.get("name"),data.get("recruiterName"),data.get("company").toUpperCase());

            case OFFER_LETTER -> """
                    Dear %s,
                    
                    Congratulations! We are pleased to verify your documents and confirm your offer at %s.
                    
                    Your Joining Date is: %s
                    
                    We look forward to having you on board!
                    """.formatted(
                    data.get("candidateName"),
                    data.get("companyName"),
                    data.get("joiningDate")
            );

            default -> "You have a new notification from RMS. Please login to check.";
        };
    }
}
