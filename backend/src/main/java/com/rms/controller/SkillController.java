package com.rms.controller;

import com.rms.config.ApiResponse;
import com.rms.dto.skills.SkillDto;
import com.rms.service.SkillService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
@RequiredArgsConstructor
public class SkillController {

    private final SkillService skillService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SkillDto>>> getAllSkills() {
        try {
            List<SkillDto> skills = skillService.getAllSkills();
            return ResponseEntity.ok(ApiResponse.<List<SkillDto>>builder()
                    .status(HttpStatus.OK.value())
                    .message("Skills fetched successfully")
                    .data(skills)
                    .isError(false)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.<List<SkillDto>>builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message(e.getMessage())
                    .data(null)
                    .isError(true)
                    .build());
        }
    }
}
