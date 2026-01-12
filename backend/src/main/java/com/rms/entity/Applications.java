package com.rms.entity;

import com.rms.constants.ApplicationStatus;
import com.rms.entity.users.Candidate;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
@Table(name = "tbl_job_applications")
public class Applications {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    private String resumeFilePath;

    @Column(length = 5000)
    private String coverLetter;

    @ManyToOne
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    private Long candidateExperience;

    private LocalDateTime appliedAt;

    @Enumerated(EnumType.STRING)
    private ApplicationStatus status;

    private LocalDate joiningDate;
    private Boolean documentsVerified;

    @Column(length = 1000)
    private String recruiterComment;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ApplicationSkill> applicationSkills = new ArrayList<>();

    public void addApplicationSkill(ApplicationSkill skill) {
        applicationSkills.add(skill);
        skill.setApplication(this);
    }
}
