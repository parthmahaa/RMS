package com.rms.service;

import com.rms.constants.RoleType;
import com.rms.dto.user.UpdateUserDTO;
import com.rms.dto.user.UserDTO;
import com.rms.entity.Admin;
import com.rms.entity.UserEntity;
import com.rms.repository.AdminRepo;
import com.rms.repository.UserRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepo userRepository;
    private final AdminRepo adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> modelMapper.map(user, UserDTO.class))
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteUser(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        userRepository.delete(user);
    }

    @Transactional
    public UserDTO updateUserProfile(Long userId, UpdateUserDTO dto) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (dto.getName() != null && !dto.getName().isBlank()) {
            user.setName(dto.getName());
        }

        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        UserEntity savedUser = userRepository.save(user);
        return modelMapper.map(savedUser, UserDTO.class);
    }

    @Transactional
    public UserDTO updateUserRoles(Long userId, UpdateUserDTO dto) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (dto.getRoles() == null || dto.getRoles().isEmpty()) {
            throw new RuntimeException("Roles cannot be empty");
        }

        user.setRoles(dto.getRoles());

        UserEntity savedUser = userRepository.save(user);
        return modelMapper.map(savedUser, UserDTO.class);
    }
}
