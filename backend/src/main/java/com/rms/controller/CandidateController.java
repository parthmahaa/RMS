package com.rms.controller;

import com.rms.config.ApiResponse;
import com.rms.constants.ApplicationStatus;
import com.rms.dto.jobs.JobApplicationDto;
import com.rms.dto.notifications.NotificationDTO;
import com.rms.dto.user.CandidateProfileDto;
import com.rms.dto.user.CandidateProfileUpdateDto;
import com.rms.entity.Applications;
import com.rms.entity.Candidate;
import com.rms.entity.Notification;
import com.rms.entity.UserEntity;
import com.rms.repository.ApplicationRepository;
import com.rms.repository.CandidateRepository;
import com.rms.repository.NotificationRepository;
import com.rms.service.CandidateService;
import com.rms.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/candidate")
@RequiredArgsConstructor
public class CandidateController {

    private final NotificationService notificationService;
    private final CandidateService candidateService;

    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<List<NotificationDTO>>> getNotifications(
            @AuthenticationPrincipal UserEntity user) {

        try {
            List<NotificationDTO> notifications = notificationService.getUserNotifications(user.getId());
            return ResponseEntity.ok(ApiResponse.<List<NotificationDTO>>builder()
                    .status(HttpStatus.OK.value())
                    .message("Notifications fetched successfully")
                    .data(notifications)
                    .isError(false)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<List<NotificationDTO>>builder()
                            .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                            .message("Failed to fetch notifications")
                            .isError(true)
                            .build());
        }
    }

    @GetMapping("/matched-jobs")
    public ResponseEntity<ApiResponse<List<JobApplicationDto>>> getMatchedJobs(
            @AuthenticationPrincipal UserEntity user) {

        try {
            List<JobApplicationDto> matchedJobs = candidateService.getMatchedJobs(user.getId());
            return ResponseEntity.ok(ApiResponse.<List<JobApplicationDto>>builder()
                    .status(HttpStatus.OK.value())
                    .message("Matched jobs fetched successfully")
                    .data(matchedJobs)
                    .isError(false)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.<List<JobApplicationDto>>builder()
                            .status(HttpStatus.BAD_REQUEST.value())
                            .message(e.getMessage())
                            .isError(true)
                            .build());
        }
    }

    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markNotificationAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .status(HttpStatus.OK.value())
                .message("Marked as read")
                .isError(false)
                .build());
    }
}
