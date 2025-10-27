package com.rms.service;

import com.rms.constants.ApplicationStatus;
import com.rms.constants.JobStatus;
import com.rms.constants.RoleType;
import com.rms.dto.jobs.ApplicationStatusUpdateDto;
import com.rms.dto.jobs.JobApplicationDto;
import com.rms.entity.Applications;
import com.rms.entity.Candidate;
import com.rms.entity.Job;
import com.rms.entity.UserEntity;
import com.rms.repository.ApplicationRepository;
import com.rms.repository.CandidateRepository;
import com.rms.repository.JobRepository;
import com.rms.repository.UserRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationService {
    private final ApplicationRepository applicationRepository;  // Updated for Applications
    private final JobRepository jobRepository;
    private final CandidateRepository candidateRepository;
    private final UserRepo userRepository;
    private final ModelMapper modelMapper;

    @Transactional
    public JobApplicationDto applyToJob(Long jobId, Long candidateId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        if (!user.getRoles().contains(RoleType.CANDIDATE)) {
            throw new RuntimeException("Only candidates can apply");
        }

        Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
        if (!JobStatus.OPEN.equals(job.getStatus())) {
            throw new RuntimeException("Job is not open");
        }

        Candidate candidate = candidateRepository.findById(candidateId).orElseThrow(() -> new RuntimeException("Candidate not found"));
        if (!candidate.isProfileCompleted()) {
            throw new RuntimeException("Profile must be completed before applying. Please update via /api/candidate/profile.");
        }

        if (applicationRepository.findByJobIdAndCandidateId(jobId, candidateId).isPresent()) {
            throw new RuntimeException("Already applied");
        }

        Applications application = new Applications();
        application.setJob(job);
        application.setCandidate(candidate);
        application.setAppliedAt(LocalDateTime.now());
        application.setStatus(ApplicationStatus.PENDING);

        application = applicationRepository.save(application);

        job.getApplications().add(application);
        candidate.getApplications().add(application);
        jobRepository.save(job);
        candidateRepository.save(candidate);

        return mapToDto(application);
    }

    public List<JobApplicationDto> getApplicationsByJob(Long jobId) {
        return applicationRepository.findByJobId(jobId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<JobApplicationDto> getApplicationsByCandidate(Long candidateId) {
        return applicationRepository.findByCandidateId(candidateId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public JobApplicationDto updateApplicationStatus(Long applicationId, ApplicationStatusUpdateDto dto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity recruiter = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!recruiter.getRoles().contains(RoleType.RECRUITER)) {
            throw new RuntimeException("Only recruiters can update applications");
        }

        Applications application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        Job job = application.getJob();

        if (!job.getCreatedBy().getId().equals(recruiter.getId())) {
            throw new RuntimeException("You are not authorized to update this application");
        }

        application.setStatus(ApplicationStatus.valueOf(dto.getStatus().toString().toUpperCase()));
        application.setRecruiterComment(dto.getRemarks());

        application = applicationRepository.save(application);
        return mapToDto(application);
    }


    private JobApplicationDto mapToDto(Applications app) {
        JobApplicationDto dto = modelMapper.map(app, JobApplicationDto.class);
        dto.setJobId(app.getJob().getId());
        dto.setCandidateId(app.getCandidate().getId());
        dto.setStatus(app.getStatus() != null ? app.getStatus().name() : null);
        dto.setRecruiterComment(app.getRecruiterComment());
        return dto;
    }
}
