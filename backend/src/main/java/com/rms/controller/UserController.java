package com.rms.controller;

import com.rms.config.ApiResponse;
import com.rms.constants.RoleType;
import com.rms.dto.company.CompanyDto;
import com.rms.dto.company.CompanyUpdateDto;
import com.rms.dto.user.CandidateProfileDto;
import com.rms.dto.user.CandidateProfileUpdateDto;
import com.rms.dto.user.RecruiterProfileDto;
import com.rms.dto.user.RecruiterProfileUpdateDto;
import com.rms.entity.Recruiter;
import com.rms.entity.UserEntity;
import com.rms.repository.UserRepo;
import com.rms.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final Logger logger = LoggerFactory.getLogger(UserController.class);

    @PutMapping("/company")
    @PreAuthorize("hasAnyRole('RECRUITTER', 'HR')")
    public ResponseEntity<ApiResponse<CompanyDto>> updateCompany(@Valid @RequestBody CompanyUpdateDto dto) {
        try {
            CompanyDto companyDto = userService.updateCompany(dto);
            return ResponseEntity.ok(ApiResponse.<CompanyDto>builder()
                    .status(HttpStatus.OK.value())
                    .message("Company details updated successfully via /company endpoint")
                    .data(companyDto)
                    .isError(false)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.<CompanyDto>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message(e.getMessage())
                    .data(null)
                    .isError(true)
                    .build());
        }
    }

    @GetMapping("/company")
    @PreAuthorize("hasAnyRole('RECRUITTER', 'HR')")
    public ResponseEntity<ApiResponse<CompanyDto>> getMyCompany() {
        try {
            CompanyDto companyDto = userService.getMyCompany();
            return ResponseEntity.ok(ApiResponse.<CompanyDto>builder()
                    .status(HttpStatus.OK.value())
                    .message("Company details fetched successfully via /company endpoint")
                    .data(companyDto)
                    .isError(false)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.<CompanyDto>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message(e.getMessage())
                    .data(null)
                    .isError(true)
                    .build());
        }
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Boolean>> checkMyProfileStatus() {
        try {
            boolean isComplete = userService.checkMyProfileStatus();
            String message = isComplete ? "Profile is complete" : "Profile is incomplete";
            return ResponseEntity.ok(ApiResponse.<Boolean>builder()
                    .status(HttpStatus.OK.value())
                    .message(message)
                    .data(isComplete)
                    .isError(false)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.<Boolean>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message(e.getMessage())
                    .data(false)
                    .isError(true)
                    .build());
        }
    }

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Object>> getMyProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        try {
            Object profileDto = userService.getMyProfile(userEmail);

            String message = "Profile fetched successfully";
            if (profileDto != null) {
                message = "Candidate profile fetched successfully";
            }

            return ResponseEntity.ok(ApiResponse.builder()
                    .status(HttpStatus.OK.value())
                    .message(message)
                    .data(profileDto)
                    .isError(false)
                    .build());

        } catch (IllegalArgumentException e) {
            logger.warn("Error fetching profile for user {}: {}", userEmail, e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.builder()
                    .status(HttpStatus.FORBIDDEN.value())
                    .message(e.getMessage())
                    .isError(true)
                    .build());
        } catch (RuntimeException e) {
            logger.error("Error fetching profile for user {}: {}", userEmail, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Error fetching profile: " + e.getMessage())
                    .isError(true)
                    .build());
        }
    }

    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Object>> updateMyProfile(@Valid @RequestBody Object updateDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        try {
            Object updatedProfile = userService.updateProfile(userEmail,updateDto);
            return ResponseEntity.ok(ApiResponse.builder()
                    .status(HttpStatus.OK.value())
                    .message("Profile updated successfully")
                    .data(updatedProfile)
                    .isError(false)
                    .build());

        } catch (IllegalArgumentException e) {
            logger.warn("Validation error updating profile for user {}: {}", userEmail, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Error updating profile: " + e.getMessage())
                    .isError(true)
                    .build());
        } catch (RuntimeException e) {
            logger.error("Error updating profile for user {}: {}", userEmail, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Error updating profile: " + e.getMessage())
                    .isError(true)
                    .build());
        }
    }
}
