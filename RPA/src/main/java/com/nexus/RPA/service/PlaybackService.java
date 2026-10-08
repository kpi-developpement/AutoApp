package com.nexus.RPA.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexus.RPA.dto.RpaDtos.StepDto;
import com.nexus.RPA.dto.RpaDtos.TemplateDto;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.awt.datatransfer.Clipboard;
import java.awt.datatransfer.DataFlavor;
import java.awt.datatransfer.StringSelection;
import java.awt.event.InputEvent;
import java.awt.event.KeyEvent;
import java.io.File;
import java.io.FileWriter;
import java.util.ArrayList;
import java.util.List;

@Service
public class PlaybackService {

    private Robot robot;
    private volatile boolean isPlaying = false;
    private volatile boolean isPaused = false;
    private final TemplateService templateService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private String currentLoopFile = "";
    private String lastSavedFilePath = "";

    public PlaybackService(@Lazy TemplateService templateService) {
        this.templateService = templateService;
        try {
            this.robot = new Robot();
            this.robot.setAutoDelay(10);
        } catch (AWTException e) {
            System.err.println("Failed to initialize Robot: " + e.getMessage());
        }
    }

    public void pause() { if (isPlaying) this.isPaused = true; }
    public void resume() { if (isPlaying) this.isPaused = false; }
    public void stop() { this.isPlaying = false; this.isPaused = false; }

    public void playBatch(List<StepDto> steps, List<String> filePaths) {
        this.isPlaying = true;
        this.isPaused = false;
        if (!smartSleep(5000)) return;

        try {
            for (int i = 0; i < filePaths.size(); i++) {
                if (!isPlaying) break;
                String currentFile = filePaths.get(i);
                executeSteps(steps, currentFile);
                if (i < filePaths.size() - 1) {
                    if (!smartSleep(2000)) return;
                }
            }
        } finally {
            this.isPlaying = false;
            this.isPaused = false;
        }
    }

    public void play(List<StepDto> steps, boolean isSubroutine) {
        if (!isSubroutine) {
            this.isPlaying = true;
            this.isPaused = false;
            if (!smartSleep(5000)) return;
        }

        try {
            executeSteps(steps, null);
        } finally {
            if (!isSubroutine) {
                this.isPlaying = false;
                this.isPaused = false;
            }
        }
    }

