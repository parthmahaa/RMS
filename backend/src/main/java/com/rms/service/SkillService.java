package com.rms.service;

import com.rms.dto.skills.SkillDto;
import com.rms.entity.Skill;
import com.rms.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SkillService {
    private final SkillRepository skillRepository;
    private final ModelMapper modelMapper;

    public List<SkillDto> getAllSkills() {
        // ... (No changes needed) ...
        return skillRepository.findAllByOrderByName().stream()
                .map(this::mapToSkillDto)
                .collect(Collectors.toList());
    }

    private SkillDto mapToSkillDto(Skill skill) {
        return modelMapper.map(skill, SkillDto.class);
    }
}