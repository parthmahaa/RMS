package com.rms.dto.auth;

import com.rms.constants.RoleType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponseDTO {
     String token;
     Long id;
     String email;
     Set<RoleType> roles;
}
