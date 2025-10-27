package com.rms.controller;

import com.rms.config.ApiResponse;
import com.rms.dto.skills.CreateSkillDto;
import com.rms.dto.skills.ProposedSkillDto;
import com.rms.dto.skills.SkillDto;
import com.rms.service.SkillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
@RequiredArgsConstructor
public class SkillController {

    private final SkillService skillService;

    @PostMapping("/propose")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<ProposedSkillDto>> proposeSkill(@Valid @RequestBody CreateSkillDto dto) {
        try {
            ProposedSkillDto proposalDto = skillService.proposeSkill(dto);
            return ResponseEntity.ok(ApiResponse.<ProposedSkillDto>builder()
                    .status(HttpStatus.CREATED.value())
                    .message("Skill proposed successfully")
                    .data(proposalDto)
                    .isError(false)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.<ProposedSkillDto>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message(e.getMessage())
                    .data(null)
                    .isError(true)
                    .build());
        }
    }

    @GetMapping("/proposals/my")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<List<ProposedSkillDto>>> getMyProposals() {
        try {
            List<ProposedSkillDto> proposals = skillService.getMyProposals();
            return ResponseEntity.ok(ApiResponse.<List<ProposedSkillDto>>builder()
                    .status(HttpStatus.OK.value())
                    .message("Your proposals fetched successfully")
                    .data(proposals)
                    .isError(false)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.<List<ProposedSkillDto>>builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message(e.getMessage())
                    .data(null)
                    .isError(true)
                    .build());
        }
    }

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
