package com.rms.entity;

import com.rms.constants.SkillType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
@Table(name = "tbl_job_skills_required")
public class JobSkillRequirement {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "job_id")
    private Job job;

    @ManyToOne
    @JoinColumn(name = "skill_id")
    private Skill skill;

    private boolean mandatory;

    private Integer yearsOfExperience;

    @Enumerated(EnumType.STRING)
    private SkillType level;  // basic ,intermediate, advanced

}
