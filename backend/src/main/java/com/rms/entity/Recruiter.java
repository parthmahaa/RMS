package com.rms.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Data
@DiscriminatorValue("RECRUITER")
public class Recruiter extends UserEntity{

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @OneToMany(mappedBy = "createdBy" , cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Job> createdJobs;

    @Override
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
