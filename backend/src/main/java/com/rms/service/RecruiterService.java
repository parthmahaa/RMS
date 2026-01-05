package com.rms.service;

import com.rms.constants.ApplicationStatus;
import com.rms.constants.EmailType;
import com.rms.constants.RoleType;
import com.rms.constants.UserStatus;
import com.rms.dto.EmailDTO;
import com.rms.entity.*;
import com.rms.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.core.context.SecurityContextHolder;
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
                if (branch != null && !branch.isEmpty()) {
                    fullDegree = (degree != null ? degree : "") + " - " + branch;
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
                        .associatedCompanyId(companyId)
                        .profileCompleted(false)
                        .build();

                Candidate savedCandidate = candidateRepository.save(candidate);
                successCount++;
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

    /*================= HELPER METHODS =================*/

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
}
