package com.rms.controller;

import com.rms.config.ApiResponse;
import com.rms.constants.RoleType;
import com.rms.dto.interviews.HrVerificationDto;
import com.rms.dto.interviews.InterviewDocumentsDto;
import com.rms.dto.interviews.InterviewDto;
import com.rms.dto.interviews.InterviewRoundDto;
import com.rms.dto.skills.SkillFeedbackDto;
import com.rms.dto.user.EmployeeDTO;
import com.rms.entity.UserEntity;
import com.rms.service.InterviewService;
import com.rms.service.RecruiterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;
    private final RecruiterService recruiterService;

    @GetMapping("/interviewers-list")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<List<EmployeeDTO>>> getInterviewers(@AuthenticationPrincipal UserEntity user) {
        List<EmployeeDTO> all = recruiterService.getCompanyEmployees(user.getEmail());
        List<EmployeeDTO> interviewers = all.stream()
                .filter(e -> e.getRole() == RoleType.INTERVIEWER)
                .toList();
        return ResponseEntity.ok(ApiResponse.<List<EmployeeDTO>>builder()
                .status(200).message("Interviewers fetched").data(interviewers).build());
    }

    @PostMapping("/rounds/{roundId}/assign")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<String>> assignInterviewers(
            @PathVariable Long roundId,
            @RequestBody List<Long> interviewerIds) {
        interviewService.assignInterviewers(roundId, interviewerIds);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .status(200).message("Interviewers assigned").build());
    }

    @GetMapping("/hr/hired")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<ApiResponse<List<InterviewDto>>> getHiredCandidates(@AuthenticationPrincipal UserEntity user) {
        try {
            List<InterviewDto> data = interviewService.getHiredCandidatesForHR(user.getEmail());
            return ResponseEntity.ok(ApiResponse.<List<InterviewDto>>builder()
                    .status(HttpStatus.OK.value())
                    .message("Hired candidates fetched")
                    .data(data)
                    .isError(false)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.<List<InterviewDto>>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message(e.getMessage())
                    .isError(true)
                    .build());
        }
    }

    // HR: Verify Documents & Set Joining Date
    @PostMapping("/{id}/verify")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<ApiResponse<String>> verifyDocuments(
            @PathVariable Long id,
            @RequestBody HrVerificationDto dto) {
        try {
            interviewService.verifyDocumentsAndSetDate(id, dto);
            return ResponseEntity.ok(ApiResponse.<String>builder()
                    .status(HttpStatus.OK.value())
                    .message("Documents verified and joining date set")
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

    @GetMapping("/assigned")
    @PreAuthorize("hasRole('INTERVIEWER')")
    public ResponseEntity<ApiResponse<List<InterviewDto>>> getAssignedInterviews(@AuthenticationPrincipal UserEntity user) {
        List<InterviewDto> data = interviewService.getAssignedInterviews(user.getEmail());
        return ResponseEntity.ok(ApiResponse.<List<InterviewDto>>builder()
                .status(200).message("Assigned interviews fetched").data(data).build());
    }

    @PostMapping("/rounds/{roundId}/feedback")
    @PreAuthorize("hasRole('INTERVIEWER')")
    public ResponseEntity<ApiResponse<String>> submitFeedback(
            @PathVariable Long roundId,
            @RequestBody List<SkillFeedbackDto> feedbacks,
            @AuthenticationPrincipal UserEntity user) {
        interviewService.submitFeedback(roundId, user.getEmail(), feedbacks);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .status(200).message("Feedback submitted").build());
    }

    @GetMapping("/hr-list")
    public ResponseEntity<ApiResponse<List<EmployeeDTO>>> getHRs(@AuthenticationPrincipal UserEntity user) {
        List<EmployeeDTO> hrs = recruiterService.getCompanyHRs(user.getId());
        return ResponseEntity.ok(ApiResponse.<List<EmployeeDTO>>builder()
                .status(HttpStatus.OK.value())
                .message("HRs fetched successfully")
                .data(hrs)
                .isError(false)
                .build());
    }

    @GetMapping("/company")
    public ResponseEntity<ApiResponse<List<InterviewDto>>> getCompanyInterviews(
            @AuthenticationPrincipal UserEntity user) {
        try {
            List<InterviewDto> data = interviewService.getCompanyInterviews(user.getEmail());
            return ResponseEntity.ok(ApiResponse.<List<InterviewDto>>builder()
                    .status(HttpStatus.OK.value())
                    .message("Interviews fetched successfully")
                    .data(data)
                    .isError(false)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.<List<InterviewDto>>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message(e.getMessage())
                    .isError(true)
                    .build());
        }
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<List<InterviewDto>>> getMyInterviews(
            @AuthenticationPrincipal UserEntity user) {
        try {
            List<InterviewDto> data = interviewService.getMyInterviews(user.getEmail());
            return ResponseEntity.ok(ApiResponse.<List<InterviewDto>>builder()
                    .status(HttpStatus.OK.value())
                    .message("My interviews fetched successfully")
                    .data(data)
                    .isError(false)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.<List<InterviewDto>>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message(e.getMessage())
                    .isError(true)
                    .build());
        }
    }

    @PutMapping("/rounds/{id}")
    public ResponseEntity<ApiResponse<String>> updateRound(
            @PathVariable Long id,
            @RequestBody InterviewRoundDto updates) {
        try {
            interviewService.updateRound(id, updates);
            return ResponseEntity.ok(ApiResponse.<String>builder()
                    .status(HttpStatus.OK.value())
                    .message("Round updated successfully")
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

    @PostMapping("/candidate/{interviewId}/documents")
    public ResponseEntity<ApiResponse<String>> uploadDocuments(
            @PathVariable Long interviewId,
            @RequestBody InterviewDocumentsDto dto
    ) {
        try {
            interviewService.uploadCandidateDocuments(interviewId, dto);

            return ResponseEntity.ok(ApiResponse.<String>builder()
                    .status(HttpStatus.OK.value())
                    .message("Round updated successfully")
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


    @PostMapping("/{id}/complete")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<String>> completeInterview(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        try {
            interviewService.completeInterview(id, payload.get("finalStatus"), payload.get("finalComments"));
            return ResponseEntity.ok(ApiResponse.<String>builder()
                    .status(HttpStatus.OK.value())
                    .message("Interview process completed")
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