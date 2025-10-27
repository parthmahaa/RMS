package com.rms.service;

import com.rms.Application;
import com.rms.constants.JobStatus;
import com.rms.constants.JobType;
import com.rms.constants.RoleType;
import com.rms.constants.SkillType;
import com.rms.dto.jobs.CreateJobDto;
import com.rms.dto.jobs.JobApplicationDto;
import com.rms.dto.jobs.JobDTO;
import com.rms.dto.jobs.UpdateJobDto;
import com.rms.entity.*;
import com.rms.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobService {
    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final SkillRepository skillRepository;
    private final JobSkillReqRepository jobSkillRequirementRepository;
    private final UserRepo userRepository;
    private final ModelMapper modelMapper;
    private final UserService userService;
    private final RecruiterRepository recruiterRepository;

    @Transactional
    public JobDTO createJob(CreateJobDto dto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!user.getRoles().contains(RoleType.RECRUITER)) {
            throw new RuntimeException("Only recruiters can create jobs");
        }

        userService.validateCompanyInfo(user);

        Company company = companyRepository.findById(dto.getCompanyId())
                .orElseThrow(() -> new RuntimeException("Company not found"));

        Recruiter recruiter = recruiterRepository.findByUserId(user.getId())
                .orElseThrow(()-> new IllegalStateException("Recruiter not found"));
        //validate if skills exists
        if (dto.getSkillRequirementIds() != null) {
            for (Long skillId : dto.getSkillRequirementIds()) {
                if (!skillRepository.existsById(skillId)) {
                    throw new RuntimeException("Skill not found: " + skillId);
                }
            }
        }

        Job job = modelMapper.map(dto, Job.class);
        job.setType(JobType.valueOf(dto.getType().toUpperCase()).toString());
        job.setStatus(JobStatus.OPEN.toString());
        job.setPostedAt(LocalDateTime.now());
        job.setCompany(company);
        job.setCreatedBy(recruiter);
        job.setApplications(new ArrayList<>());
        job.setSkillRequirements(new ArrayList<>());

        if (dto.getSkillRequirementIds() != null) {
            Job finalJob = job;
            dto.getSkillRequirementIds().forEach(skillId -> {
                Skill skill = skillRepository.findById(skillId).orElseThrow(() -> new RuntimeException("Skill not found"));
                JobSkillRequirement req = JobSkillRequirement.builder()
                        .skill(skill)
                        .job(finalJob)
                        .mandatory(true)
                        .level(SkillType.INTERMEDIATE)
                        .build();
                finalJob.getSkillRequirements().add(req);
            });
        }

        job = jobRepository.save(job);
        return mapToDto(job);
    }

    @Transactional
    public JobDTO updateJob(Long id, UpdateJobDto dto) {
        Job job = jobRepository.findById(id).orElseThrow(() -> new RuntimeException("Job not found"));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!user.getRoles().contains(RoleType.RECRUITER)) {
            throw new RuntimeException("Only recruiters can update jobs");
        }

        userService.validateCompanyInfo(user);

        modelMapper.map(dto, job);

        if (dto.getStatus() != null) {
            JobStatus newStatus = JobStatus.valueOf(dto.getStatus().toUpperCase());
            if (newStatus == JobStatus.CLOSED) {
                validateJobClosure(dto);
            }
            job.setStatus(newStatus.toString());
        }
        if (dto.getType() != null) {
            job.setType(JobType.valueOf(dto.getType().toUpperCase()).toString());
        }

        if (dto.getSkillRequirementIds() != null) {
            job.getSkillRequirements().clear();
            Job finalJob = job;
            dto.getSkillRequirementIds().forEach(skillId -> {
                Skill skill = skillRepository.findById(skillId).orElseThrow(() -> new RuntimeException("Skill not found"));
                JobSkillRequirement req = JobSkillRequirement.builder()
                        .skill(skill)
                        .job(finalJob)
                        .mandatory(true)
                        .level(SkillType.INTERMEDIATE)
                        .build();
                finalJob.getSkillRequirements().add(req);
            });
        }

        job = jobRepository.save(job);
        return mapToDto(job);
    }

    public List<JobDTO> getOpenJobs() {
        return jobRepository.findAllOpenJobs().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<JobDTO> getJobsByCompany(Long companyId) {
        return jobRepository.findOpenJobsByCompany(companyId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public JobDTO getJobById(Long id) {
        Job job = jobRepository.findById(id).orElseThrow(() -> new RuntimeException("Job not found"));
        return mapToDto(job);
    }

    private void validateJobClosure(UpdateJobDto dto) {
        boolean hasComment = dto.getCloseComment() != null && !dto.getCloseComment().trim().isEmpty();
        boolean hasReason = dto.getCloseReason() != null && !dto.getCloseReason().trim().isEmpty();
        boolean hasSelected = dto.getSelectedCandidateIds() != null && !dto.getSelectedCandidateIds().isEmpty();

        if (!hasComment && !hasReason && !hasSelected) {
            throw new RuntimeException("For closed jobs, you must provide a reason");
        }
    }

    private JobDTO mapToDto(Job job) {
        JobDTO dto = modelMapper.map(job, JobDTO.class);
        dto.setCompanyName(job.getCompany().getName());
        dto.setCreatedById(job.getCreatedBy().getId());
        dto.setType(job.getType() != null ? job.getType() : null);
        dto.setStatus(job.getStatus() != null ? job.getStatus() : null);
        dto.setSkillRequirementIds(job.getSkillRequirements().stream().map(sr -> sr.getSkill().getId()).collect(Collectors.toList()));
        dto.setApplications(job.getApplications().stream().map(this::mapApplicationToDto).collect(Collectors.toList()));

        // Also map closure fields
        dto.setCloseComment(job.getCloseComment());
        dto.setCloseReason(job.getCloseReason());
        dto.setSelectedCandidateIds(job.getSelectedCandidateIds());

        return dto;
    }

    private JobApplicationDto mapApplicationToDto(Applications app) {
        JobApplicationDto dto = modelMapper.map(app, JobApplicationDto.class);
        dto.setJobId(app.getJob().getId());
        dto.setCandidateId(app.getCandidate().getId());
        dto.setStatus(app.getStatus() != null ? app.getStatus().name() : null);
        dto.setRecruiterComment(app.getRecruiterComment());
        return dto;
    }
}
