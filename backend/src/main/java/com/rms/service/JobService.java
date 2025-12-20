package com.rms.service;

import com.rms.Application;
import com.rms.constants.JobStatus;
import com.rms.constants.JobType;
import com.rms.constants.RoleType;
import com.rms.constants.SkillType;
import com.rms.dto.jobs.*;
import com.rms.dto.skills.SkillReqDTO;
import com.rms.entity.*;
import com.rms.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
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

        Recruiter recruiter = recruiterRepository.findByUserId(user.getId())
                .orElseThrow(()-> new IllegalStateException("Recruiter not found"));

        Company company = recruiter.getCompany();
        if (company == null) {
            throw new RuntimeException("You must have a company assigned to create a job.");
        }

        // FETCH SKILLS FROM THE DB BASED ON DTO
        List<Skill> reqSkills = fetchSkillsByIds(dto.getRequiredSkillIds());
        List<Skill> prefSkills = fetchSkillsByIds(dto.getPreferredSkillIds());

        Job job = Job.builder()
                .position(dto.getPosition())
                .description(dto.getDescription())
                .createdBy(recruiter)
                .location(dto.getLocation())
                .type(dto.getType())
                .status(JobStatus.OPEN)
                .company(company)
                .postedAt(LocalDateTime.now())
                .requiredSkills(reqSkills)
                .preferredSkills(prefSkills)
                .build();

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

