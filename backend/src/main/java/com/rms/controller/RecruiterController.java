package com.rms.controller;

import com.rms.config.ApiResponse;
import com.rms.entity.UserEntity;
import com.rms.service.RecruiterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
}
