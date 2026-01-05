// java
package com.rms.service;

import com.rms.constants.EmailType;
import com.rms.constants.UserStatus;
import com.rms.dto.EmailDTO;
import com.rms.dto.auth.*;
import com.rms.constants.RoleType;
import com.rms.entity.*;
import com.rms.repository.CandidateRepository;
import com.rms.repository.CompanyRepository;
import com.rms.repository.RecruiterRepository;
import com.rms.repository.UserRepo;
import com.rms.security.AuthUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.management.relation.Role;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepo userRepo;
    private final CompanyRepository companyRepository;
    private final AuthenticationManager authenticationManager;
    private final AuthUtil authUtil;
    private final CandidateRepository candidateRepository;
    private final RecruiterRepository recruiterRepository;
    private final PasswordEncoder passwordEncoder;
    private final RabbitMqProducer rabbitMqProducer;

    public AuthResponseDTO login(LoginRequestDTO dto) {
        UserEntity user = userRepo.findByEmail(dto.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password."));

        if (user.getStatus() == UserStatus.INVITED) {
            generateAndSendOtp(user);

            throw new BadCredentialsException("INVITED_USER");
        }

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Invalid email or password.");
        }

        UserEntity userDetails = (UserEntity) authentication.getPrincipal();
        String jwt = authUtil.generateAccessToken(userDetails);

        return new AuthResponseDTO(jwt,userDetails.getId(),userDetails.getName(),userDetails.getEmail(),userDetails.getRoles(), userDetails.isProfileComplete());
    }

    @Transactional
    public String setPassword(SetPasswordDTO dto) {
        UserEntity user = userRepo.findByEmail(dto.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        if (user.getStatus() != UserStatus.INVITED) {
            throw new IllegalArgumentException("User is already active or invalid status.");
        }

        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setStatus(UserStatus.ACTIVE);
        user.setVerified(true);
        userRepo.save(user);

        return "Password set successfully. You can now login.";
    }

    public String activateAccount(SetPasswordDTO dto) {
        UserEntity user = userRepo.findByEmail(dto.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        if (user.getStatus() != UserStatus.INVITED) {
            throw new IllegalArgumentException("User is already active.");
        }

        if (user.getOtp() == null || !user.getOtp().equals(dto.getOtp())) {
            throw new IllegalArgumentException("Invalid or expired OTP.");
        }

        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setStatus(UserStatus.ACTIVE);
        user.setVerified(true);
        user.setOtp(null);

        userRepo.save(user);

        return "Account activated successfully. You can now login.";
    }

    private void generateAndSendOtp(UserEntity user) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setOtp(otp);
        userRepo.save(user);

        Map<String,String> emailMessage = new HashMap<>();
        emailMessage.put("otp",otp);

        EmailDTO emailDTO = new EmailDTO(user.getEmail(), EmailType.OTP,emailMessage);
        rabbitMqProducer.sendEmail(emailDTO);
    }

    @Transactional
    public String register(SignupRequestDTO dto) {
        if (userRepo.findByEmail(dto.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email is already in use.");
        }

        Set<RoleType> roles = new HashSet<>();
        String requestedRole = dto.getRole().toUpperCase();
        String otp = generateOtp();

        // Create Base user
        UserEntity user = UserEntity.builder()
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .name(dto.getName())
                .createdAt(new Date())
                .isVerified(false)
                .otp(otp)
                .otpGeneratedTime(LocalDateTime.now())
                .build();

        if (RoleType.CANDIDATE.name().equals(requestedRole)) {
            roles.add(RoleType.CANDIDATE);
            user.setRoles(roles);

            UserEntity savedUser = userRepo.save(user);

            Candidate candidate = Candidate.builder()
                    .user(savedUser)
                    .applications(null)
                    .profileCompleted(false)
                    .summary("")
                    .phone(dto.getPhone())
                    .location(null)
                    .userSkills(null)
                    .totalExperience(null)
                    .graduationYear(null)
                    .collegeName(null)
                    .degree(null)
                    .resumeFilePath(null)
                    .currentCompany(null)
                    .build();

            candidateRepository.save(candidate);

        } else if (RoleType.RECRUITER.name().equals(requestedRole)) {
            roles.add(RoleType.RECRUITER);
            user.setRoles(roles);

            String emailDomain;
            try {
                emailDomain = dto.getEmail().split("@")[1];
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid email address format.");
            }
            UserEntity savedUser = userRepo.save(user);

            Recruiter recruiter = Recruiter.builder()
                    .user(savedUser)
                    .company(null)
                    .build();

            recruiterRepository.save(recruiter);

        } else {
            throw new IllegalArgumentException("Invalid role specified. Please choose CANDIDATE or RECRUITER.");
        }
        Map<String,String> emailData = new HashMap<>();
        emailData.put("otp",otp);

        EmailDTO message = new EmailDTO(user.getEmail(),EmailType.OTP,emailData);
        rabbitMqProducer.sendEmail(message);
        return "Registration successful. Please check your email for an OTP to verify your account.";
    }

    @Transactional
    public AuthResponseDTO verifyOtp(VerifyOtpRequestDTO dto) {
        UserEntity user = userRepo.findByEmail(dto.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        if (user.isVerified()) {
            throw new IllegalArgumentException("Account is already verified.");
        }

        if (user.getOtp() == null || !user.getOtp().equals(dto.getOtp())) {
            throw new IllegalArgumentException("Invalid OTP.");
        }

        if (user.getOtpGeneratedTime().isBefore(LocalDateTime.now().minusMinutes(10))) {
            throw new IllegalArgumentException("OTP has expired. Please request a new one.");
        }

        user.setVerified(true);
        user.setOtp(null);
        user.setOtpGeneratedTime(null);

        boolean isProfileComplete = getProfileStatus(user);

        userRepo.save(user);

        String token = authUtil.generateAccessToken(user);
        return new AuthResponseDTO(token, user.getId(), user.getName(), user.getEmail(), user.getRoles(), isProfileComplete);
    }

    @Transactional
    public String resendOtp(ResendOtpRequestDTO dto) {
        UserEntity user = userRepo.findByEmail(dto.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        if (user.isVerified()) {
            throw new IllegalArgumentException("Account is already verified.");
        }

        String otp = generateOtp();
        user.setOtp(otp);
        user.setOtpGeneratedTime(LocalDateTime.now());
        userRepo.save(user);

        Map<String,String> emailData = new HashMap<>();
        emailData.put("otp",otp);

        EmailDTO message = new EmailDTO(user.getEmail(),EmailType.OTP,emailData);
        rabbitMqProducer.sendEmail(message);
        return "A new OTP has been sent to your email.";
    }

    public LoginResponseDTO verifyToken(String token) {
        String username = authUtil.getUsernameFromToken(token);
        if (username == null) throw new IllegalArgumentException("Invalid token");

        UserEntity user = userRepo.findByEmail(username).orElseThrow(() -> new IllegalArgumentException("User not found"));

        return new LoginResponseDTO(token, user.getId(), user.getEmail(), user.getRoles());
    }

    private boolean getProfileStatus(UserEntity user){
        if(user.getRoles().contains(RoleType.CANDIDATE)){
            return candidateRepository.findByUserId(user.getId())
                    .map(Candidate :: isProfileComplete)
                    .orElse(false);
        }else if(user.getRoles().contains(RoleType.RECRUITER)){
            return recruiterRepository.findByUserId(user.getId())
                    .map(Recruiter::isProfileComplete)
                    .orElse(false);
        }

        return true;
    }

    private String generateOtp() {
        return String.valueOf(ThreadLocalRandom.current().nextInt(100000, 1000000));
    }
}
