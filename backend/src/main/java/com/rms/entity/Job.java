package com.rms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "tbl_jobs")
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String position;

    @Column(length = 5000)
    private String description;

    private String location;
    private String type;   //Full time, intern, part time, contract
    private String status;   // open, hold, closed
    private LocalDateTime postedAt;

    // Close-specific fields
    private String closeComment;
    private String closeReason;
    @ElementCollection
    @CollectionTable(name = "tbl_job_selected_candidates", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "candidate_id")
    private List<Long> selectedCandidateIds = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private Recruiter createdBy;

    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<JobSkillRequirement> skillRequirements = new ArrayList<>();

    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Applications> applications = new ArrayList<>();
}
