package com.rms.service;

import com.rms.constants.ProposalStatus;
import com.rms.constants.RoleType;
import com.rms.dto.skills.CreateSkillDto;
import com.rms.dto.skills.ProposedSkillDto;
import com.rms.dto.skills.ProposedSkillUpdateDto;
import com.rms.dto.skills.SkillDto;
import com.rms.entity.ProposedSkill;
import com.rms.entity.Recruiter; // MODIFIED: Import Recruiter
import com.rms.entity.Skill;
import com.rms.entity.UserEntity;
import com.rms.repository.ProposedSkillRepository;
import com.rms.repository.RecruiterRepository; // MODIFIED: Import RecruiterRepository
import com.rms.repository.SkillRepository;
import com.rms.repository.UserRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SkillService {

    private final ProposedSkillRepository proposedSkillRepository;
    private final SkillRepository skillRepository;
    private final UserRepo userRepo;
    private final ModelMapper modelMapper;
    private final UserService userService;
    private final RecruiterRepository recruiterRepository;

    @Transactional
    public ProposedSkillDto proposeSkill(CreateSkillDto dto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!user.getRoles().contains(RoleType.RECRUITER)) {
            throw new RuntimeException("Only recruiters can propose skills");
        }

        userService.validateCompanyInfo(user);

        if (skillRepository.findByNameIgnoreCase(dto.getName()).isPresent()) {
            throw new RuntimeException("Skill already exists");
        }

        if (proposedSkillRepository.findByProposedByIdAndStatus(user.getId(), ProposalStatus.PENDING)
                .stream().anyMatch(ps -> ps.getName().equalsIgnoreCase(dto.getName()))) {
            throw new RuntimeException("Skill already proposed by you");
        }

        Recruiter recruiter = recruiterRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalStateException("Recruiter profile not found for user"));

        ProposedSkill proposedSkill = modelMapper.map(dto, ProposedSkill.class);
        proposedSkill.setProposedBy(user);
        proposedSkill.setCompanyName(recruiter.getCompany().getName());
        proposedSkill.setStatus(ProposalStatus.PENDING);
        proposedSkill = proposedSkillRepository.save(proposedSkill);
        return mapToProposedSkillDto(proposedSkill);
    }

    @Transactional
    public SkillDto createSkill(SkillDto dto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity admin = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!admin.getRoles().contains(RoleType.ADMIN)) {
            throw new RuntimeException("Only admins can create skills");
        }
        if (skillRepository.findByNameIgnoreCase(dto.getName()).isPresent()) {
            throw new RuntimeException("Skill already exists");
        }
        Skill skill = modelMapper.map(dto, Skill.class);
        skill = skillRepository.save(skill);
        return mapToSkillDto(skill);
    }

    @Transactional
    public ProposedSkillDto approveProposal(Long proposalId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity admin = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!admin.getRoles().contains(RoleType.ADMIN)) {
            throw new RuntimeException("Only admins can approve proposals");
        }
        ProposedSkill proposal = proposedSkillRepository.findById(proposalId)
                .orElseThrow(() -> new RuntimeException("Proposal not found"));
        if (!ProposalStatus.PENDING.equals(proposal.getStatus())) {
            throw new RuntimeException("Proposal is not pending");
        }
        Skill newSkill = Skill.builder()
                .name(proposal.getName())
                .build();
        skillRepository.save(newSkill);
        proposal.setStatus(ProposalStatus.APPROVED);
        proposedSkillRepository.save(proposal);
        return mapToProposedSkillDto(proposal);
    }

    // Admin rejects a proposal
    @Transactional
    public ProposedSkillDto rejectProposal(Long proposalId, ProposedSkillUpdateDto dto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity admin = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!admin.getRoles().contains(RoleType.ADMIN)) {
            throw new RuntimeException("Only admins can reject proposals");
        }
        ProposedSkill proposal = proposedSkillRepository.findById(proposalId)
                .orElseThrow(() -> new RuntimeException("Proposal not found"));
        if (!ProposalStatus.PENDING.equals(proposal.getStatus())) {
            throw new RuntimeException("Proposal is not pending");
        }
        if (dto.getStatus() != ProposalStatus.REJECTED || dto.getRejectionReason() == null || dto.getRejectionReason().trim().isEmpty()) {
            throw new RuntimeException("Rejection requires a reason");
        }
        proposal.setStatus(ProposalStatus.REJECTED);
        proposal.setRejectionReason(dto.getRejectionReason());
        proposedSkillRepository.save(proposal);
        return mapToProposedSkillDto(proposal);
    }

    public List<SkillDto> getAllSkills() {
        // ... (No changes needed) ...
        return skillRepository.findAllByOrderByName().stream()
                .map(this::mapToSkillDto)
                .collect(Collectors.toList());
    }

    public List<ProposedSkillDto> getPendingProposals() {
        return proposedSkillRepository.findByStatus(ProposalStatus.PENDING).stream()
                .map(this::mapToProposedSkillDto)
                .collect(Collectors.toList());
    }

    public List<ProposedSkillDto> getMyProposals() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return proposedSkillRepository.findByProposedByIdAndStatus(user.getId(), ProposalStatus.PENDING).stream()
                .map(this::mapToProposedSkillDto)
                .collect(Collectors.toList());
    }

    private SkillDto mapToSkillDto(Skill skill) {
        return modelMapper.map(skill, SkillDto.class);
    }

    private ProposedSkillDto mapToProposedSkillDto(ProposedSkill proposal) {
        ProposedSkillDto dto = modelMapper.map(proposal, ProposedSkillDto.class);
        dto.setProposedById(proposal.getProposedBy().getId());
        return dto;
    }
}