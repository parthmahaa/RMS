package com.rms.dto.company;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CompanyUpdateDto {
    @NotBlank(message = "Company name is required")
    @Size(max = 255)
    private String name;

    @Size(max = 500)
    private String website;

    @NotBlank(message = "Location is required")
    @Size(max = 255)
    private String location;

    @Size(max = 2000)
    private String description;

    @Size(max = 100)
    private String industry;
}
