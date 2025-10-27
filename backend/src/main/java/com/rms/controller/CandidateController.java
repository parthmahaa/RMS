package com.rms.controller;

import com.rms.config.ApiResponse;
import com.rms.dto.user.CandidateProfileDto;
import com.rms.dto.user.CandidateProfileUpdateDto;
import com.rms.service.CandidateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/candidate")
@RequiredArgsConstructor
public class CandidateController {
    private final CandidateService candidateService;
}
