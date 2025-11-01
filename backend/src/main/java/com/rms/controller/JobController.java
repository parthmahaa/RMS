package com.rms.controller;

import com.rms.config.ApiResponse;
import com.rms.dto.jobs.CreateJobDto;
import com.rms.dto.jobs.JobCloseDto;
import com.rms.dto.jobs.JobDTO;
import com.rms.dto.jobs.UpdateJobDto;
import com.rms.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    //create a job
    @PostMapping
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<JobDTO>> createJob(@Valid @RequestBody CreateJobDto dto) {
        try {
            JobDTO jobDto = jobService.createJob(dto);
            return ResponseEntity.ok(ApiResponse.<JobDTO>builder()
                    .status(HttpStatus.OK.value())
                    .message("Job created successfully")
                    .data(jobDto)
                    .isError(false)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.<JobDTO>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message(e.getMessage())
                    .data(null)
                    .isError(true)
                    .build());
        }
    }

    // Delete a job
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<String>> deleteJob(@PathVariable Long id) {
        try {
            jobService.deleteJob(id); // Call the new service method
            return ResponseEntity.ok(ApiResponse.<String>builder()
                    .status(HttpStatus.OK.value())
                    .message("Job deleted successfully")
                    .data(null)
                    .isError(false)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.<String>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message(e.getMessage())
                    .data(null)
                    .isError(true)
                    .build());
        }
    }

    //close job
    @PutMapping("/close/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<?>> closeJob(
            @PathVariable Long id,
            @Valid @RequestBody JobCloseDto dto) {

        try {
            JobDTO closedJob = jobService.closeJob(id, dto);
            return ResponseEntity.ok(ApiResponse.<JobDTO>builder()
                    .status(HttpStatus.OK.value())
                    .message("Job closed successfully")
                    .data(closedJob)
                    .isError(false)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.<String>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Failed to close job")
                    .data(null)
                    .isError(true)
                    .build());
        }
    }

    //update job
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<JobDTO>> updateJob(@PathVariable Long id, @Valid @RequestBody UpdateJobDto dto) {
        try {
            JobDTO updateJob = jobService.updateJob(id, dto);
            return ResponseEntity.ok(ApiResponse.<JobDTO>builder()
                    .status(HttpStatus.OK.value())
                    .message("Job updated successfully")
                    .data(updateJob)
                    .isError(false)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.<JobDTO>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message(e.getMessage())
                    .data(null)
                    .isError(true)
                    .build());
        }
    }

    @GetMapping("/open")
    public ResponseEntity<ApiResponse<List<JobDTO>>> getOpenJobs() {
        try {
            List<JobDTO> jobs = jobService.getOpenJobs();
            return ResponseEntity.ok(ApiResponse.<List<JobDTO>>builder()
                    .status(HttpStatus.OK.value())
                    .message("Open jobs fetched successfully")
                    .data(jobs)
                    .isError(false)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.<List<JobDTO>>builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message(e.getMessage())
                    .data(null)
                    .isError(true)
                    .build());
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<List<JobDTO>>> getJobsByCompany() {
        try {
            List<JobDTO> jobs = jobService.getJobsByCompany();
            return ResponseEntity.ok(ApiResponse.<List<JobDTO>>builder()
                    .status(HttpStatus.OK.value())
                    .message("Company jobs fetched successfully")
                    .data(jobs)
                    .isError(false)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.<List<JobDTO>>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message(e.getMessage())
                    .data(null)
                    .isError(true)
                    .build());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobDTO>> getJobById(@PathVariable Long id) {
        try {
            JobDTO job = jobService.getJobById(id);
            return ResponseEntity.ok(ApiResponse.<JobDTO>builder()
                    .status(HttpStatus.OK.value())
                    .message("Job fetched successfully")
                    .data(job)
                    .isError(false)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.<JobDTO>builder()
                    .status(HttpStatus.NOT_FOUND.value())
                    .message(e.getMessage())
                    .data(null)
                    .isError(true)
                    .build());
        }
    }
}
