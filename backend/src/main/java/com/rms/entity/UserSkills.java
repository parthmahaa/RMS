package com.rms.entity;

import com.rms.entity.users.Candidate;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "tbl_user_skills",uniqueConstraints = {
        @UniqueConstraint(columnNames = {"candidate_id", "skill_id"})
})
public class UserSkills {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    public UserSkills(Candidate candidate, Skill skill) {
        this.candidate = candidate;
        this.skill = skill;
    }
}
