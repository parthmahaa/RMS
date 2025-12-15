package com.rms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "tbl_candidates")
public class Candidate{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY,cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private UserEntity user;

    @OneToMany(mappedBy = "candidate",cascade = CascadeType.ALL,orphanRemoval = true)
    private Set<UserSkills> userSkills = new HashSet<>();

    private boolean profileCompleted = false;

    @Column(length = 2000)
    private String summary;

    private String phone;

    private String location;

    // used when recruiter tries to add employees in bulk
    @Column(name = "associated_company_id")
    private Long associatedCompanyId;

    private Integer totalExperience;
    private Integer graduationYear;
    private String collegeName;
    private String degree;
    private String branch;
    private String resumeFilePath;
    private String currentCompany;

    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Applications> applications = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        this.profileCompleted = isProfileComplete();
    }

    public boolean isProfileComplete() {
        return this.phone != null && !this.phone.isBlank() &&
            this.summary!= null && !this.summary.isBlank() &&
            this.collegeName!= null && !this.collegeName.isBlank() &&
            this.totalExperience!= null &&
            this.resumeFilePath!= null &&
            this.currentCompany!= null;
    }

    public void addSkill(UserSkills userSkill) {
        userSkills.add(userSkill);
        userSkill.setCandidate(this);
    }

    public void removeSkill(UserSkills userSkill) {
        userSkills.remove(userSkill);
        userSkill.setCandidate(null);
    }
}
