package com.rms.controller;

import com.rms.config.ApiResponse;
import com.rms.dto.LoginRequestDTO;
import com.rms.dto.LoginResponseDTO;
import com.rms.dto.SignupRequestDTO;
import com.rms.dto.SignupResponseDTO;
import com.rms.repository.UserRepo;
import com.rms.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO dto){
        LoginResponseDTO result = authService.login(dto);
        ApiResponse<LoginResponseDTO> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Login successful",
                result,
                false
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequestDTO dto){
        SignupResponseDTO result = (SignupResponseDTO) authService.signup(dto);
        ApiResponse<SignupResponseDTO> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Signup successful",
                result,
                false
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyToken(
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

        String token = header.substring(7); // remove "Bearer "

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