    private void executeSteps(List<StepDto> steps, String currentFilePath) {
        for (int i = 0; i < steps.size(); i++) {
            if (!isPlaying) break;

            StepDto step = steps.get(i);
            long delayMs = (long) (step.getDelay() * 1000);
            if (!smartSleep(delayMs)) return;

            if (!isPlaying) break;

            if ("CLICK".equalsIgnoreCase(step.getType())) {
                robot.mouseMove(step.getXCoordinate(), step.getYCoordinate());
                robot.mousePress(InputEvent.BUTTON1_DOWN_MASK);
                smartSleep(50);
                robot.mouseRelease(InputEvent.BUTTON1_DOWN_MASK);
            }
            else if ("ACTION".equalsIgnoreCase(step.getType())) {
                String actionName = step.getActionName();

                if ("BROWSE_AND_INJECT_FILES".equals(actionName)) {
                    try {
                        JsonNode config = objectMapper.readTree(step.getParameter());
                        String mode = config.get("mode").asText();
                        JsonNode filesNode = config.get("files");

                        List<String> files = new ArrayList<>();
                        if (filesNode.isArray()) {
                            for (JsonNode fileNode : filesNode) {
                                if (fileNode.get("selected").asBoolean()) {
                                    files.add(fileNode.get("path").asText());
                                }
                            }
                        }

                        if ("ALL".equals(mode)) {
                            String allPaths = "\"" + String.join("\" \"", files) + "\"";
                            pasteText(allPaths);
                        }
                        else if ("LOOP".equals(mode)) {
                            List<StepDto> remainingSteps = steps.subList(i + 1, steps.size());
                            for (int f = 0; f < files.size(); f++) {
                                if (!isPlaying) break;
                                this.currentLoopFile = files.get(f);
                                executeSteps(remainingSteps, this.currentLoopFile);
                                if (f < files.size() - 1) smartSleep(1000);
                            }
                            break;
                        }
                    } catch (Exception e) {}
                }
                else if ("TYPE_CURRENT_FILE".equals(actionName)) {
                    if (currentFilePath != null) pasteText(currentFilePath);
                    else pasteText(this.currentLoopFile);
                }
                else if ("TYPE_LAST_SAVED_FILE".equals(actionName)) {
                    if (this.lastSavedFilePath != null && !this.lastSavedFilePath.isEmpty()) {
                        pasteText(this.lastSavedFilePath);
                    }
                }
                else if ("TYPE_TEXT".equals(actionName)) {
                    if (step.getParameter() != null) pasteText(step.getParameter());
                }
                else if ("SAVE_CLIPBOARD_TO_CSV".equals(actionName)) {
                    String folderPath = "C:\\Nexus_Data";
                    String fileName = "Extracted_Data.csv";

                    try {
                        if (step.getParameter() != null && step.getParameter().startsWith("{")) {
                            JsonNode config = objectMapper.readTree(step.getParameter());
                            if (config.has("folder") && !config.get("folder").asText().isEmpty()) {
                                folderPath = config.get("folder").asText();
                            }
                            if (config.has("filename") && !config.get("filename").asText().isEmpty()) {
                                fileName = config.get("filename").asText();
                            }
                        } else if (step.getParameter() != null && !step.getParameter().isEmpty()) {
                            fileName = step.getParameter();
                        }
                    } catch (Exception e) {}

                    saveClipboardToFile(folderPath, fileName);
                }
                else if (actionName != null && actionName.startsWith("CUSTOM_PROC_")) {
                    String templateName = actionName.replace("CUSTOM_PROC_", "");
                    try {
                        TemplateDto subTemplate = templateService.getTemplateByName(templateName);
                        play(subTemplate.getSteps(), true);
                    } catch (Exception e) {}
                }
                else {
                    executeSpecialAction(actionName);
                }
            }
        }
    }

    private boolean smartSleep(long milliseconds) {
        long elapsed = 0;
        long interval = 100;
        while (elapsed < milliseconds) {
            if (!isPlaying) return false;
            if (isPaused) {
                try { Thread.sleep(interval); } catch (InterruptedException e) {}
                continue;
            }
            try { Thread.sleep(interval); } catch (InterruptedException e) {}
            elapsed += interval;
        }
        return true;
    }

    private String safeGetClipboardData() {
        Clipboard clipboard = Toolkit.getDefaultToolkit().getSystemClipboard();
        for (int i = 0; i < 15; i++) {
            try {
                String data = (String) clipboard.getData(DataFlavor.stringFlavor);
                if (data != null && !data.trim().isEmpty()) {
                    return data;
                }
            } catch (Exception e) {}
            smartSleep(1200);
        }
        return "";
    }

    private void pasteText(String text) {
        try {
            StringSelection stringSelection = new StringSelection(text);
            Clipboard clipboard = Toolkit.getDefaultToolkit().getSystemClipboard();
            clipboard.setContents(stringSelection, null);

            smartSleep(300);

            robot.keyPress(KeyEvent.VK_CONTROL);
            smartSleep(50);
            robot.keyPress(KeyEvent.VK_V);
            smartSleep(100);
            robot.keyRelease(KeyEvent.VK_V);
            robot.keyRelease(KeyEvent.VK_CONTROL);
        } catch (Exception e) {
            System.err.println("Failed to paste text: " + e.getMessage());
        }
    }

    private void saveClipboardToFile(String folderPath, String customFileName) {
        try {
            String data = safeGetClipboardData();
            if (data == null || data.trim().isEmpty()) return;

            data = data.replace("\t", ";");

            File dir = new File(folderPath);
            if (!dir.exists()) dir.mkdirs();

            String fileName = customFileName;
            if (!fileName.endsWith(".csv")) fileName += ".csv";

            File file = new File(dir, fileName);
            FileWriter writer = new FileWriter(file);
            writer.write(data);
            writer.close();

            this.lastSavedFilePath = file.getAbsolutePath();

        } catch (Exception ex) {
            System.err.println("[-] Failed to save clipboard data: " + ex.getMessage());
        }
    }

