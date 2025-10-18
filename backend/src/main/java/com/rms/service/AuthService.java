// java
package com.rms.service;

import com.rms.dto.LoginRequestDTO;
import com.rms.dto.LoginResponseDTO;
import com.rms.dto.SignupRequestDTO;
import com.rms.dto.SignupResponseDTO;
import com.rms.constants.RoleType;
import com.rms.entity.UserEntity;
import com.rms.repository.UserRepo;
import com.rms.security.AuthUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepo userRepo;
    private final AuthenticationManager authenticationManager;
    private final AuthUtil authUtil;
    private final PasswordEncoder passwordEncoder;

    public LoginResponseDTO login(LoginRequestDTO dto) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword())
        );

        UserEntity user = (UserEntity) authentication.getPrincipal();

        String token = authUtil.generateAccessToken(user);

        return new LoginResponseDTO(token, user.getId(), user.getEmail(), user.getRoles());
    }

    public Object signup(SignupRequestDTO dto) {
        UserEntity hasUser = userRepo.findByEmail(dto.getEmail()).orElse(null);

        if (hasUser != null) throw new IllegalArgumentException("Username already taken");

        Set<RoleType> roles = new HashSet<>();

        // parse roles if provided
        if (dto.getRoles() != null && !dto.getRoles().trim().isEmpty()) {
            roles = Arrays.stream(dto.getRoles().split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(s -> {
                        try {
                            return RoleType.valueOf(s.toUpperCase());
                        } catch (IllegalArgumentException e) {
                            return null;
                        }
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());
        }

        // default to CANDIDATE if no valid roles were provided
        if (roles.isEmpty()) {
            roles.add(RoleType.CANDIDATE);
        }

        UserEntity user = userRepo.save(UserEntity.builder()
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .name(dto.getName())
                .roles(roles)
                .createdAt(new Date())
                .build()
        );

        String token = authUtil.generateAccessToken(user);

        return new SignupResponseDTO(token, user.getId(), user.getName(), user.getEmail(), user.getRoles());
    }

    public LoginResponseDTO verifyToken(String token) {
        String username = authUtil.getUsernameFromToken(token);
        if (username == null) throw new IllegalArgumentException("Invalid token");

        UserEntity user = userRepo.findByEmail(username).orElseThrow(() -> new IllegalArgumentException("User not found"));

        return new LoginResponseDTO(token, user.getId(), user.getEmail(), user.getRoles());
    }
}
