package com.rms.service;

import com.rms.constants.ApplicationStatus;
import com.rms.constants.EmailType;
import com.rms.constants.RoleType;
import com.rms.constants.UserStatus;
import com.rms.dto.EmailDTO;
import com.rms.dto.company.CompanyDto;
import com.rms.dto.user.CandidateProfileDto;
import com.rms.dto.user.CreateCompanyUserDTO;
import com.rms.dto.user.EmployeeDTO;
import com.rms.dto.user.UserSkillDto;
import com.rms.entity.*;
import com.rms.entity.users.*;
import com.rms.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class RecruiterService {

    private final UserRepo userRepo;
    private final CandidateRepository candidateRepository;
    private final UserSkillsRepository userSkillsRepository;
    private final RecruiterRepository recruiterRepository;
    private final JobRepository jobRepository;
    private final NotificationRepository notificationRepository;
    private final ApplicationRepository applicationRepository;
    private final InterviewerRepo interviewerRepo;
    private final SkillRepository skillRepository;
    private final HrRepo hrRepo;
    private final ReviewerRepo reviewerRepo;
    private final ViewerRepo viewerRepo;
    private final UserRepo userRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;
    private final RabbitMqProducer rabbitMqProducer;

    private static final String[] EXPECTED_HEADERS = {
            "Name", "Email", "Phone", "Experience", "Location",
            "Graduation Year", "College Name", "Degree", "Branch", "Current Company",
             "Skills"
    };

    private static final int COL_NAME = 0;
    private static final int COL_EMAIL = 1;
    private static final int COL_PHONE = 2;
    private static final int COL_EXP = 3;
    private static final int COL_LOCATION = 4;
    private static final int COL_GRAD_YEAR = 5;
    private static final int COL_COLLEGE = 6;
    private static final int COL_DEGREE = 7;
    private static final int COL_BRANCH = 8;
    private static final int COL_COMPANY = 9;
    private static final int COL_SKILLS = 10;


    // API TO UPLOAD EXCEL
    public String bulkUploadCandidates(MultipartFile file, UserEntity currentUser) throws IOException {
        if (!isExcelFile(file)) {
            throw new IllegalArgumentException("Invalid file format. Please upload an Excel file.");
        }

        // GET COMPANY ID FOR THE RECRUITER
        Recruiter recruiter = recruiterRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Recruiter profile not found for this user."));

        if (recruiter.getCompany() == null) {
            throw new IllegalArgumentException("You are not associated with any company.");
        }
        Long companyId = recruiter.getCompany().getId();


        try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            int successCount = 0;
            int rowNum = 0;

            while (rows.hasNext()) {
                Row currentRow = rows.next();
                rowNum++;

                // Validate Header Row
                if (rowNum == 1) {
                    validateHeaders(currentRow);
                    continue;
                }

                if (isRowEmpty(currentRow)) continue;

                String name = getCellValue(currentRow, COL_NAME, true, rowNum, "Name");
                String email = getCellValue(currentRow, COL_EMAIL, true, rowNum, "Email");
                String phone = getCellValue(currentRow, COL_PHONE, true, rowNum, "Phone");
                String expStr = getCellValue(currentRow, COL_EXP, true, rowNum, "Experience");
                String currentCompany = getCellValue(currentRow, COL_COMPANY, true, rowNum, "Current Company");

                String location = getCellValue(currentRow, COL_LOCATION, false, rowNum, "Location");
                String gradYearStr = getCellValue(currentRow, COL_GRAD_YEAR, false, rowNum, "Graduation Year");
                String college = getCellValue(currentRow, COL_COLLEGE, false, rowNum, "College Name");
                String degree = getCellValue(currentRow, COL_DEGREE, false, rowNum, "Degree");
                String branch = getCellValue(currentRow, COL_BRANCH, false, rowNum, "Branch");
                String skillsStr = getCellValue(currentRow, COL_SKILLS, false, rowNum, "Skills");

                if (userRepo.findByEmail(email).isPresent()) {
                    throw new IllegalArgumentException("Row " + rowNum + ": Email '" + email + "' already exists.");
                }

                // Create User
                UserEntity user = UserEntity.builder()
                        .name(name)
                        .email(email)
                        .roles(Collections.singleton(RoleType.CANDIDATE))
                        .status(UserStatus.INVITED)
                        .password(null)
                        .isVerified(false)
                        .createdAt(new Date())
                        .build();

                UserEntity savedUser = userRepo.save(user);

                String fullDegree = degree;
                if (!branch.isEmpty()) {
                    fullDegree = degree + " - " + branch;
                }

                // Create Candidate
                Candidate candidate = Candidate.builder()
                        .user(savedUser)
                        .phone(phone)
                        .currentCompany(currentCompany)
                        .totalExperience(parseInteger(expStr))
                        .location(location)
                        .graduationYear(parseInteger(gradYearStr))
                        .collegeName(college)
                        .degree(fullDegree)
                        .profileCompleted(false)
                        .build();

                Candidate savedCandidate = candidateRepository.save(candidate);
                successCount++;

                Map<String, String> emailData = new HashMap<>();
                emailData.put("name",user.getName());
                emailData.put("recruiterName", recruiter.getUser().getName());
                emailData.put("company", recruiter.getCompany().getName());
                EmailDTO message = new EmailDTO(user.getEmail(), EmailType.ADD_CANDIDATE, emailData);
                rabbitMqProducer.sendEmail(message);
            }
            return "Successfully uploaded " + successCount + " candidates.";
        }
    }

    // TO LINK CANDIDATES TO OPEN POSITIONS BASED ON REQ SKILLS == CANDIDATE SKILLS
    @Transactional
    public String autoMatchCandidates(Long jobId, Long userId) {
        Recruiter recruiter = recruiterRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Recruiter not found"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found"));

        if (!job.getCompany().getId().equals(recruiter.getCompany().getId())) {
            throw new IllegalArgumentException("Permission Denied: You do not own this job.");
        }

        Set<Long> requiredSkillIds = job.getRequiredSkills().stream()
                .map(Skill::getId)
                .collect(Collectors.toSet());

        if (requiredSkillIds.isEmpty()) {
            throw new IllegalArgumentException("Job has no required skills defined.");
        }

        Set<Long> preferredSkillIds = job.getPreferredSkills().stream()
                .map(Skill::getId)
                .collect(Collectors.toSet());

        List<Candidate> candidates = candidateRepository.findAll();
        int matchesFound = 0;

        for (Candidate candidate : candidates) {

            if (applicationRepository.existsByJobAndCandidate(job, candidate)) {
                continue;
            }

            Set<Long> candidateSkillIds = candidate.getUserSkills().stream()
                    .map(userSkill -> userSkill.getSkill().getId())
                    .collect(Collectors.toSet());

            if (candidateSkillIds.containsAll(requiredSkillIds)) {
                Applications application = Applications.builder()
                        .job(job)
                        .candidate(candidate)
                        .status(ApplicationStatus.LINKED)
                        .appliedAt(LocalDateTime.now())
                        .recruiterComment("Auto-Matched via System")
                        .build();

                applicationRepository.save(application);

                // 7. FEEDBACK
                Notification notification = Notification.builder()
                        .recipient(candidate.getUser())
                        .message("Congratulations! You matched a new position: " + job.getPosition())
                        .relatedJobId(job.getId())
                        .createdAt(LocalDateTime.now())
                        .isRead(false)
                        .build();

                // ADD EMAIL TO THE QUEUE
                Map<String, String> emailData = new HashMap<>();
                emailData.put("jobTitle", job.getPosition());
                emailData.put("name", candidate.getUser().getName()); // Useful if you want to greet them

                EmailDTO emailDTO = new EmailDTO(candidate.getUser().getEmail(),EmailType.JOB_MATCHED,emailData);
                rabbitMqProducer.sendEmail(emailDTO);

                notificationRepository.save(notification);
                matchesFound++;
            }
        }
        return "Auto-match complete. Linked " + matchesFound + " candidates.";
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

    // ================== FETCH COMPANY REVIEWERS ==================
    public List<EmployeeDTO> getCompanyReviewers(Long userId) {
        Recruiter recruiter = recruiterRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Recruiter not found"));

        if (recruiter.getCompany() == null) {
            throw new IllegalArgumentException("No company associated with this recruiter.");
        }

        List<Reviewer> reviewers = reviewerRepo.findByCompanyId(recruiter.getCompany().getId());

        return reviewers.stream()
                .map(r -> EmployeeDTO.builder()
                        .id(r.getUser().getId())
                        .name(r.getUser().getName())
                        .email(r.getUser().getEmail())
                        .role(RoleType.REVIEWER)
                        .status(r.getUser().getStatus())
                        .build())
                .collect(Collectors.toList());
    }

    // ================== ASSIGN REVIEWERS TO JOB ==================
    @Transactional
    public String assignReviewersToJob(Long jobId, Long recruiterId, List<Long> reviewerUserIds) {
        Recruiter recruiter = recruiterRepository.findByUserId(recruiterId)
                .orElseThrow(() -> new IllegalArgumentException("Recruiter not found"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found"));


        Set<UserEntity> reviewersToAssign = new HashSet<>();
        if (reviewerUserIds != null && !reviewerUserIds.isEmpty()) {
            for (Long rId : reviewerUserIds) {
                Reviewer reviewer = reviewerRepo.findByUserId(rId)
                        .orElseThrow(() -> new IllegalArgumentException("Reviewer with ID " + rId + " not found"));

                if (!reviewer.getCompany().getId().equals(recruiter.getCompany().getId())) {
                    throw new IllegalArgumentException("Reviewer " + reviewer.getUser().getName() + " does not belong to your company.");
                }
                reviewersToAssign.add(reviewer.getUser());
            }
        }

        job.setReviewers(reviewersToAssign);
        jobRepository.save(job);

        return "Reviewers assigned successfully.";
    }


    /*========================================================
                            HELPER METHODS
     ======================================================*/

    private UserEntity getAuthenticatedUserEntity() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found in database: " + email));
    }

    private boolean isExcelFile(MultipartFile file) {
        return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet".equals(file.getContentType());
    }

    private void validateHeaders(Row row) {
        for (int i = 0; i < EXPECTED_HEADERS.length; i++) {
            Cell cell = row.getCell(i);
            String cellValue = (cell == null) ? "" : cell.getStringCellValue().trim();
            if (!EXPECTED_HEADERS[i].equalsIgnoreCase(cellValue)) {
                throw new IllegalArgumentException("Invalid Header at column " + (i + 1) +
                        ". Expected: '" + EXPECTED_HEADERS[i] + "', Found: '" + cellValue + "'");
            }
        }
    }

    private String getCellValue(Row row, int index, boolean isMandatory, int rowNum, String fieldName) {
        Cell cell = row.getCell(index);
        DataFormatter formatter = new DataFormatter();
        String value = formatter.formatCellValue(cell).trim();

        if (isMandatory && value.isEmpty()) {
            throw new IllegalArgumentException("Row " + rowNum + ": Missing mandatory field '" + fieldName + "'");
        }
        return value;
    }

    private boolean isRowEmpty(Row row) {
        if (row == null) return true;
        for (int i = row.getFirstCellNum(); i < row.getLastCellNum(); i++) {
            Cell cell = row.getCell(i);
            if (cell != null && cell.getCellType() != CellType.BLANK && !cell.toString().trim().isEmpty()) {
                return false;
            }
        }
        return true;
    }

    private Integer parseInteger(String value) {
        if (value == null || value.isEmpty()) return null;
        return Integer.parseInt(value);
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
}
