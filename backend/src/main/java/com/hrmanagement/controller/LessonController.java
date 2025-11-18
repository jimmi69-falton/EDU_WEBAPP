package com.hrmanagement.controller;

import com.hrmanagement.model.Lesson;
import com.hrmanagement.service.LessonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lessons")
public class LessonController {

    @Autowired
    private LessonService lessonService;

    // GET /api/lessons - Lấy tất cả bài học (public cho student, filtered cho teacher)
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Lesson>> getAllLessons() {
        List<Lesson> lessons = lessonService.getAllLessons();
        return ResponseEntity.ok(lessons);
    }

    // GET /api/lessons/:id - Lấy bài học theo ID
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Lesson> getLessonById(@PathVariable Long id) {
        Lesson lesson = lessonService.getLessonById(id);
        return ResponseEntity.ok(lesson);
    }

    // POST /api/teacher/lessons - Tạo bài học mới (chỉ teacher)
    @PostMapping("/teacher")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<Lesson> createLesson(@RequestBody Lesson lesson) {
        Lesson newLesson = lessonService.createLesson(lesson);
        return ResponseEntity.ok(newLesson);
    }

    // PUT /api/teacher/lessons/:id - Cập nhật bài học (chỉ teacher)
    @PutMapping("/teacher/{id}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<Lesson> updateLesson(@PathVariable Long id, @RequestBody Lesson lessonDetails) {
        Lesson updatedLesson = lessonService.updateLesson(id, lessonDetails);
        return ResponseEntity.ok(updatedLesson);
    }

    // DELETE /api/teacher/lessons/:id - Xóa bài học (chỉ teacher)
    @DeleteMapping("/teacher/{id}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteLesson(@PathVariable Long id) {
        lessonService.deleteLesson(id);
        return ResponseEntity.noContent().build();
    }
}

