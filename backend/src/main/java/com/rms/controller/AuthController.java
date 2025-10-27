package com.rms.controller;

import com.rms.config.ApiResponse;
import com.rms.dto.auth.*;
import com.rms.repository.UserRepo;
import com.rms.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> registerUser(@Valid @RequestBody SignupRequestDTO dto) {
        try {
            String message = authService.register(dto);
            return ResponseEntity.ok(ApiResponse.<String>builder()
                    .status(HttpStatus.OK.value())
                    .message(message)
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

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> verifyOtp(@Valid @RequestBody VerifyOtpRequestDTO dto) {
        try {
            AuthResponseDTO response = authService.verifyOtp(dto);
            return ResponseEntity.ok(ApiResponse.<AuthResponseDTO>builder()
                    .status(HttpStatus.OK.value())
                    .message("Account verified successfully. You are now logged in.")
                    .data(response)
                    .isError(false)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.<AuthResponseDTO>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message(e.getMessage())
                    .data(null)
                    .isError(true)
                    .build());
        }
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<String>> resendOtp(@Valid @RequestBody ResendOtpRequestDTO dto) {
        try {
            String message = authService.resendOtp(dto);
            return ResponseEntity.ok(ApiResponse.<String>builder()
                    .status(HttpStatus.OK.value())
                    .message(message)
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

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> loginUser(@Valid @RequestBody LoginRequestDTO dto) {
        try {
            AuthResponseDTO response = authService.login(dto);
            return ResponseEntity.ok(ApiResponse.<AuthResponseDTO>builder()
                    .status(HttpStatus.OK.value())
                    .message("Login successful")
                    .data(response)
                    .isError(false)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.<AuthResponseDTO>builder()
                    .status(HttpStatus.UNAUTHORIZED.value())
                    .message(e.getMessage())
                    .data(null)
                    .isError(true)
                    .build());
        }
    }

    @GetMapping("/verify")
    public ResponseEntity<ApiResponse<?>> verifyToken(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestHeader(value = "Authorisation", required = false) String authorisation
    ) {
        String header = authorization != null ? authorization : authorisation;
        if (header == null || !header.startsWith("Bearer ")) {
            ApiResponse<Object> resp = new ApiResponse<>(
                    HttpStatus.UNAUTHORIZED.value(),
                    "Missing or invalid Authorization header",
                    null,
                    true
            );
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(resp);
        }

        String token = header.substring(7);

        try {
            LoginResponseDTO result = authService.verifyToken(token);
            ApiResponse<LoginResponseDTO> response = new ApiResponse<>(
                    HttpStatus.OK.value(),
                    "Token valid",
                    result,
                    false
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<Object> resp = new ApiResponse<>(
                    HttpStatus.UNAUTHORIZED.value(),
                    "Invalid or expired token",
                    null,
                    true
            );
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(resp);
        }
    }
}
