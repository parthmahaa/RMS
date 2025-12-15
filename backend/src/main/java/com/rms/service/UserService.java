package com.rms.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rms.constants.RoleType;
import com.rms.dto.company.CompanyDto;
import com.rms.dto.company.CompanyUpdateDto;
import com.rms.dto.user.*;
import com.rms.entity.*;
import com.rms.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
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

    private final Logger logger = (Logger) LoggerFactory.getLogger(UserService.class);

    private UserEntity getAuthenticatedUserEntity() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found in database: " + email));
    }

    @Transactional
    public CompanyDto updateCompany(CompanyUpdateDto dto) {
        UserEntity user = getAuthenticatedUserEntity();
        Recruiter recruiter = recruiterRepository.findByUserId(user.getId())
                .orElseThrow(()-> new IllegalStateException("Recruiter not found"));
        Company company;
        if (recruiter.getCompany() == null) {
            company = new Company();
            company.setRecruiters(new ArrayList<>());
            company.setJobs(new ArrayList<>());
            recruiter.setCompany(company);
        } else {
            company = recruiter.getCompany();
        }

        modelMapper.map(dto, company);
        company = companyRepository.save(company);

        if (recruiter.getCompany() == null || !recruiter.getCompany().getId().equals(company.getId())) {
            recruiter.setCompany(company);
            recruiterRepository.save(recruiter);
        }

        return mapToCompanyDto(company);
    }

    public CompanyDto getMyCompany() {
        UserEntity user = getAuthenticatedUserEntity();

        if (!user.getRoles().contains(RoleType.RECRUITER)) {
            throw new RuntimeException("User is not a recruiter.");
        }
        Recruiter recruiter = recruiterRepository.findByUserId(user.getId())
                .orElseThrow(()-> new IllegalStateException("Recruitter not found"));
        if (recruiter.getCompany() == null) {
            throw new RuntimeException("No company associated with your account");
        }
        return mapToCompanyDto(recruiter.getCompany());
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

            modelMapper.map(dto,candidate);
            candidate.getUserSkills().clear();
            candidate.setBranch(dto.getBranch());
            if (dto.getSkills() != null) {
                dto.getSkills().forEach(skillDto -> {
                    Skill skill = skillRepository.findById(skillDto.getSkillId())
                            .orElseThrow(() -> new RuntimeException("Skill not found with ID: " + skillDto.getSkillId()));

                    UserSkills userSkill = UserSkills.builder()
                            .candidate(candidate)
                            .skill(skill)
                            .build();

                    candidate.getUserSkills().add(userSkill);
                });
            }

            candidateRepository.save(candidate);
            return getMyProfile(user.getEmail());
        }

        throw new RuntimeException("Invalid role. Cannot update profile.");
    }

    public Object getMyProfile(String email) {
        UserEntity user = getAuthenticatedUserEntity();
        if (user.getRoles().contains(RoleType.RECRUITER)) {
            Recruiter recruiter = recruiterRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Recruiter profile not found."));

            Company company = recruiter.getCompany();
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
                    .id(recruiter.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .role(RoleType.RECRUITER)
                    .profileCompleted(recruiter.isProfileComplete())
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
                    .orElseThrow(()-> new IllegalStateException("Recruiter not found"));
            return recruiter.isProfileComplete();
        }

        return user.isProfileComplete();
    }

    public void validateCompanyInfo(UserEntity user) {
        if (!user.getRoles().contains(RoleType.RECRUITER)) {
            return;
        }

        Recruiter recruiter = recruiterRepository.findByUserId(user.getId())
                .orElseThrow(()-> new IllegalArgumentException("Recruiter profile not found"));
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
        return  company.getName() == null || company.getName().isEmpty() ||
                company.getLocation() == null || company.getLocation().isEmpty() ||
                company.getIndustry() == null || company.getIndustry().isEmpty() ||
                company.getWebsite() == null || company.getWebsite().isEmpty() ||
                company.getDescription() == null || company.getDescription().isEmpty();

    }
}