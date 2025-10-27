// java
package com.rms.service;

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
    private final EmailService emailService;
    private final AuthenticationManager authenticationManager;
    private final AuthUtil authUtil;
    private final CandidateRepository candidateRepository;
    private final RecruiterRepository recruiterRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthResponseDTO login(LoginRequestDTO dto) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Invalid email or password.");
        }

        UserEntity user = (UserEntity) authentication.getPrincipal();

        if (!user.isVerified()) {
            resendOtp(new ResendOtpRequestDTO(user.getEmail()));
            throw new BadCredentialsException("Account is not verified. A new OTP has been sent to your email.");
        }

        boolean isProfileComplete = getProfileStatus(user);

        String token = authUtil.generateAccessToken(user);
        return new AuthResponseDTO(token, user.getId(), user.getName(), user.getEmail(), user.getRoles(), isProfileComplete);
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

//            Company company = companyRepository.findByWebsiteContaining(emailDomain)
//                    .orElseThrow(() -> new IllegalArgumentException(
//                            "Your company is not registered for domain '" + emailDomain + "'. " +
//                                    "Please contact an admin to register your company."
//                    ));

            UserEntity savedUser = userRepo.save(user);

            Recruiter recruiter = Recruiter.builder()
                    .user(savedUser)
                    .company(null)
                    .build();

            recruiterRepository.save(recruiter);

        } else {
            throw new IllegalArgumentException("Invalid role specified. Please choose CANDIDATE or RECRUITER.");
        }

        emailService.sendOtpAsync(user.getEmail(), otp, user.getName());
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

        emailService.sendOtpAsync(user.getEmail(), otp, user.getName());
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
