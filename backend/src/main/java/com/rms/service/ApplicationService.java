package com.rms.service;

import com.rms.constants.ApplicationStatus;
import com.rms.constants.EmailType;
import com.rms.constants.JobStatus;
import com.rms.constants.RoleType;
import com.rms.dto.EmailDTO;
import com.rms.dto.jobs.ApplicationStatusUpdateDto;
import com.rms.dto.jobs.JobApplicationDto;
import com.rms.entity.*;
import com.rms.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationService {
    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final CandidateRepository candidateRepository;
    private final UserRepo userRepository;
    private final SkillRepository skillRepository;
    private final RecruiterRepository recruiterRepository;
    private final RabbitMqProducer rabbitMqProducer;
    private final ModelMapper modelMapper;

    //===================== APPLY FOR A JOB =================
    @Transactional
    public JobApplicationDto applyToJob(JobApplicationDto dto) {
        Job job = jobRepository.findById(dto.getJobId()).orElseThrow(() -> new RuntimeException("Job not found"));

        Candidate candidate = candidateRepository.findByUserId(dto.getCandidateId())
                .orElseThrow(() -> new RuntimeException("Candidate profile not found."));

        if (!candidate.isProfileComplete()) {
            throw new RuntimeException("Profile must be completed before applying.");
        }

        if (applicationRepository.findByJobIdAndCandidateId(dto.getJobId(), candidate.getId()).isPresent()) {
            throw new RuntimeException("Already applied");
        }

        Applications application = new Applications();
        application.setJob(job);
        application.setCandidate(candidate);
        application.setCandidateExperience(candidate.getTotalExperience().longValue()); // determined from profile details
        application.setAppliedAt(LocalDateTime.now());
        application.setStatus(ApplicationStatus.PENDING);
        application.setResumeFilePath(dto.getResumeFilePath());
        application.setCoverLetter(dto.getCoverLetter());
        application = applicationRepository.save(application);

        job.getApplications().add(application);
        candidate.getApplications().add(application);
        jobRepository.save(job);
        candidateRepository.save(candidate);

        return mapToDto(application);
    }

    //================ GET ALL APPLICATIONS FOR A JOB =================
    public List<JobApplicationDto> getApplicationsByJob(Long jobId) {
        return applicationRepository.findByJobId(jobId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // ================== GET A SPECIFIC APPLICATION DETAILS =========================
    public JobApplicationDto getApplicationById(Long applicationId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Recruiter recruiter = recruiterRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Recruiter profile not found"));

        Applications app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        return mapToDto(app);
    }

    //===================== CANDIDATE APPLICATIONS ====================
    public List<JobApplicationDto> getMyApplications() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        Candidate candidate = candidateRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Candidate profile not found."));

        return applicationRepository.findByCandidateId(candidate.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // ======================= UPDATE THE STATUS OF A APPLICATION ========================
    @Transactional
    public JobApplicationDto updateApplicationStatus(Long applicationId, ApplicationStatusUpdateDto dto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity recruiterUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Applications application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        Job job = application.getJob();

        /* ADD OTHER DETAILS WHICH RECRUITER WILL UPDATE AT THE APPROVAL PHASE */
        application.setStatus(ApplicationStatus.valueOf(dto.getStatus().toString().toUpperCase()));
        application.setRecruiterComment(dto.getRemarks());

        if(dto.getCandidateSkills()!=null && !dto.getCandidateSkills().isEmpty()){
            List<Skill> skillsToAdd = skillRepository.findAllById(dto.getCandidateSkills());
            application.setCandidateSkills(skillsToAdd);
        }
        application = applicationRepository.save(application);

        // send mail
        Map<String,String> emaildata= new HashMap<>();
        emaildata.put("jobTitle", job.getPosition());
        emaildata.put("status",application.getStatus().toString());
        emaildata.put("company", job.getCompany().getName());

        EmailDTO message = new EmailDTO(
                application.getCandidate().getUser().getEmail(),
                EmailType.APPLICATION_STATUS_UPDATE,
                emaildata
        );
        rabbitMqProducer.sendEmail(message);
        return mapToDto(application);
    }


    private JobApplicationDto mapToDto(Applications app) {
        JobApplicationDto dto = modelMapper.map(app, JobApplicationDto.class);
        dto.setJobId(app.getJob().getId());
        dto.setCandidateId(app.getCandidate().getId());
        dto.setCandidateName(app.getCandidate().getUser().getName());
        dto.setResumeFilePath(app.getResumeFilePath());
        dto.setCoverLetter(app.getCoverLetter());
        dto.setStatus(app.getStatus() != null ? app.getStatus().name() : null);
        dto.setRecruiterComment(app.getRecruiterComment());
        dto.setCandidateExperience(app.getCandidateExperience());
        dto.setCandidateSkills(app.getCandidateSkills());
        Job job = app.getJob();
        if (job != null) {
            dto.setPosition(job.getPosition());
            dto.setLocation(job.getLocation());
            dto.setType(job.getType());
            if (job.getCompany() != null) {
                dto.setCompanyName(job.getCompany().getName());
            }
        }

        return dto;
    }
}