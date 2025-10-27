package com.rms.service;

import com.rms.constants.RoleType;
import com.rms.dto.user.CandidateProfileDto;
import com.rms.dto.user.CandidateProfileUpdateDto;
import com.rms.dto.user.UserSkillDto;
import com.rms.entity.Candidate;
import com.rms.entity.Skill;
import com.rms.entity.UserEntity;
import com.rms.entity.UserSkills;
import com.rms.repository.CandidateRepository;
import com.rms.repository.SkillRepository;
import com.rms.repository.UserRepo;
import com.rms.repository.UserSkillsRepository;
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
public class CandidateService {
    private final CandidateRepository candidateRepository;
    private final UserSkillsRepository userSkillsRepository;
    private final SkillRepository skillRepository;
    private final UserRepo userRepository;
    private final ModelMapper modelMapper;
    private final Logger logger = LoggerFactory.getLogger(CandidateService.class);


}
