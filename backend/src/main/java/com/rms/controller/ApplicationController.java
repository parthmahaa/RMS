package com.rms.controller;

import com.rms.config.ApiResponse;
import com.rms.dto.jobs.ApplicationStatusUpdateDto;
import com.rms.dto.jobs.JobApplicationDto;
import com.rms.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/application")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<JobApplicationDto>> applyToJob(@RequestBody JobApplicationDto dto) {
        try {
            JobApplicationDto response = applicationService.applyToJob(dto);
            return ResponseEntity.ok(ApiResponse.<JobApplicationDto>builder()
                    .status(HttpStatus.OK.value())
                    .message("Application submitted successfully")
                    .data(response)
                    .isError(false)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.<JobApplicationDto>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message(e.getMessage())
                    .data(null)
                    .isError(true)
                    .build());
        }
    }

    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<List<JobApplicationDto>>> getApplicationsByJob(@PathVariable Long jobId) {
        try {
            List<JobApplicationDto> apps = applicationService.getApplicationsByJob(jobId);
            return ResponseEntity.ok(ApiResponse.<List<JobApplicationDto>>builder()
                    .status(HttpStatus.OK.value())
                    .message("Job applications fetched successfully")
                    .data(apps)
                    .isError(false)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.<List<JobApplicationDto>>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message(e.getMessage())
                    .data(null)
                    .isError(true)
                    .build());
        }
    }

    @GetMapping("/candidate")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<List<JobApplicationDto>>> getApplicationsByCandidate() {
        try {
            List<JobApplicationDto> apps = applicationService.getMyApplications();
            return ResponseEntity.ok(ApiResponse.<List<JobApplicationDto>>builder()
                    .status(HttpStatus.OK.value())
                    .message("Candidate applications fetched successfully")
                    .data(apps)
                    .isError(false)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.<List<JobApplicationDto>>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message(e.getMessage())
                    .data(null)
                    .isError(true)
                    .build());
        }
    }

    @PutMapping("/{applicationId}/status")
    @PreAuthorize("hasRole('RECRUITTER')")
    public ResponseEntity<ApiResponse<JobApplicationDto>> updateApplicationStatus(
            @PathVariable Long applicationId,
            @Valid @RequestBody ApplicationStatusUpdateDto dto) {
        try {
            JobApplicationDto appDto = applicationService.updateApplicationStatus(applicationId, dto);
            return ResponseEntity.ok(ApiResponse.<JobApplicationDto>builder()
                    .status(HttpStatus.OK.value())
                    .message("Application status updated successfully")
                    .data(appDto)
                    .isError(false)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.<JobApplicationDto>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message(e.getMessage())
                    .data(null)
                    .isError(true)
                    .build());
        }
    }

}
