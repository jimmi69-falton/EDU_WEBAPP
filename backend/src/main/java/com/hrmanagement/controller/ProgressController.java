package com.hrmanagement.controller;

import com.hrmanagement.model.LessonProgress;
import com.hrmanagement.service.ProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ProgressController {

    @Autowired
    private ProgressService progressService;

    // GET /api/student/lessons/progress - Get all progress for student
    @GetMapping("/student/lessons/progress")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<List<LessonProgress>> getStudentProgress() {
        List<LessonProgress> progress = progressService.getStudentProgress();
        return ResponseEntity.ok(progress);
    }

    // GET /api/student/lessons/:id/progress - Get progress for a specific lesson
    @GetMapping("/student/lessons/{lessonId}/progress")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<LessonProgress> getLessonProgress(@PathVariable Long lessonId) {
        LessonProgress progress = progressService.getLessonProgress(lessonId);
        return ResponseEntity.ok(progress);
    }

    // POST /api/student/lessons/:id/progress - Update progress for a lesson
    @PostMapping("/student/lessons/{lessonId}/progress")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<LessonProgress> updateProgress(
            @PathVariable Long lessonId,
            @RequestBody LessonProgress progressData) {
        LessonProgress progress = progressService.updateProgress(lessonId, progressData);
        return ResponseEntity.ok(progress);
    }

    // GET /api/teacher/lessons/:id/progress - Get all student progress for a lesson (Teacher)
    @GetMapping("/teacher/lessons/{lessonId}/progress")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<List<LessonProgress>> getLessonProgressForTeacher(@PathVariable Long lessonId) {
        List<LessonProgress> progressList = progressService.getLessonProgressForTeacher(lessonId);
        return ResponseEntity.ok(progressList);
    }
}
