package com.hrmanagement.controller;

import com.hrmanagement.model.StudyTime;
import com.hrmanagement.service.StudyTimeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/student/study")
public class StudyTimeController {

    @Autowired
    private StudyTimeService studyTimeService;

    // POST /api/student/study/start - Start study session
    @PostMapping("/start")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<StudyTime> startStudy() {
        StudyTime studyTime = studyTimeService.startStudy();
        return ResponseEntity.ok(studyTime);
    }

    // POST /api/student/study/stop - Stop study session
    @PostMapping("/stop")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<StudyTime> stopStudy(@RequestBody Map<String, Integer> request) {
        Integer seconds = request.get("seconds");
        if (seconds == null || seconds < 0) {
            throw new RuntimeException("Số giây không hợp lệ. Nhận được: " + request);
        }
        try {
            StudyTime studyTime = studyTimeService.stopStudy(seconds);
            return ResponseEntity.ok(studyTime);
        } catch (Exception e) {
            System.err.println("Error in stopStudy: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi lưu thời gian học: " + e.getMessage(), e);
        }
    }

    // GET /api/student/study/stats - Get study statistics
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getStudyStats() {
        Map<String, Object> stats = studyTimeService.getStudyStats();
        return ResponseEntity.ok(stats);
    }
}
