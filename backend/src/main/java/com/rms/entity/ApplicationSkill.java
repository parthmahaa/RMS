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
@Table(name = "tbl_application_skills")
public class ApplicationSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne(fetch= FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Applications application;

    @ManyToOne
    @JoinColumn(name = "skill_id")
    private Skill skill;

    private Integer yearsOfExperience;

}