//        userService.validateCompanyInfo(user);

        Recruiter recruiter = recruiterRepository.findByUserId(user.getId())
                .orElseThrow(()-> new IllegalStateException("Recruiter not found"));

        // VALIDATE JOB FOR CLOSED COMMENT IF SET TO CLOSED
        if (dto.getStatus() != null) {
            JobStatus newStatus = JobStatus.valueOf(dto.getStatus().toUpperCase());
            if (newStatus == JobStatus.CLOSED) {
                validateJobClosure(dto);
            }
            job.setStatus(newStatus);
        }
        if (dto.getType() != null) {
            job.setType(JobType.valueOf(dto.getType().toUpperCase()).toString());
        }

        if (dto.getPosition() != null) job.setPosition(dto.getPosition());
        if (dto.getDescription() != null) job.setDescription(dto.getDescription());
        if (dto.getLocation() != null) job.setLocation(dto.getLocation());
        if (dto.getCloseReason() != null) job.setCloseReason(dto.getCloseReason());
        if (dto.getSelectedCandidateIds() != null) job.setSelectedCandidateIds(dto.getSelectedCandidateIds());

        if (dto.getRequiredSkillIds() != null) {
            job.setRequiredSkills(fetchSkillsByIds(dto.getRequiredSkillIds()));
        }
        if (dto.getPreferredSkillIds() != null) {
            job.setPreferredSkills(fetchSkillsByIds(dto.getPreferredSkillIds()));
        }

        Job savedJob = jobRepository.save(job);
        return mapJobToDto(savedJob);
    }

    public List<JobDTO> getOpenJobs() {
        return jobRepository.findAllOpenJobs().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public JobDTO closeJob(Long id, JobCloseDto dto) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Recruiter recruiter = recruiterRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalStateException("Recruiter profile not found"));


        if (JobStatus.CLOSED.toString().equals(job.getStatus())) {
            throw new RuntimeException("This job is already closed.");
        }

        boolean hasSelectedCandidates = dto.getSelectedCandidateIds() != null && !dto.getSelectedCandidateIds().isEmpty();
        boolean hasReason = dto.getCloseReason() != null && !dto.getCloseReason().trim().isEmpty();

        if (!hasSelectedCandidates && !hasReason) {
            throw new RuntimeException("A closure comment/reason is required if no candidates are selected.");
        }

        // 6. Apply changes and save
        job.setStatus(JobStatus.CLOSED);
        job.setCloseReason(dto.getCloseReason());

        if (hasSelectedCandidates) {
            job.setSelectedCandidateIds(dto.getSelectedCandidateIds());
        }

        Job savedJob = jobRepository.save(job);
        return mapToDto(savedJob);
    }

    @Transactional
    public void deleteJob(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Recruiter recruiter = recruiterRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalStateException("Recruiter profile not found"));

        if (!job.getCreatedBy().getId().equals(recruiter.getId())) {
            throw new RuntimeException("You are not authorized to delete this job.");
        }

        jobRepository.delete(job);
    }

    public List<JobDTO> getJobsByCompany() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Recruiter recruiter = recruiterRepository.findByUserId(user.getId())
                .orElseThrow(()-> new IllegalStateException("Recruiter not found"));

        if (recruiter.getCompany() == null) {
            throw new RuntimeException("You must update your company profile to view jobs.");
        }
        Long companyId = recruiter.getCompany().getId();
        System.out.println(companyId);

        return jobRepository.findJobsByCompany(companyId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public JobDTO getJobById(Long id) {
        Job job = jobRepository.findById(id).orElseThrow(() -> new RuntimeException("Job not found"));
        return mapToDto(job);
    }


    // ========================== HELPER METHOD ============================
    private void validateJobClosure(UpdateJobDto dto) {
        boolean hasComment = dto.getCloseComment() != null && !dto.getCloseComment().trim().isEmpty();
        boolean hasReason = dto.getCloseReason() != null && !dto.getCloseReason().trim().isEmpty();
        boolean hasSelected = dto.getSelectedCandidateIds() != null && !dto.getSelectedCandidateIds().isEmpty();

        if (!hasComment && !hasReason && !hasSelected) {
            throw new RuntimeException("For closed jobs, you must provide a reason");
        }
    }

    private List<Skill> fetchSkillsByIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return new ArrayList<>();
        }
        return skillRepository.findAllById(ids);
    }

    private JobDTO mapJobToDto(Job job) {
        JobDTO dto = modelMapper.map(job, JobDTO.class);
        dto.setCompanyName(job.getCompany().getName());
        dto.setCreatedById(job.getCreatedBy().getId());

        // Map Entities -> SkillReqDTO
        dto.setRequiredSkills(job.getRequiredSkills().stream()
                .map(skill -> mapSkillToReqDto(skill, true))
                .collect(Collectors.toList()));

        dto.setPreferredSkills(job.getPreferredSkills().stream()
                .map(skill -> mapSkillToReqDto(skill, false))
                .collect(Collectors.toList()));

        if (job.getApplications() != null) {
            dto.setApplications(job.getApplications().stream()
                    .map(this::mapApplicationToDto)
                    .collect(Collectors.toList()));
        }

        return dto;
    }
    private SkillReqDTO mapSkillToReqDto(Skill skill, boolean isMandatory) {
        return SkillReqDTO.builder()
                .skillId(skill.getId())
                .skillName(skill.getName())
                .mandatory(isMandatory)
                .build();
    }

    private JobDTO mapToDto(Job job) {
        JobDTO dto = modelMapper.map(job, JobDTO.class);
        dto.setCompanyName(job.getCompany().getName());
        dto.setCreatedById(job.getCreatedBy().getId());
        dto.setType(job.getType() != null ? job.getType() : null);
        dto.setStatus(job.getStatus() != null ? job.getStatus().toString() : null);

        if (job.getRequiredSkills() != null) {
            dto.setRequiredSkills(job.getRequiredSkills().stream()
                    .map(skill -> mapSkillToReqDto(skill, true))
                    .collect(Collectors.toList()));
        } else {
            dto.setRequiredSkills(new ArrayList<>());
        }

        if (job.getPreferredSkills() != null) {
            dto.setPreferredSkills(job.getPreferredSkills().stream()
                    .map(skill -> mapSkillToReqDto(skill, false))
                    .collect(Collectors.toList()));
        } else {
            dto.setPreferredSkills(new ArrayList<>());
        }

        if (job.getApplications() != null) {
            dto.setApplications(job.getApplications().stream()
                    .map(this::mapApplicationToDto)
                    .collect(Collectors.toList()));
        } else {
            dto.setApplications(new ArrayList<>());
        }

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
