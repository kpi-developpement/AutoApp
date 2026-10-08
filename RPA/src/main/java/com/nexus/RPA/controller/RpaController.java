package com.nexus.RPA.controller;

import com.nexus.RPA.dto.RpaDtos.StepDto;
import com.nexus.RPA.dto.RpaDtos.TemplateDto;
import com.nexus.RPA.service.PlaybackService;
import com.nexus.RPA.service.RecordingService;
import com.nexus.RPA.service.TemplateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.awt.Point;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/v1/rpa")
@CrossOrigin(origins = "*")
public class RpaController {

    private final RecordingService recordingService;
    private final PlaybackService playbackService;
    private final TemplateService templateService;

    public RpaController(RecordingService recordingService, PlaybackService playbackService, TemplateService templateService) {
        this.recordingService = recordingService;
        this.playbackService = playbackService;
        this.templateService = templateService;
    }

    @PostMapping("/record/start")
    public ResponseEntity<String> startRecording() {
        recordingService.startRecording();
        return ResponseEntity.ok("Recording started");
    }

    @PostMapping("/record/stop")
    public ResponseEntity<List<StepDto>> stopRecording() {
        return ResponseEntity.ok(recordingService.stopRecording());
    }

    @GetMapping("/record/single-click")
    public ResponseEntity<Map<String, Integer>> captureSingleClick() throws ExecutionException, InterruptedException {
        Point p = recordingService.captureSingleClick().get();
        return ResponseEntity.ok(Map.of("x", p.x, "y", p.y));
    }

    @PostMapping("/templates")
    public ResponseEntity<TemplateDto> saveTemplate(@RequestBody TemplateDto templateDto) {
        return ResponseEntity.ok(templateService.saveTemplate(templateDto));
    }

    @GetMapping("/templates")
    public ResponseEntity<List<TemplateDto>> getTemplates() {
        return ResponseEntity.ok(templateService.getAllTemplates());
    }

    // HADA HOWA L'ENDPOINT DYAL DELETE LI KAN NASS9
    @DeleteMapping("/templates/{id}")
    public ResponseEntity<String> deleteTemplate(@PathVariable Long id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.ok("Template deleted successfully");
    }

    @PostMapping("/play/{templateName}")
    public ResponseEntity<String> playTemplate(@PathVariable String templateName) {
        TemplateDto template = templateService.getTemplateByName(templateName);
        new Thread(() -> playbackService.play(template.getSteps(), false)).start();
        return ResponseEntity.ok("Playback initiated");
    }

    @PostMapping("/play/batch/{templateName}")
    public ResponseEntity<String> playBatchTemplate(@PathVariable String templateName, @RequestBody List<String> filePaths) {
        TemplateDto template = templateService.getTemplateByName(templateName);
        new Thread(() -> playbackService.playBatch(template.getSteps(), filePaths)).start();
        return ResponseEntity.ok("Batch Playback initiated");
    }

    @PostMapping("/play/pause")
    public ResponseEntity<String> pausePlayback() {
        playbackService.pause();
        return ResponseEntity.ok("Paused");
    }

    @PostMapping("/play/resume")
    public ResponseEntity<String> resumePlayback() {
        playbackService.resume();
        return ResponseEntity.ok("Resumed");
    }

    @PostMapping("/play/stop")
    public ResponseEntity<String> stopPlayback() {
        playbackService.stop();
        return ResponseEntity.ok("Stopped");
    }
}