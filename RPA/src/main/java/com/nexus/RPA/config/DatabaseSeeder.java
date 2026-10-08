package com.nexus.RPA.config;

import com.nexus.RPA.dto.RpaDtos.StepDto;
import com.nexus.RPA.dto.RpaDtos.TemplateDto;
import com.nexus.RPA.service.TemplateService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final TemplateService templateService;

    public DatabaseSeeder(TemplateService templateService) {
        this.templateService = templateService;
    }

    @Override
    public void run(String... args) throws Exception {
        if (templateService.getAllTemplates().isEmpty()) {
            System.out.println("[+] Database is empty. Seeding default templates...");
            seedTauxRaccTemplate();
            seedBenchmarkTemplate();
        }

        try {
            templateService.getTemplateByName("PROC_MIG_UPLOAD");
        } catch (Exception e) {
            System.out.println("[+] Injecting missing Macro: PROC_MIG_UPLOAD...");
            seedMigUploadMacro();
        }
    }

    private void seedTauxRaccTemplate() {
        TemplateDto template = new TemplateDto();
        template.setName("Taux_Racc_Auto");
        List<StepDto> steps = new ArrayList<>();
        steps.add(createClickStep(0, 325, 357, 2.5));
        steps.add(createClickStep(1, 294, 416, 10.0));
        steps.add(createClickStep(2, 1178, 639, 1.2));
        steps.add(createClickStep(3, 1715, 179, 1.2));
        steps.add(createClickStep(4, 1719, 254, 4.0));
        steps.add(createClickStep(5, 80, 174, 4.0));
        steps.add(createClickStep(6, 770, 93, 2.0));
        steps.add(createActionStep(7, "TYPE_TOUT", 2.5));
        steps.add(createClickStep(8, 763, 152, 4.0));
        steps.add(createClickStep(9, 870, 93, 4.0));
        steps.add(createActionStep(10, "ENTER", 5.0));
        steps.add(createActionStep(11, "DOUBLE_CLICK", 2.0));
        steps.add(createActionStep(12, "ENTER", 16.0));
        steps.add(createActionStep(13, "WIN_UP", 1.5));
        steps.add(createActionStep(14, "ESC", 1.5));
        steps.add(createActionStep(15, "CTRL_HOME", 1.0));
        steps.add(createActionStep(16, "CTRL_A", 2.5));
        steps.add(createActionStep(17, "CTRL_C", 6.0));
        steps.add(createActionStep(18, "ALT_F4", 2.0));
        steps.add(createActionStep(19, "TYPE_N", 2.0));
        template.setSteps(steps);
        templateService.saveTemplate(template);
    }

    private void seedBenchmarkTemplate() {
        TemplateDto template = new TemplateDto();
        template.setName("Benchmark_Auto");
        List<StepDto> steps = new ArrayList<>();
        steps.add(createClickStep(0, 1110, 439, 9.0));
        steps.add(createClickStep(1, 72, 447, 2.5));
        steps.add(createClickStep(2, 1714, 174, 1.5));
        steps.add(createClickStep(3, 1744, 253, 3.0));
        steps.add(createClickStep(4, 101, 174, 3.0));
        steps.add(createClickStep(5, 721, 94, 2.0));
        steps.add(createActionStep(6, "TYPE_TOUT", 2.5));
        steps.add(createClickStep(7, 739, 148, 4.0));
        steps.add(createClickStep(8, 883, 93, 4.0));
        steps.add(createActionStep(9, "ENTER", 5.0));
        steps.add(createActionStep(10, "DOUBLE_CLICK", 2.0));
        steps.add(createActionStep(11, "ENTER", 16.0));
        steps.add(createActionStep(12, "WIN_UP", 1.5));
        steps.add(createActionStep(13, "ESC", 1.5));
        steps.add(createActionStep(14, "CTRL_HOME", 1.0));
        steps.add(createActionStep(15, "CTRL_A", 2.5));
        steps.add(createActionStep(16, "CTRL_C", 6.0));
        steps.add(createActionStep(17, "ALT_F4", 2.0));
        steps.add(createActionStep(18, "TYPE_N", 2.0));
        template.setSteps(steps);
        templateService.saveTemplate(template);
    }

    private void seedMigUploadMacro() {
        TemplateDto template = new TemplateDto();
        template.setName("PROC_MIG_UPLOAD");
        List<StepDto> steps = new ArrayList<>();

        // HADI HIYA L'ACTION JDIDA F L'BIDAYA
        steps.add(createActionStep(0, "OPEN_CHROME", 3.0));

        steps.add(createActionStep(1, "CTRL_L", 1.0));
        steps.add(createActionWithParamStep(2, "TYPE_TEXT", "https://mig-dashboard.kyntus.fr/", 1.0));
        steps.add(createActionStep(3, "ENTER", 6.0));
        steps.add(createActionWithParamStep(4, "TYPE_TEXT", "robot", 1.0));
        steps.add(createActionStep(5, "TAB", 1.0));
        steps.add(createActionWithParamStep(6, "TYPE_TEXT", "scraperrobot", 1.0));
        steps.add(createActionStep(7, "ENTER", 5.0));
        steps.add(createClickStep(8, 443, 438, 2.0));
        steps.add(createClickStep(9, 1612, 657, 2.0));
        steps.add(createActionStep(10, "TYPE_LAST_SAVED_FILE", 1.5));
        steps.add(createActionStep(11, "ENTER", 2.0));

        template.setSteps(steps);
        templateService.saveTemplate(template);
    }

    private StepDto createClickStep(int order, int x, int y, double delay) {
        StepDto step = new StepDto();
        step.setOrderIndex(order);
        step.setType("CLICK");
        step.setXCoordinate(x);
        step.setYCoordinate(y);
        step.setDelay(delay);
        return step;
    }

    private StepDto createActionStep(int order, String actionName, double delay) {
        StepDto step = new StepDto();
        step.setOrderIndex(order);
        step.setType("ACTION");
        step.setActionName(actionName);
        step.setDelay(delay);
        return step;
    }

    private StepDto createActionWithParamStep(int order, String actionName, String param, double delay) {
        StepDto step = new StepDto();
        step.setOrderIndex(order);
        step.setType("ACTION");
        step.setActionName(actionName);
        step.setParameter(param);
        step.setDelay(delay);
        return step;
    }
}