package com.hrmanagement.controller;

import com.hrmanagement.model.FinalQuiz;
import com.hrmanagement.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lessons")
public class QuizController {

    @Autowired
    private QuizService quizService;

    // GET /api/lessons/:id/quiz - Get quiz for a lesson
    @GetMapping("/{lessonId}/quiz")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<FinalQuiz>> getQuizByLessonId(@PathVariable Long lessonId) {
        List<FinalQuiz> quizzes = quizService.getQuizzesByLessonId(lessonId);
        return ResponseEntity.ok(quizzes);
    }

    // POST /api/lessons/:id/quiz - Create a quiz (Teacher/Admin only)
    @PostMapping("/{lessonId}/quiz")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<FinalQuiz> createQuiz(
            @PathVariable Long lessonId,
            @RequestBody FinalQuiz quiz) {
        FinalQuiz newQuiz = quizService.createQuiz(lessonId, quiz);
        return ResponseEntity.ok(newQuiz);
    }

    // PUT /api/lessons/:lessonId/quiz/:id - Update a quiz (Teacher/Admin only)
    @PutMapping("/{lessonId}/quiz/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<FinalQuiz> updateQuiz(
            @PathVariable Long lessonId,
            @PathVariable Long id,
            @RequestBody FinalQuiz quizDetails) {
        FinalQuiz updatedQuiz = quizService.updateQuiz(lessonId, id, quizDetails);
        return ResponseEntity.ok(updatedQuiz);
    }

    // DELETE /api/lessons/:lessonId/quiz/:id - Delete a quiz (Teacher/Admin only)
    @DeleteMapping("/{lessonId}/quiz/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<Void> deleteQuiz(
            @PathVariable Long lessonId,
            @PathVariable Long id) {
        quizService.deleteQuiz(lessonId, id);
        return ResponseEntity.noContent().build();
    }
}
