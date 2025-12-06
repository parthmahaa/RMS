package com.rms.controller;

import com.rms.config.ApiResponse;
import com.rms.dto.skills.ProposedSkillDto;
import com.rms.dto.skills.ProposedSkillUpdateDto;
import com.rms.dto.skills.SkillDto;
import com.rms.dto.user.UpdateUserDTO;
import com.rms.dto.user.UserDTO;
import com.rms.service.AdminService;
import com.rms.service.SkillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final SkillService skillService;

        @PostMapping("/proposals/approve/{proposalId}")
    public ResponseEntity<ApiResponse<ProposedSkillDto>> approveProposal(@PathVariable Long proposalId) {
        try {
            ProposedSkillDto dto = skillService.approveProposal(proposalId);
            return ResponseEntity.ok(ApiResponse.<ProposedSkillDto>builder()
                    .status(HttpStatus.OK.value())
                    .message("Proposal approved successfully")
                    .data(dto)
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

    @PostMapping("/proposals/reject/{proposalId}")
    public ResponseEntity<ApiResponse<ProposedSkillDto>> rejectProposal(@PathVariable Long proposalId, @Valid @RequestBody ProposedSkillUpdateDto dto) {
        try {
            ProposedSkillDto updatedDto = skillService.rejectProposal(proposalId, dto);
            return ResponseEntity.ok(ApiResponse.<ProposedSkillDto>builder()
                    .status(HttpStatus.OK.value())
                    .message("Proposal rejected successfully")
                    .data(updatedDto)
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

    @PostMapping
    public ResponseEntity<ApiResponse<SkillDto>> createSkill(@Valid @RequestBody SkillDto dto) {
        try {
            SkillDto skillDto = skillService.createSkill(dto);
            return ResponseEntity.ok(ApiResponse.<SkillDto>builder()
                    .status(HttpStatus.CREATED.value())
                    .message("Skill created successfully")
                    .data(skillDto)
                    .isError(false)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.<SkillDto>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message(e.getMessage())
                    .data(null)
                    .isError(true)
                    .build());
        }
    }

    @GetMapping("/proposals/pending")
    public ResponseEntity<ApiResponse<List<ProposedSkillDto>>> getPendingProposals() {
        try {
            List<ProposedSkillDto> proposals = skillService.getPendingProposals();
            return ResponseEntity.ok(ApiResponse.<List<ProposedSkillDto>>builder()
                    .status(HttpStatus.OK.value())
                    .message("Pending proposals fetched successfully")
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

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers() {
        try {
            List<UserDTO> users = adminService.getAllUsers();
            return ResponseEntity.ok(ApiResponse.<List<UserDTO>>builder()
                    .status(HttpStatus.OK.value())
                    .message("All users fetched successfully")
                    .data(users)
                    .isError(false)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.<List<UserDTO>>builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message(e.getMessage())
                    .data(null)
                    .isError(true)
                    .build());
        }
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<UserDTO>> updateUserProfile(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserDTO dto) {
        try {
            UserDTO updatedUser = adminService.updateUserProfile(userId, dto);
            return ResponseEntity.ok(ApiResponse.<UserDTO>builder()
                    .status(HttpStatus.OK.value())
                    .message("User profile updated successfully")
                    .data(updatedUser)
                    .isError(false)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.<UserDTO>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message(e.getMessage())
                    .data(null)
                    .isError(true)
                    .build());
        }
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long userId) {
        try {
            adminService.deleteUser(userId);
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

    @PutMapping("/users/{userId}/roles")
    public ResponseEntity<ApiResponse<UserDTO>> updateUserRoles(
            @PathVariable Long userId,
            @RequestBody UpdateUserDTO dto) {
        try {
            UserDTO updatedUser = adminService.updateUserRoles(userId, dto);
            return ResponseEntity.ok(ApiResponse.<UserDTO>builder()
                    .status(HttpStatus.OK.value())
                    .message("User roles updated successfully")
                    .data(updatedUser)
                    .isError(false)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.<UserDTO>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message(e.getMessage())
                    .data(null)
                    .isError(true)
                    .build());
        }
    }
}
