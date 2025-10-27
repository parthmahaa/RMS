package com.rms.dto.auth;
import com.rms.constants.RoleType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SignupResponseDTO {

    private String token;
    private Long userId;
    private String name;
    private String email;
    private Set<RoleType> roles;
}
