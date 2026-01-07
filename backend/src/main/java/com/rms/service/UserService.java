package com.rms.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rms.constants.EmailType;
import com.rms.constants.RoleType;
import com.rms.constants.UserStatus;
import com.rms.dto.EmailDTO;
import com.rms.dto.company.CompanyDto;
import com.rms.dto.company.CompanyUpdateDto;
import com.rms.dto.user.*;
import com.rms.entity.*;
import com.rms.entity.users.*;
import com.rms.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.management.relation.Role;
import javax.swing.text.View;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepo userRepository;
    private final CompanyRepository companyRepository;
    private final ModelMapper modelMapper;
    private final ObjectMapper objectMapper;
    private final UserSkillsRepository userSkillsRepository;
    private final SkillRepository skillRepository;
    private final RecruiterRepository recruiterRepository;
    private final CandidateRepository candidateRepository;
    private final InterviewerRepo interviewerRepo;
    private final HrRepo hrRepo;
    private final ReviewerRepo reviewerRepo;
    private final ViewerRepo viewerRepo;
    private final RabbitMqProducer rabbitMqProducer;
    private final PasswordEncoder passwordEncoder;

    private final Logger logger = (Logger) LoggerFactory.getLogger(UserService.class);

    private UserEntity getAuthenticatedUserEntity() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found in database: " + email));
    }

    @Transactional
    public Object updateProfile(String email, Object updateDto) {
        UserEntity user = getAuthenticatedUserEntity();
        if (user.getRoles().contains(RoleType.RECRUITER)) {
            RecruiterProfileUpdateDto dto;
            try {
                dto = objectMapper.convertValue(updateDto, RecruiterProfileUpdateDto.class);
            } catch (Exception e) {
                logger.error("Failed to map object to RecruiterProfileUpdateDto: {}", e.getMessage());
                throw new RuntimeException("Invalid update payload for recruiter.", e);
            }

            Recruiter recruiter = recruiterRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Recruiter profile not found."));

            CompanyUpdateDto cDto = dto.getCompany();
            if (cDto == null) {
                logger.warn("Recruiter updateProfile called with no company data for user {}.", email);
                return getMyProfile(user.getEmail());
            }

            Company companyToUpdate;
            if (recruiter.getCompany() != null) {
                companyToUpdate = recruiter.getCompany();
            } else {
                if (cDto.getWebsite() != null && !cDto.getWebsite().isBlank()) {
                    companyToUpdate = companyRepository.findByWebsiteContaining(cDto.getWebsite())
                            .orElse(new Company());
                } else {
                    companyToUpdate = new Company();
                }

                if (companyToUpdate.getId() == null) {
                    companyToUpdate.setRecruiters(new ArrayList<>());
                    companyToUpdate.setJobs(new ArrayList<>());
                }
            }

            modelMapper.map(cDto, companyToUpdate);

            Company savedCompany = companyRepository.save(companyToUpdate);

            if (recruiter.getCompany() == null || !recruiter.getCompany().getId().equals(savedCompany.getId())) {
                recruiter.setCompany(savedCompany);
            }

            recruiterRepository.save(recruiter);

            return getMyProfile(user.getEmail());

        } else if (user.getRoles().contains(RoleType.CANDIDATE)) {
            CandidateProfileUpdateDto dto;
            try {
                dto = objectMapper.convertValue(updateDto, CandidateProfileUpdateDto.class);
            } catch (Exception e) {
                logger.error("Failed to map object to CandidateProfileUpdateDto: {}", e.getMessage());
                throw new RuntimeException("Invalid update payload for candidate.", e);
            }

            Candidate candidate = candidateRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Candidate profile not found."));

            modelMapper.map(dto, candidate);
            candidate.setBranch(dto.getBranch());

            // to prevent insertion before deletion
            Set<Long> newSkillIds = (dto.getSkills() != null)
                    ? dto.getSkills().stream().map(UserSkillDto::getSkillId).collect(Collectors.toSet())
                    : new HashSet<>();

            candidate.getUserSkills().removeIf(userSkill ->
                    !newSkillIds.contains(userSkill.getSkill().getId())
            );

            Set<Long> existingSkillIds = candidate.getUserSkills().stream()
                    .map(us -> us.getSkill().getId())
                    .collect(Collectors.toSet());

            if (dto.getSkills() != null) {
                dto.getSkills().forEach(skillDto -> {
                    if (!existingSkillIds.contains(skillDto.getSkillId())) {
                        Skill skill = skillRepository.findById(skillDto.getSkillId())
                                .orElseThrow(() -> new RuntimeException("Skill not found with ID: " + skillDto.getSkillId()));

                        UserSkills userSkill = UserSkills.builder()
                                .candidate(candidate)
                                .skill(skill)
                                .build();
                        candidate.addSkill(userSkill);
                    }
                });
            }

            candidateRepository.save(candidate);
            return getMyProfile(user.getEmail());
        }

        throw new RuntimeException("Invalid role. Cannot update profile.");
    }

    public Object getMyProfile(String email) {
        UserEntity user = getAuthenticatedUserEntity();
        if (user.getRoles().contains(RoleType.RECRUITER)
                || user.getRoles().contains(RoleType.REVIEWER)
                || user.getRoles().contains(RoleType.INTERVIEWER)
                || user.getRoles().contains(RoleType.HR)
                || user.getRoles().contains(RoleType.VIEWER)) {

            boolean isProfileComplete = true;
            Company company = null;

            if (user.getRoles().contains(RoleType.RECRUITER)) {
                Recruiter recruiter = recruiterRepository.findByUserId(user.getId())
                        .orElseThrow(() -> new RuntimeException("Recruiter profile not found."));
                company = recruiter.getCompany();
                isProfileComplete = recruiter.isProfileComplete();
            } else if (user.getRoles().contains(RoleType.HR)) {
                HR hr = hrRepo.findByUserId(user.getId())
                        .orElseThrow(() -> new RuntimeException("HR profile not found."));
                company = hr.getCompany();
            } else if (user.getRoles().contains(RoleType.INTERVIEWER)) {
                Interviewer interviewer = interviewerRepo.findByUserId(user.getId())
                        .orElseThrow(() -> new RuntimeException("Interviewer profile not found."));
                company = interviewer.getCompany();
            } else if (user.getRoles().contains(RoleType.REVIEWER)) {
                Reviewer reviewer = reviewerRepo.findByUserId(user.getId())
                        .orElseThrow(() -> new RuntimeException("Reviewer profile not found."));
                company = reviewer.getCompany();
            } else if (user.getRoles().contains(RoleType.VIEWER)) {
                Viewer viewer = viewerRepo.findByUserId(user.getId())
                        .orElseThrow(() -> new RuntimeException("Viewer profile not found."));
                company = viewer.getCompany();
            }

            CompanyDto companyDto = null;
            if (company != null) {
                companyDto = CompanyDto.builder()
                        .id(company.getId())
                        .name(company.getName())
                        .location(company.getLocation())
                        .industry(company.getIndustry())
                        .website(company.getWebsite())
                        .description(company.getDescription())
                        .build();
            }

            return RecruiterProfileDto.builder()
                    .id(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .role(user.getRoles().stream().findFirst().orElse(RoleType.RECRUITER))
                    .profileCompleted(isProfileComplete)
                    .company(companyDto)
                    .build();
        } else if (user.getRoles().contains(RoleType.CANDIDATE)) {
            Candidate candidate = candidateRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Candidate profile not found."));

            List<UserSkillDto> skills = candidate.getUserSkills().stream()
                    .map(us -> UserSkillDto.builder()
                            .id(us.getId())
                            .skillId(us.getSkill().getId())
                            .name(us.getSkill().getName())
                            .build())
                    .toList();

            return CandidateProfileDto.builder()
                    .id(candidate.getId())
                    .name(user.getName())
                    .branch(candidate.getBranch())
                    .email(user.getEmail())
                    .role(RoleType.CANDIDATE.name())
                    .summary(candidate.getSummary())
                    .location(candidate.getLocation())
                    .totalExperience(candidate.getTotalExperience())
                    .resumeFilePath(candidate.getResumeFilePath())
                    .graduationYear(candidate.getGraduationYear())
                    .degree(candidate.getDegree())
                    .phone(candidate.getPhone())
                    .collegeName(candidate.getCollegeName())
                    .currentCompany(candidate.getCurrentCompany())
                    .skills(skills)
                    .build();
        } else {
            throw new RuntimeException("Invalid role. Cannot fetch profile.");
        }
    }

    //======================== FETCH ALL EMPLOYEES OF A COMPANY ====================
    public List<EmployeeDTO> getCompanyEmployees(String email) {
        UserEntity currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Recruiter currentRecruiter = recruiterRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User is not a recruiter"));

        Company company = currentRecruiter.getCompany();
        if (company == null) {
            throw new RuntimeException("No company associated with this account.");
        }

        List<EmployeeDTO> employees = new ArrayList<>();

        List<Recruiter> colleagues = recruiterRepository.findByCompanyId(company.getId());
        for (Recruiter r : colleagues) {
            if (!r.getUser().getId().equals(currentUser.getId())) {
                employees.add(mapToEmployeeDto(r.getUser()));
            }
        }

        List<Interviewer> interviewers = interviewerRepo.findByCompanyId(company.getId());
        for (Interviewer c : interviewers) {
            employees.add(mapToEmployeeDto(c.getUser()));
        }

        List<Viewer> viewers = viewerRepo.findByCompanyId(company.getId());
        for (Viewer c : viewers) {
            employees.add(mapToEmployeeDto(c.getUser()));
        }

        List<HR> hrs = hrRepo.findByCompanyId(company.getId());
        for (HR hr : hrs) {
            employees.add(mapToEmployeeDto(hr.getUser()));
        }

        List<Reviewer> reviewers = reviewerRepo.findByCompanyId(company.getId());
        for (Reviewer r : reviewers) {
            employees.add(mapToEmployeeDto(r.getUser()));
        }
        return employees;
    }

    // ==================================== CREATE CANDIDATE MANUALLY BY RECRUITER ================================
    @Transactional
    public void createCandidate(CandidateProfileDto dto) {
        UserEntity currentUser = getAuthenticatedUserEntity();

        Recruiter currentRecruiter = recruiterRepository
                .findByUserId(currentUser.getId())
                .orElseThrow(() ->
                        new IllegalStateException("Only recruiters can perform this action"));

        Company company = currentRecruiter.getCompany();
        if (company == null) {
            throw new IllegalStateException("Please complete company profile.");
        }

        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new IllegalArgumentException("User with this email already exists.");
        }

        UserEntity user = UserEntity.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                .roles(Set.of(RoleType.CANDIDATE))
                .status(UserStatus.INVITED)
                .isVerified(false)
                .createdAt(new Date())
                .build();

        userRepository.save(user);

        Candidate candidate = Candidate.builder()
                .user(user)
                .summary(dto.getSummary())
                .phone(dto.getPhone())
                .location(dto.getLocation())
                .totalExperience(dto.getTotalExperience())
                .degree(dto.getDegree())
                .branch(dto.getBranch())
                .collegeName(dto.getCollegeName())
                .graduationYear(dto.getGraduationYear())
                .currentCompany(dto.getCurrentCompany())
                .profileCompleted(false)
                .build();

        if (dto.getSkills() != null && !dto.getSkills().isEmpty()) {
            for (UserSkillDto skillDto : dto.getSkills()) {
                Skill skill = skillRepository.findById(skillDto.getSkillId())
                        .orElseThrow(() ->
                                new RuntimeException("Skill not found with ID: " + skillDto.getSkillId()));

                UserSkills userSkill = UserSkills.builder()
                        .candidate(candidate)
                        .skill(skill)
                        .build();

                candidate.addSkill(userSkill);
            }
        }
        candidateRepository.save(candidate);

        Map<String, String> emailData = new HashMap<>();
        emailData.put("role", RoleType.CANDIDATE.toString());
        emailData.put("company", currentRecruiter.getCompany().getName());
        EmailDTO message = new EmailDTO(dto.getEmail(), EmailType.PROFILE_CREATED, emailData);
        rabbitMqProducer.sendEmail(message);
    }


    //============================= CREATE USER BY RECRUITER ======================
    @Transactional
    public void createUserByRecruiter(CreateCompanyUserDTO dto) {
        UserEntity currentUser = getAuthenticatedUserEntity();
        Recruiter currentRecruiter = recruiterRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new IllegalStateException("Only recruiters can perform this action"));

        Company company = currentRecruiter.getCompany();
        if (company == null) {
            throw new RuntimeException("Please complete company profile.");
        }

        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new IllegalArgumentException("User with this email already exists.");
        }

        UserEntity newUser = UserEntity.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                .roles(Set.of(dto.getRole()))
                .status(UserStatus.INVITED)
                .isVerified(false)
                .createdAt(new Date())
                .build();

        UserEntity savedUser = userRepository.save(newUser);

        if (dto.getRole() == RoleType.RECRUITER) {
            Recruiter newEmployee = Recruiter.builder()
                    .user(savedUser)
                    .company(company)
                    .build();
            recruiterRepository.save(newEmployee);
        } else if (dto.getRole() == RoleType.VIEWER) {
            Viewer viewer = Viewer.builder()
                    .company(company)
                    .user(savedUser)
                    .build();
            viewerRepo.save(viewer);
        } else if (dto.getRole() == RoleType.REVIEWER) {
            Reviewer reviewer = Reviewer.builder()
                    .company(company)
                    .user(savedUser)
                    .build();
            reviewerRepo.save(reviewer);
        } else if (dto.getRole() == RoleType.INTERVIEWER) {
            Interviewer interviewer = Interviewer.builder()
                    .company(company)
                    .user(savedUser)
                    .build();
            interviewerRepo.save(interviewer);
        } else if (dto.getRole() == RoleType.HR) {
            HR hr = HR.builder()
                    .company(company)
                    .user(savedUser)
                    .build();
            hrRepo.save(hr);
        } else {
            throw new RuntimeException("Cannot create user with role:" + dto.getRole());
        }

        Map<String, String> emailData = new HashMap<>();
        emailData.put("company", company.getName());
        emailData.put("role", dto.getRole().toString());
        EmailDTO message = new EmailDTO(dto.getEmail(), EmailType.PROFILE_CREATED, emailData);
        rabbitMqProducer.sendEmail(message);
    }

    // ================= RECRUITER CAN DELETE A COMPANY USER ===========================
    public void deleteCompanyUser(Long userId) {
        UserEntity requester = getAuthenticatedUserEntity();
        Recruiter recruiter = recruiterRepository.findByUserId(requester.getId())
                .orElseThrow(() -> new IllegalStateException("Only recruiters can delete"));

        Company recruiterCompany = recruiter.getCompany();
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));


        if (user.getRoles().contains(RoleType.VIEWER)) {
            viewerRepo.findByUserId(userId).ifPresent(viewerRepo::delete);
        }

        if (user.getRoles().contains(RoleType.RECRUITER)) {
            recruiterRepository.findByUserId(userId).ifPresent(recruiterRepository::delete);
        }

        if (user.getRoles().contains(RoleType.HR)) {
            hrRepo.findByUserId(userId).ifPresent(hrRepo::delete);
        }

        if (user.getRoles().contains(RoleType.INTERVIEWER)) {
            interviewerRepo.findByUserId(userId).ifPresent(interviewerRepo::delete);
        }

        if (user.getRoles().contains(RoleType.REVIEWER)) {
            reviewerRepo.findByUserId(userId).ifPresent(reviewerRepo::delete);
        }

        userRepository.delete(user);
    }

    // ==========================  HELPER METHODS  ====================================

    private boolean isValidRole(RoleType role) {
        return role == RoleType.HR ||
                role == RoleType.RECRUITER ||
                role == RoleType.INTERVIEWER ||
                role == RoleType.REVIEWER;
    }

    private CandidateProfileDto mapCandidateToProfileDto(Candidate candidate, UserEntity user) {
        CandidateProfileDto dto = modelMapper.map(candidate, CandidateProfileDto.class);

        List<UserSkillDto> skills = userSkillsRepository.findByCandidateId(candidate.getId()).stream()
                .map(userSkill -> UserSkillDto.builder()
                        .id(userSkill.getSkill().getId())
                        .name(userSkill.getSkill().getName())
                        .build())
                .collect(Collectors.toList());
        dto.setSkills(skills);

        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setProfileCompleted(candidate.isProfileComplete());

        return dto;
    }

    private EmployeeDTO mapToEmployeeDto(UserEntity user) {
        RoleType role = user.getRoles().stream().findFirst().orElse(RoleType.CANDIDATE);

        return EmployeeDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(role)
                .status(user.getStatus())
                .build();
    }

    private CompanyDto mapToCompanyDto(Company company) {
        return modelMapper.map(company, CompanyDto.class);
    }

    public boolean checkMyProfileStatus() {
        UserEntity user = getAuthenticatedUserEntity();

        if (user.getRoles().contains(RoleType.CANDIDATE)) {
            Candidate candidate = candidateRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new IllegalStateException("User data inconsistent: No Candidate record found for user."));
            return candidate.isProfileComplete();

        } else if (user.getRoles().contains(RoleType.RECRUITER)) {
            Recruiter recruiter = recruiterRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new IllegalStateException("Recruiter not found"));
            return recruiter.isProfileComplete();
        }

        return user.isProfileComplete();
    }

    public void validateCompanyInfo(UserEntity user) {
        if (!user.getRoles().contains(RoleType.RECRUITER)) {
            return;
        }

        Recruiter recruiter = recruiterRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Recruiter profile not found"));
        Company company = recruiter.getCompany();

        if (company == null) {
            throw new RuntimeException("No company assigned. Please add your company details.");
        }

        boolean incomplete = isCompanyProfileIncomplete(company);

        if (incomplete) {
            throw new RuntimeException("Company profile incomplete. Please fill all required company details before proceeding.");
        }
    }

    private boolean isCompanyProfileIncomplete(Company company) {
        return company.getName() == null || company.getName().isEmpty() ||
                company.getLocation() == null || company.getLocation().isEmpty() ||
                company.getIndustry() == null || company.getIndustry().isEmpty() ||
                company.getWebsite() == null || company.getWebsite().isEmpty() ||
                company.getDescription() == null || company.getDescription().isEmpty();

    }
}