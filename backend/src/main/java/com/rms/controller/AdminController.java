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
