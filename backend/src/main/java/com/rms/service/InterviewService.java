package com.rms.service;

import com.rms.constants.ApplicationStatus;
import com.rms.constants.EmailType;
import com.rms.constants.RoleType;
import com.rms.dto.EmailDTO;
import com.rms.dto.interviews.HrVerificationDto;
import com.rms.dto.interviews.InterviewDocumentsDto;
import com.rms.dto.interviews.InterviewDto;
import com.rms.dto.interviews.InterviewRoundDto;
import com.rms.dto.skills.SkillFeedbackDto;
import com.rms.dto.user.EmployeeDTO;
import com.rms.entity.*;
import com.rms.entity.interviews.Interview;
import com.rms.entity.interviews.InterviewFeedback;
import com.rms.entity.interviews.InterviewRound;
import com.rms.entity.users.Candidate;
import com.rms.entity.users.HR;
import com.rms.entity.users.Recruiter;
import com.rms.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final InterviewRoundRepository interviewRoundRepository;
    private final ApplicationRepository applicationRepository;
    private final RecruiterRepository recruiterRepository;
    private final SkillRepository skillRepository;
    private final CandidateRepository candidateRepository;
    private final HrRepo hrRepo;
    private final InterviewFeedbackRepository interviewFeedbackRepository;
    private final UserRepo userRepository;
    private final RabbitMqProducer rabbitMqProducer;

    // ================= RECRUITER METHODS =================

    public List<InterviewDto> getCompanyInterviews(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Recruiter recruiter = recruiterRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Recruiter not found"));

        if (recruiter.getCompany() == null) {
            throw new RuntimeException("No company associated");
        }

        return interviewRepository.findByCompanyId(recruiter.getCompany().getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void assignInterviewers(Long roundId, List<Long> userIds) {
        InterviewRound round = interviewRoundRepository.findById(roundId)
                .orElseThrow(() -> new RuntimeException("Round not found"));

        List<UserEntity> usersToAssign = userRepository.findAllById(userIds);

        // 1. Determine the target list based on Round Type
        boolean isHrRound = round.getRoundType().toLowerCase().contains("hr");

        // 2. Clear previous assignments to avoid stale data
        round.getInterviewers().clear();
        round.getHrs().clear();

        // 3. Assign users to the specific list strictly based on round type
        if (isHrRound) {
            round.getHrs().addAll(usersToAssign); //
        } else {
            round.getInterviewers().addAll(usersToAssign); //
        }

        interviewRoundRepository.save(round);

        Interview interview = interviewRepository.findById(round.getInterview().getId())
                .orElseThrow(() -> new RuntimeException("Parent Interview not found"));

        Set<Long> existingUserIds = interview.getInterviewers().stream()
                .map(UserEntity::getId)
                .collect(Collectors.toSet());

        boolean parentChanged = false;
        for (UserEntity u : usersToAssign) {
            if (!existingUserIds.contains(u.getId())) {
                interview.getInterviewers().add(u);
                existingUserIds.add(u.getId()); // Update local set
                parentChanged = true;
            }
        }

        if (parentChanged) {
            interviewRepository.save(interview);
        }
    }

    public List<InterviewDto> getAssignedInterviews(String email) {
        UserEntity user = userRepository.findByEmail(email).orElseThrow();
        List<Interview> interviews = interviewRepository.findAllByInterviewersId(user.getId());
        List<Interview> allInterviews = interviewRepository.findAll();
        return allInterviews.stream()
                .filter(i -> i.getRounds().stream()
                        .anyMatch(r -> r.getInterviewers().stream()
                                .anyMatch(u -> u.getId().equals(user.getId()))))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void submitFeedback(Long roundId, String email, List<SkillFeedbackDto> feedbacks) {
        UserEntity interviewer = userRepository.findByEmail(email).orElseThrow();
        InterviewRound round = interviewRoundRepository.findById(roundId).orElseThrow();

        for (SkillFeedbackDto dto : feedbacks) {
            Skill skill = skillRepository.findById(dto.getSkillId())
                    .orElseThrow(() -> new RuntimeException("Skill not found"));

            InterviewFeedback feedback = InterviewFeedback.builder()
                    .round(round)
                    .interviewer(interviewer)
                    .skill(skill)
                    .rating(dto.getRating())
                    .comments(dto.getComments())
                    .build();

            interviewFeedbackRepository.save(feedback);
        }

        round.setStatus("COMPLETED");
        interviewRoundRepository.save(round);
    }

    @Transactional
    public void updateRound(Long roundId, InterviewRoundDto dto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        UserEntity currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        InterviewRound round = interviewRoundRepository.findById(roundId)
                .orElseThrow(() -> new RuntimeException("Round not found"));

        // any rounds held prev
        boolean wasNotScheduled = round.getScheduledAt() == null || round.getMeetingLink() == null;

        if (dto.getMeetingLink() != null) {
            round.setMeetingLink(dto.getMeetingLink());
        }
        if (dto.getComments() != null) {
            round.setComments(dto.getComments());
        }
        if (dto.getStatus() != null) {
            round.setStatus(dto.getStatus());
        }
        if (dto.getScheduledAt() != null) {
            round.setScheduledAt(dto.getScheduledAt());
        }

        if (dto.getFeedbacks() != null && !dto.getFeedbacks().isEmpty()) {
            for (SkillFeedbackDto fbDto : dto.getFeedbacks()) {

                Skill skill = skillRepository.findById(fbDto.getSkillId())
                        .orElseThrow(() -> new RuntimeException("Skill not found ID: " + fbDto.getSkillId()));

                Optional<InterviewFeedback> existingFeedback = interviewFeedbackRepository
                        .findByRoundIdAndSkillIdAndInterviewerId(round.getId(), skill.getId(), currentUser.getId());

                if (existingFeedback.isPresent()) {
                    InterviewFeedback fb = existingFeedback.get();
                    fb.setRating(fbDto.getRating());
                    fb.setComments(fbDto.getComments());
                    interviewFeedbackRepository.save(fb);
                } else {
                    InterviewFeedback newFb = InterviewFeedback.builder() //
                            .round(round)
                            .skill(skill)
                            .interviewer(currentUser)
                            .rating(fbDto.getRating())
                            .comments(fbDto.getComments())
                            .build();
                    interviewFeedbackRepository.save(newFb);
                }
            }
        }
        round  = interviewRoundRepository.save(round);
        boolean isNowScheduled = round.getScheduledAt() != null && round.getMeetingLink() != null;

        if (wasNotScheduled && isNowScheduled) {
            String candidateEmail = round.getInterview().getCandidate().getUser().getEmail();
            String recruiterEmail = round.getInterview().getJob().getCreatedBy().getUser().getEmail();
            Map<String, String> emailData = new HashMap<>();
            emailData.put("roundType", round.getRoundType());
            emailData.put("jobTitle", round.getInterview().getJob().getPosition());
            emailData.put("company", round.getInterview().getJob().getCompany().getName());
            emailData.put("time", round.getScheduledAt().toString().replace("T", " "));
            emailData.put("link", round.getMeetingLink());
            emailData.put("candidateName",round.getInterview().getCandidate().getUser().getName() );

            rabbitMqProducer.sendEmail(new EmailDTO(candidateEmail, EmailType.INTERVIEW_MEETING_INVITE, emailData));

            rabbitMqProducer.sendEmail(new EmailDTO(recruiterEmail, EmailType.INTERVIEW_MEETING_INVITE, emailData));

            for (UserEntity interviewer : round.getInterviewers()) {
                rabbitMqProducer.sendEmail(new EmailDTO(interviewer.getEmail(), EmailType.INTERVIEW_MEETING_INVITE, emailData));
            }

            for (UserEntity hr : round.getHrs()) {
                rabbitMqProducer.sendEmail(new EmailDTO(hr.getEmail(), EmailType.INTERVIEW_MEETING_INVITE, emailData));
            }
        }
    }

    @Transactional
    public void completeInterview(Long interviewId, String finalStatus, String comments) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        Applications app = interview.getApplication();

        try {
            app.setStatus(ApplicationStatus.valueOf(finalStatus));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status provided");
        }

        app.setRecruiterComment(comments);
        applicationRepository.save(app);

        interview.setFinalComments(comments);
        interviewRepository.save(interview);
    }

    @Transactional
    public void uploadCandidateDocuments(
            Long interviewId,
            InterviewDocumentsDto dto
    ) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new IllegalArgumentException("Interview not found"));

        if (dto.getAadharUrl() != null)
            interview.setAadharUrl(dto.getAadharUrl());

        if (dto.getMarksheetUrl() != null)
            interview.setMarksheetUrl(dto.getMarksheetUrl());

        if (dto.getAddressProofUrl() != null)
            interview.setAddressProofUrl(dto.getAddressProofUrl());

    }
    // ================= CANDIDATE METHODS =================

    public List<InterviewDto> getMyInterviews(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Candidate candidate = candidateRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Candidate profile not found"));

        return interviewRepository.findByCandidateId(candidate.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<InterviewDto> getHiredCandidatesForHR(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        HR hr = hrRepo.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("HR profile not found"));

        if (hr.getCompany() == null) {
            throw new RuntimeException("No company associated");
        }

        // Fetch all interviews for the company
        List<Interview> allInterviews = interviewRepository.findByCompanyId(hr.getCompany().getId());

        return allInterviews.stream()
                .filter(i -> i.getApplication().getStatus() == ApplicationStatus.HIRED)
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void verifyDocumentsAndSetDate(Long interviewId, HrVerificationDto dto) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        Applications app = interview.getApplication();

        String hrComment = "HR Verification: " + dto.getRemarks();
        app.setRecruiterComment(hrComment);

        if (dto.getIsApproved()) {
            if (dto.getJoiningDate() == null) {
                throw new IllegalArgumentException("Joining date is required for approval.");
            }

            app.setDocumentsVerified(true);
            app.setJoiningDate(dto.getJoiningDate());
            app.setStatus(ApplicationStatus.OFFER_SENT);
            applicationRepository.save(app);

            Map<String, String> emailData = new HashMap<>();
            emailData.put("candidateName", app.getCandidate().getUser().getName());
            emailData.put("companyName", app.getJob().getCompany().getName());
            emailData.put("joiningDate", dto.getJoiningDate().toString());

            EmailDTO email = new EmailDTO(
                    app.getCandidate().getUser().getEmail(),
                    EmailType.OFFER_LETTER,
                    emailData
            );
            rabbitMqProducer.sendEmail(email);

        } else {
            // --- ON HOLD ---
            app.setDocumentsVerified(false);
            app.setJoiningDate(null);
            app.setStatus(ApplicationStatus.ON_HOLD);

            applicationRepository.save(app);

            Map<String, String> emailData = new HashMap<>();
            emailData.put("name", app.getCandidate().getUser().getName());
            emailData.put("jobTitle", app.getJob().getPosition());
            emailData.put("status", "ON HOLD - Document Verification Issue");
            emailData.put("company", app.getJob().getCompany().getName());

            EmailDTO email = new EmailDTO(
                    app.getCandidate().getUser().getEmail(),
                    EmailType.APPLICATION_STATUS_UPDATE,
                    emailData
            );
            rabbitMqProducer.sendEmail(email);
        }
    }

    // ================= HELPER METHODS =================

    private InterviewDto mapToDto(Interview interview) {

        InterviewDto.InterviewDtoBuilder builder = InterviewDto.builder()
                .id(interview.getId())
                .applicationId(interview.getApplication().getId())
                .companyName(interview.getCompany().getName())
                .candidateName(interview.getCandidate().getUser().getName())
                .position(interview.getJob().getPosition())
                .status(interview.getApplication().getStatus().toString())
                .resumeFilePath(interview.getApplication().getResumeFilePath())
                .finalComments(interview.getFinalComments())
                .aadharUrl(interview.getAadharUrl())
                .joiningDate(interview.getApplication().getJoiningDate())
                .isDocumentsVerified(interview.getApplication().getDocumentsVerified())
                .marksheetUrl(interview.getMarksheetUrl())
                .addressProofUrl(interview.getAddressProofUrl())
                .rounds(
                        interview.getRounds().stream()
                                .sorted(Comparator.comparing(InterviewRound::getRoundNumber))
                                .map(r -> InterviewRoundDto.builder()
                                        .id(r.getId())
                                        .roundNumber(r.getRoundNumber())
                                        .roundType(r.getRoundType())
                                        .status(r.getStatus())
                                        .scheduledAt(r.getScheduledAt())
                                        .meetingLink(r.getMeetingLink())
                                        .comments(r.getComments())
                                        .assignedInterviewers(
                                                r.getInterviewers().stream()
                                                        .map(u -> new EmployeeDTO(
                                                                u.getId(),
                                                                u.getName(),
                                                                u.getEmail(),
                                                                RoleType.INTERVIEWER,
                                                                u.getStatus()))
                                                        .collect(Collectors.toList())
                                        )
                                        .assignedHrs(
                                                r.getHrs().stream()
                                                        .map(u -> new EmployeeDTO(
                                                                u.getId(),
                                                                u.getName(),
                                                                u.getEmail(),
                                                                RoleType.HR,
                                                                u.getStatus()))
                                                        .collect(Collectors.toList())
                                        )
                                        .feedbacks(
                                                r.getFeedbacks() != null
                                                        ? r.getFeedbacks().stream()
                                                        .map(f -> {
                                                            SkillFeedbackDto s = new SkillFeedbackDto();
                                                            s.setSkillId(f.getSkill().getId());
                                                            s.setSkillName(f.getSkill().getName());
                                                            s.setRating(f.getRating());
                                                            s.setComments(f.getComments());
                                                            return s;
                                                        }).collect(Collectors.toList())
                                                        : new ArrayList<>()
                                        )
                                        .build()
                                )
                                .collect(Collectors.toList())
                );

        return builder.build();
    }

}