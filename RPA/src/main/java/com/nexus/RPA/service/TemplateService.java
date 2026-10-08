package com.nexus.RPA.service;

import com.nexus.RPA.dto.RpaDtos.StepDto;
import com.nexus.RPA.dto.RpaDtos.TemplateDto;
import com.nexus.RPA.entity.StepEntity;
import com.nexus.RPA.entity.TemplateEntity;
import com.nexus.RPA.repository.TemplateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TemplateService {

    private final TemplateRepository templateRepository;

    public TemplateService(TemplateRepository templateRepository) {
        this.templateRepository = templateRepository;
    }

    @Transactional
    public TemplateDto saveTemplate(TemplateDto dto) {
        TemplateEntity entity = templateRepository.findByName(dto.getName()).orElse(new TemplateEntity());
        entity.setName(dto.getName());

        if (entity.getSteps() != null) {
            entity.getSteps().clear();
        }

        List<StepEntity> stepEntities = dto.getSteps().stream().map(stepDto -> {
            StepEntity step = new StepEntity();
            step.setOrderIndex(stepDto.getOrderIndex());
            step.setType(stepDto.getType());
            step.setXCoordinate(stepDto.getXCoordinate());
            step.setYCoordinate(stepDto.getYCoordinate());
            step.setDelay(stepDto.getDelay());
            step.setActionName(stepDto.getActionName());
            step.setParameter(stepDto.getParameter());
            return step;
        }).collect(Collectors.toList());

        entity.getSteps().addAll(stepEntities);
        TemplateEntity saved = templateRepository.save(entity);
        dto.setId(saved.getId());
        return dto;
    }

    public List<TemplateDto> getAllTemplates() {
        return templateRepository.findAll().stream().map(entity -> {
            TemplateDto dto = new TemplateDto();
            dto.setId(entity.getId());
            dto.setName(entity.getName());

            List<StepDto> stepDtos = entity.getSteps().stream().map(step -> {
                StepDto sDto = new StepDto();
                sDto.setOrderIndex(step.getOrderIndex());
                sDto.setType(step.getType());
                sDto.setXCoordinate(step.getXCoordinate());
                sDto.setYCoordinate(step.getYCoordinate());
                sDto.setDelay(step.getDelay());
                sDto.setActionName(step.getActionName());
                sDto.setParameter(step.getParameter());
                return sDto;
            }).collect(Collectors.toList());

            dto.setSteps(stepDtos);
            return dto;
        }).collect(Collectors.toList());
    }

    public TemplateDto getTemplateByName(String name) {
        return getAllTemplates().stream()
                .filter(t -> t.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Template not found: " + name));
    }

    // HADI HIYA L'FONCTION JDIDA DYAL DELETE
    @Transactional
    public void deleteTemplate(Long id) {
        templateRepository.deleteById(id);
    }
}