package com.rms.service;

import com.rms.constants.ApplicationStatus;
import com.rms.constants.EmailType;
import com.rms.dto.EmailDTO;
import com.rms.dto.jobs.ApplicationStatusUpdateDto;
import com.rms.dto.jobs.JobApplicationDto;
import com.rms.dto.skills.ApplicationSkillDto;
import com.rms.entity.*;
import com.rms.entity.interviews.Interview;
import com.rms.entity.interviews.InterviewRound;
import com.rms.entity.users.Candidate;
import com.rms.entity.users.Recruiter;
import com.rms.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
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
    private final InterviewRepository interviewRepository;
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

        if (dto.getSkillsWithYoe() != null) {
            application.getApplicationSkills().clear();

            for (ApplicationSkillDto skillDto : dto.getSkillsWithYoe()) {
                Skill skill = skillRepository.findById(skillDto.getSkillId())
                        .orElseThrow(() -> new RuntimeException("Skill not found: " + skillDto.getSkillId()));

                ApplicationSkill appSkill = ApplicationSkill.builder()
                        .application(application)
                        .skill(skill)
                        .yearsOfExperience(skillDto.getYearsOfExperience())
                        .build();

                application.addApplicationSkill(appSkill);
            }
        }

        if (dto.getStatus() == ApplicationStatus.INTERVIEW_SCHEDULED || dto.getStatus() == ApplicationStatus.TEST_SCHEDULED) {
            Optional<Interview> existingInterviewOpt = interviewRepository.findByApplicationId(application.getId());

            int targetRounds = (dto.getNumberOfRounds() != null && dto.getNumberOfRounds() > 0) ? dto.getNumberOfRounds() : 2;

            if (existingInterviewOpt.isPresent()) {
                Interview interview = existingInterviewOpt.get();

                for (InterviewRound round : interview.getRounds()) {
                    round.setStatus("SCHEDULED");
                }

                updateInterviewRounds(interview, targetRounds);
            } else {
                createInterviewForApplication(application, job, targetRounds);
            }
        }

        if (dto.getStatus() == ApplicationStatus.HIRED) {
            Optional<Interview> existingInterviewOpt = interviewRepository.findByApplicationId(application.getId());

            if (existingInterviewOpt.isPresent()) {
                Interview interview = existingInterviewOpt.get();

                for (InterviewRound round : interview.getRounds()) {
                    if (!"COMPLETED".equals(round.getStatus())) {
                        round.setStatus("COMPLETED");
                    }
                }

                if (dto.getRemarks() != null && !dto.getRemarks().isEmpty()) {
                    interview.setFinalComments(dto.getRemarks());
                }

                interviewRepository.save(interview);
            }
        }

        application = applicationRepository.save(application);

        // send mail
        if (application.getStatus() == ApplicationStatus.TEST_SCHEDULED) {
            Map<String, String> testEmailData = new HashMap<>();
            testEmailData.put("jobTitle", job.getPosition());
            testEmailData.put("company", job.getCompany().getName());

            EmailDTO testEmail = new EmailDTO(
                    application.getCandidate().getUser().getEmail(),
                    EmailType.ONLINE_TEST_LINK,
                    testEmailData
            );
            rabbitMqProducer.sendEmail(testEmail);

        } else {
            Map<String, String> emaildata = new HashMap<>();
            emaildata.put("jobTitle", job.getPosition());
            emaildata.put("status", application.getStatus().toString());
            emaildata.put("company", job.getCompany().getName());

            EmailDTO message = new EmailDTO(
                    application.getCandidate().getUser().getEmail(),
                    EmailType.APPLICATION_STATUS_UPDATE,
                    emaildata
            );
            rabbitMqProducer.sendEmail(message);
        }
        return mapToDto(application);
    }

    private void updateInterviewRounds(Interview interview, int targetRounds) {
        List<InterviewRound> rounds = interview.getRounds();
        int currentCount = rounds.size();

        if (targetRounds > currentCount) {
            for (int i = currentCount + 1; i <= targetRounds; i++) {
                String type;
                if (i == targetRounds && targetRounds > 1) {
                    type = "HR Round";
                } else {
                    type = "Technical Round " + i;
                }

                InterviewRound round = InterviewRound.builder()
                        .interview(interview)
                        .roundNumber(i)
                        .roundType(type)
                        .status("SCHEDULED")
                        .build();
                rounds.add(round);
            }
        } else if (targetRounds < currentCount) {
            rounds.subList(targetRounds, currentCount).clear();
        }

        interviewRepository.save(interview);
    }

    private void createInterviewForApplication(Applications app, Job job, Integer roundsCount) {
        Interview interview = Interview.builder()
                .application(app)
                .company(job.getCompany())
                .candidate(app.getCandidate())
                .job(job)
                .createdAt(LocalDateTime.now())
                .rounds(new ArrayList<>())
                .build();

        int totalRounds = (roundsCount != null && roundsCount > 0) ? roundsCount : 2;

        for (int i = 1; i <= totalRounds; i++) {
            String type;
            if (i == totalRounds && totalRounds > 1) {
                type = "HR Round";
            } else {
                type = "Technical Round " + i;
            }

            InterviewRound round = InterviewRound.builder()
                    .interview(interview)
                    .roundNumber(i)
                    .roundType(type)
                    .status("SCHEDULED")
                    .build();
            interview.getRounds().add(round);
        }

        interviewRepository.save(interview);
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
        List<ApplicationSkillDto> skillDtos = app.getApplicationSkills().stream()
                .map(as -> new ApplicationSkillDto(
                        as.getId(),
                        as.getSkill().getId(),
                        as.getSkill().getName(),
                        as.getYearsOfExperience()))
                .collect(Collectors.toList());

        dto.setSkills(skillDtos);
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