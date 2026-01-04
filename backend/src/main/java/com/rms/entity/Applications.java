package com.rms.entity;

import com.rms.constants.ApplicationStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "tbl_application_skills",
            joinColumns = @JoinColumn(name = "application_id"),
            inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    private List<Skill> candidateSkills = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    private ApplicationStatus status;

    @Column(length = 1000)
    private String recruiterComment;
}
