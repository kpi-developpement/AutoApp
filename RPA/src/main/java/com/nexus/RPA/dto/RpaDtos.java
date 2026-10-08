package com.nexus.RPA.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

public class RpaDtos {

    @Data
    public static class StepDto {
        private Integer orderIndex;
        private String type;

        @JsonProperty("xCoordinate")
        private Integer xCoordinate;

        @JsonProperty("yCoordinate")
        private Integer yCoordinate;

        private Double delay;
        private String actionName;

        // HADA L'CHAMP JDID
        private String parameter;
    }

    @Data
    public static class TemplateDto {
        private Long id;
        private String name;
        private List<StepDto> steps;
    }
}