    private void executeSpecialAction(String actionName) {
        if (actionName == null) return;
        switch (actionName.toUpperCase()) {
            case "OPEN_CHROME": // HADI HIYA L'ACTION JDIDA
                try {
                    Runtime.getRuntime().exec(new String[]{"cmd", "/c", "start chrome"});
                    smartSleep(3000); // Ntsnaw 3s bima t7el Chrome
                } catch (Exception e) {
                    System.err.println("Failed to open Chrome: " + e.getMessage());
                }
                break;
            case "CTRL_A":
                robot.keyPress(KeyEvent.VK_CONTROL); smartSleep(50);
                robot.keyPress(KeyEvent.VK_A); smartSleep(100);
                robot.keyRelease(KeyEvent.VK_A); robot.keyRelease(KeyEvent.VK_CONTROL);
                break;
            case "CTRL_C":
                try { Toolkit.getDefaultToolkit().getSystemClipboard().setContents(new StringSelection(""), null); } catch (Exception e) {}
                smartSleep(500);
                robot.keyPress(KeyEvent.VK_CONTROL); smartSleep(50);
                robot.keyPress(KeyEvent.VK_C); smartSleep(200);
                robot.keyRelease(KeyEvent.VK_C); robot.keyRelease(KeyEvent.VK_CONTROL);
                break;
            case "CTRL_V":
                robot.keyPress(KeyEvent.VK_CONTROL); smartSleep(50);
                robot.keyPress(KeyEvent.VK_V); smartSleep(100);
                robot.keyRelease(KeyEvent.VK_V); robot.keyRelease(KeyEvent.VK_CONTROL);
                break;
            case "CTRL_L":
                robot.keyPress(KeyEvent.VK_CONTROL); smartSleep(50);
                robot.keyPress(KeyEvent.VK_L); smartSleep(100);
                robot.keyRelease(KeyEvent.VK_L); robot.keyRelease(KeyEvent.VK_CONTROL);
                break;
            case "CTRL_HOME":
                robot.keyPress(KeyEvent.VK_CONTROL); smartSleep(50);
                robot.keyPress(KeyEvent.VK_HOME); smartSleep(100);
                robot.keyRelease(KeyEvent.VK_HOME); robot.keyRelease(KeyEvent.VK_CONTROL);
                break;
            case "TAB":
                robot.keyPress(KeyEvent.VK_TAB); smartSleep(100); robot.keyRelease(KeyEvent.VK_TAB);
                break;
            case "ENTER":
                robot.keyPress(KeyEvent.VK_ENTER); smartSleep(100); robot.keyRelease(KeyEvent.VK_ENTER);
                break;
            case "ESC":
                robot.keyPress(KeyEvent.VK_ESCAPE); smartSleep(100); robot.keyRelease(KeyEvent.VK_ESCAPE);
                break;
            case "WIN_UP":
                robot.keyPress(KeyEvent.VK_WINDOWS); smartSleep(50);
                robot.keyPress(KeyEvent.VK_UP); smartSleep(100);
                robot.keyRelease(KeyEvent.VK_UP); robot.keyRelease(KeyEvent.VK_WINDOWS);
                break;
            case "MAXIMIZE_WINDOW":
                robot.keyPress(KeyEvent.VK_ALT); smartSleep(50);
                robot.keyPress(KeyEvent.VK_SPACE); smartSleep(100);
                robot.keyRelease(KeyEvent.VK_SPACE); robot.keyRelease(KeyEvent.VK_ALT);
                smartSleep(300);
                robot.keyPress(KeyEvent.VK_X); smartSleep(100); robot.keyRelease(KeyEvent.VK_X);
                break;
            case "ALT_F4":
                robot.keyPress(KeyEvent.VK_ALT); smartSleep(50);
                robot.keyPress(KeyEvent.VK_F4); smartSleep(100);
                robot.keyRelease(KeyEvent.VK_F4); robot.keyRelease(KeyEvent.VK_ALT);
                break;
            case "TYPE_N":
                robot.keyPress(KeyEvent.VK_N); smartSleep(100); robot.keyRelease(KeyEvent.VK_N);
                break;
            case "DOUBLE_CLICK":
                robot.mousePress(InputEvent.BUTTON1_DOWN_MASK); robot.mouseRelease(InputEvent.BUTTON1_DOWN_MASK);
                smartSleep(100);
                robot.mousePress(InputEvent.BUTTON1_DOWN_MASK); robot.mouseRelease(InputEvent.BUTTON1_DOWN_MASK);
                break;
            case "PROC_OPEN_DOWNLOAD":
                robot.keyPress(KeyEvent.VK_CONTROL); robot.keyPress(KeyEvent.VK_J);
                robot.keyRelease(KeyEvent.VK_J); robot.keyRelease(KeyEvent.VK_CONTROL);
                smartSleep(2000);
                robot.keyPress(KeyEvent.VK_ENTER); robot.keyRelease(KeyEvent.VK_ENTER);
                break;
            case "PROC_EXTRACT_EXCEL":
                robot.keyPress(KeyEvent.VK_WINDOWS); robot.keyPress(KeyEvent.VK_UP);
                robot.keyRelease(KeyEvent.VK_UP); robot.keyRelease(KeyEvent.VK_WINDOWS);
                smartSleep(1500);
                robot.keyPress(KeyEvent.VK_ESCAPE); robot.keyRelease(KeyEvent.VK_ESCAPE);
                smartSleep(1000);
                robot.keyPress(KeyEvent.VK_CONTROL); robot.keyPress(KeyEvent.VK_HOME);
                robot.keyRelease(KeyEvent.VK_HOME); robot.keyRelease(KeyEvent.VK_CONTROL);
                smartSleep(1000);
                robot.keyPress(KeyEvent.VK_CONTROL); robot.keyPress(KeyEvent.VK_A);
                robot.keyRelease(KeyEvent.VK_A); robot.keyRelease(KeyEvent.VK_CONTROL);
                smartSleep(1500);
                robot.keyPress(KeyEvent.VK_CONTROL); robot.keyPress(KeyEvent.VK_C);
                robot.keyRelease(KeyEvent.VK_C); robot.keyRelease(KeyEvent.VK_CONTROL);
                smartSleep(5000);
                robot.keyPress(KeyEvent.VK_ALT); robot.keyPress(KeyEvent.VK_F4);
                robot.keyRelease(KeyEvent.VK_F4); robot.keyRelease(KeyEvent.VK_ALT);
                smartSleep(1500);
                robot.keyPress(KeyEvent.VK_N); robot.keyRelease(KeyEvent.VK_N);
                break;
            case "PROC_CLEAR_CACHE":
                robot.keyPress(KeyEvent.VK_CONTROL); robot.keyPress(KeyEvent.VK_SHIFT); robot.keyPress(KeyEvent.VK_DELETE);
                robot.keyRelease(KeyEvent.VK_DELETE); robot.keyRelease(KeyEvent.VK_SHIFT); robot.keyRelease(KeyEvent.VK_CONTROL);
                smartSleep(2000);
                robot.keyPress(KeyEvent.VK_ENTER); robot.keyRelease(KeyEvent.VK_ENTER);
                break;
            case "PROC_SAVE_AS_PDF":
                robot.keyPress(KeyEvent.VK_CONTROL); robot.keyPress(KeyEvent.VK_P);
                robot.keyRelease(KeyEvent.VK_P); robot.keyRelease(KeyEvent.VK_CONTROL);
                smartSleep(2000);
                robot.keyPress(KeyEvent.VK_ENTER); robot.keyRelease(KeyEvent.VK_ENTER);
                break;
            case "PROC_HARD_RELOAD":
                robot.keyPress(KeyEvent.VK_CONTROL); robot.keyPress(KeyEvent.VK_F5);
                robot.keyRelease(KeyEvent.VK_F5); robot.keyRelease(KeyEvent.VK_CONTROL);
                break;
        }
    }
}