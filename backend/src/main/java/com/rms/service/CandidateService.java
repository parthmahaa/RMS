package com.rms.service;

import com.rms.constants.ApplicationStatus;
import com.rms.dto.jobs.JobApplicationDto;
import com.rms.entity.Applications;
import com.rms.entity.users.Candidate;
import com.rms.repository.ApplicationRepository;
import com.rms.repository.CandidateRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CandidateService {

    private final ApplicationRepository applicationRepository;
    private final CandidateRepository candidateRepository;
    private final Logger logger = LoggerFactory.getLogger(CandidateService.class);

    public List<JobApplicationDto> getMatchedJobs(Long userId) {
        Candidate candidate = candidateRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Candidate profile not found"));

        List<Applications> linkedApps = applicationRepository
                .findByCandidateIdAndStatus(candidate.getId(), ApplicationStatus.LINKED);

        return linkedApps.stream()
                .map(this::mapToJobApplicationDto)
                .collect(Collectors.toList());
    }

    private JobApplicationDto mapToJobApplicationDto(Applications app) {
        return JobApplicationDto.builder()
                .id(app.getId())
                .jobId(app.getJob().getId())
                .position(app.getJob().getPosition())
                .companyName(app.getJob().getCompany().getName())
                .status(app.getStatus().name())
                .appliedAt(app.getAppliedAt())
                .recruiterComment(app.getRecruiterComment())
                .build();
    }
}
