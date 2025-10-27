package com.rms.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@DiscriminatorValue("CANDIDATE")
public class Candidate extends UserEntity {

    private boolean profileCompleted = false;

    @Column(length = 2000)
    private String summary;

    private String phone;

    private String location;

    private Integer totalExperience;
    private Integer graduationYear;
    private String collegeName;
    private String degree;
    private String resumeFilePath;
    private String currentCompany;

    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Applications> applications = new ArrayList<>();

    @Override
    @Transient
    public boolean isProfileComplete() {
        return this.phone != null && !this.phone.isBlank() &&
            this.summary!= null && !this.summary.isBlank() &&
            this.collegeName!= null && !this.collegeName.isBlank() &&
            this.totalExperience!= null &&
            this.resumeFilePath!= null &&
            this.currentCompany!= null;
    }
}
