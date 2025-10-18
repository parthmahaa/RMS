package com.rms.dto;
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
    private Integer userId;
    private String name;
    private String email;
    private Set<RoleType> roles;
}
