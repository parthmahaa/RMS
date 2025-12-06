package com.rms.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "tbl_recruiters")
public class Recruiter{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = true)
    private Company company;

    @OneToMany(mappedBy = "createdBy" , cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Job> createdJobs;

    @Transient
    public boolean isProfileComplete() {
        if (this.getCompany() == null) {
            return false;
        }

        Company c = this.getCompany();
        return c.getName() != null && !c.getName().isBlank() &&
                c.getIndustry() != null && !c.getIndustry().isBlank() &&
                c.getLocation() != null && !c.getLocation().isBlank() &&
                c.getWebsite() !=null && !c.getWebsite().isBlank();
    }
}
