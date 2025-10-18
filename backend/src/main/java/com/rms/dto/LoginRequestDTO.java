package com.rms.dto;

import lombok.Data;

@Data
public class LoginRequestDTO {

    private String password;
    private String email;

}
