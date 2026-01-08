package com.rms.controller;

import com.rms.config.ApiResponse;
import com.rms.dto.user.CandidateProfileDto;
import com.rms.dto.user.CreateCompanyUserDTO;
import com.rms.dto.user.EmployeeDTO;
import com.rms.entity.UserEntity;
import com.rms.service.RecruiterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/recruiter")
@RequiredArgsConstructor
public class RecruiterController {
    private final RecruiterService recruiterService;

    @PostMapping(value = "/bulk-upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<String>> uploadCandidates(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserEntity user) {

        try {
            String message = recruiterService.bulkUploadCandidates(file, user);
            return ResponseEntity.ok(ApiResponse.<String>builder()
                    .status(HttpStatus.OK.value())
                    .message(message)
                    .isError(false)
                    .build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.<String>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message(e.getMessage())
                    .isError(true)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.<String>builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Upload failed: " + e.getMessage())
                    .isError(true)
                    .build());
        }
    }

    @PostMapping("/jobs/{jobId}/auto-match")
    public ResponseEntity<ApiResponse<String>> autoMatch(
            @PathVariable Long jobId,
            @AuthenticationPrincipal UserEntity currentUser) {

        try {
            String result = recruiterService.autoMatchCandidates(jobId, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.<String>builder()
                    .status(200).message(result).isError(false).build());
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ApiResponse.<String>builder()
                    .status(400).message(e.getMessage()).isError(true).build());
        }
    }

    @PostMapping("/candidate")
    @PreAuthorize("hasRole('RECRUITER','ADMIN')")
    public ResponseEntity<ApiResponse<String>> createCandidate(@Valid @RequestBody CandidateProfileDto dto) {
        try {
            recruiterService.createCandidate(dto);
            return ResponseEntity.ok(ApiResponse.<String>builder()
                    .status(HttpStatus.OK.value())
                    .message("User invited successfully.")
                    .isError(false)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.<String>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message(e.getMessage())
                    .isError(true)
                    .build());
        }
    }

    @PostMapping("/add")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<String>> inviteUser(@Valid @RequestBody CreateCompanyUserDTO dto) {
        try {
            recruiterService.createUserByRecruiter(dto);
            return ResponseEntity.ok(ApiResponse.<String>builder()
                    .status(HttpStatus.OK.value())
                    .message("User invited successfully.")
                    .isError(false)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.<String>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message(e.getMessage())
                    .isError(true)
                    .build());
        }
    }

    @DeleteMapping("/recruiter/delete/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        try {
            recruiterService.deleteCompanyUser(id);
            return ResponseEntity.ok(ApiResponse.<Void>builder()
                    .status(HttpStatus.OK.value())
                    .message("User deleted successfully")
                    .data(null)
                    .isError(false)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.<Void>builder()
                    .status(HttpStatus.NOT_FOUND.value())
                    .message(e.getMessage())
                    .data(null)
                    .isError(true)
                    .build());
        }
    }

    @GetMapping("/employees")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<List<EmployeeDTO>>> getCompanyEmployees(
            @AuthenticationPrincipal UserEntity user) {
        try {
            List<EmployeeDTO> employees = recruiterService.getCompanyEmployees(user.getEmail());
            return ResponseEntity.ok(ApiResponse.<List<EmployeeDTO>>builder()
                    .status(HttpStatus.OK.value())
                    .message("Employees fetched successfully")
                    .data(employees)
                    .isError(false)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.<List<EmployeeDTO>>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message(e.getMessage())
                    .isError(true)
                    .build());
        }
    }

    @GetMapping("/reviewers")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<List<EmployeeDTO>>> getCompanyReviewers(
            @AuthenticationPrincipal UserEntity currentUser) {
        try {
            List<EmployeeDTO> reviewers = recruiterService.getCompanyReviewers(currentUser.getId());
            return ResponseEntity.ok(ApiResponse.<List<EmployeeDTO>>builder()
                    .status(HttpStatus.OK.value())
                    .message("Reviewers fetched successfully")
                    .data(reviewers)
                    .isError(false)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.<List<EmployeeDTO>>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message(e.getMessage())
                    .isError(true)
                    .build());
        }
    }

    @PostMapping("/jobs/{jobId}/assign-reviewers")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<String>> assignReviewers(
            @PathVariable Long jobId,
            @RequestBody List<Long> reviewerIds,
            @AuthenticationPrincipal UserEntity currentUser) {
        try {
            String result = recruiterService.assignReviewersToJob(jobId, currentUser.getId(), reviewerIds);
            return ResponseEntity.ok(ApiResponse.<String>builder()
                    .status(HttpStatus.OK.value())
                    .message(result)
                    .isError(false)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.<String>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message(e.getMessage())
                    .isError(true)
                    .build());
        }
    }
}
