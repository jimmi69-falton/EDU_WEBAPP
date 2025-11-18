package com.hrmanagement.controller;

import com.hrmanagement.model.Assignment;
import com.hrmanagement.model.AssignmentQuestion;
import com.hrmanagement.service.AssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AssignmentController {

    @Autowired
    private AssignmentService assignmentService;

    // GET /api/student/assignments - Get assignments for student
    @GetMapping("/student/assignments")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<List<Assignment>> getStudentAssignments() {
        List<Assignment> assignments = assignmentService.getStudentAssignments();
        return ResponseEntity.ok(assignments);
    }

    // GET /api/teacher/assignments - Get assignments for teacher
    @GetMapping("/teacher/assignments")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<List<Assignment>> getTeacherAssignments() {
        List<Assignment> assignments = assignmentService.getTeacherAssignments();
        return ResponseEntity.ok(assignments);
    }

    // POST /api/teacher/assignments - Create assignment (Teacher/Admin only)
    @PostMapping("/teacher/assignments")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<Assignment> createAssignment(@RequestBody Map<String, Object> request) {
        Assignment assignment = new Assignment();
        if (request.get("title") != null) assignment.setTitle((String) request.get("title"));
        if (request.get("description") != null) assignment.setDescription((String) request.get("description"));
        if (request.get("type") != null) assignment.setType((String) request.get("type"));
        if (request.get("deadline") != null) {
            try {
                assignment.setDeadline(java.time.LocalDate.parse((String) request.get("deadline")));
            } catch (Exception e) {
                // Handle date parsing error
            }
        }
        if (request.get("lesson") != null) {
            Map<String, Object> lessonMap = (Map<String, Object>) request.get("lesson");
            if (lessonMap.get("id") != null) {
                com.hrmanagement.model.Lesson lesson = new com.hrmanagement.model.Lesson();
                lesson.setId(Long.parseLong(lessonMap.get("id").toString()));
                assignment.setLesson(lesson);
            }
        }

        List<AssignmentQuestion> questions = null;
        if (request.get("questions") != null) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                List<Map<String, Object>> questionsList = (List<Map<String, Object>>) request.get("questions");
                questions = new java.util.ArrayList<>();
                for (Map<String, Object> qMap : questionsList) {
                    AssignmentQuestion q = new AssignmentQuestion();
                    if (qMap.get("question") != null) q.setQuestion(qMap.get("question").toString());
                    if (qMap.get("questionType") != null) q.setQuestionType(qMap.get("questionType").toString());
                    if (qMap.get("options") != null) {
                        if (qMap.get("options") instanceof String) {
                            q.setOptions(qMap.get("options").toString());
                        } else {
                            q.setOptions(mapper.writeValueAsString(qMap.get("options")));
                        }
                    }
                    if (qMap.get("correctAnswer") != null) q.setCorrectAnswer(qMap.get("correctAnswer").toString());
                    if (qMap.get("explanation") != null) q.setExplanation(qMap.get("explanation").toString());
                    questions.add(q);
                }
            } catch (Exception e) {
                throw new RuntimeException("Lỗi khi parse questions: " + e.getMessage(), e);
            }
        }

        Assignment newAssignment = assignmentService.createAssignment(assignment, questions);
        return ResponseEntity.ok(newAssignment);
    }

    // PUT /api/teacher/assignments/:id - Update assignment (Teacher/Admin only)
    @PutMapping("/teacher/assignments/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<Assignment> updateAssignment(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        Assignment assignmentDetails = new Assignment();
        if (request.get("title") != null) assignmentDetails.setTitle((String) request.get("title"));
        if (request.get("description") != null) assignmentDetails.setDescription((String) request.get("description"));
        if (request.get("type") != null) assignmentDetails.setType((String) request.get("type"));
        if (request.get("deadline") != null) {
            try {
                assignmentDetails.setDeadline(java.time.LocalDate.parse((String) request.get("deadline")));
            } catch (Exception e) {
                // Handle date parsing error
            }
        }
        if (request.get("lesson") != null) {
            Map<String, Object> lessonMap = (Map<String, Object>) request.get("lesson");
            if (lessonMap.get("id") != null) {
                com.hrmanagement.model.Lesson lesson = new com.hrmanagement.model.Lesson();
                lesson.setId(Long.parseLong(lessonMap.get("id").toString()));
                assignmentDetails.setLesson(lesson);
            }
        }

        List<AssignmentQuestion> questions = null;
        if (request.get("questions") != null) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                List<Map<String, Object>> questionsList = (List<Map<String, Object>>) request.get("questions");
                questions = new java.util.ArrayList<>();
                for (Map<String, Object> qMap : questionsList) {
                    AssignmentQuestion q = new AssignmentQuestion();
                    if (qMap.get("question") != null) q.setQuestion(qMap.get("question").toString());
                    if (qMap.get("questionType") != null) q.setQuestionType(qMap.get("questionType").toString());
                    if (qMap.get("options") != null) {
                        if (qMap.get("options") instanceof String) {
                            q.setOptions(qMap.get("options").toString());
                        } else {
                            q.setOptions(mapper.writeValueAsString(qMap.get("options")));
                        }
                    }
                    if (qMap.get("correctAnswer") != null) q.setCorrectAnswer(qMap.get("correctAnswer").toString());
                    if (qMap.get("explanation") != null) q.setExplanation(qMap.get("explanation").toString());
                    questions.add(q);
                }
            } catch (Exception e) {
                throw new RuntimeException("Lỗi khi parse questions: " + e.getMessage(), e);
            }
        }

        Assignment updatedAssignment = assignmentService.updateAssignment(id, assignmentDetails, questions);
        return ResponseEntity.ok(updatedAssignment);
    }

    // GET /api/assignments/:id/questions - Get questions for an assignment
    @GetMapping("/assignments/{id}/questions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AssignmentQuestion>> getAssignmentQuestions(@PathVariable Long id) {
        List<AssignmentQuestion> questions = assignmentService.getAssignmentQuestions(id);
        return ResponseEntity.ok(questions);
    }

    // DELETE /api/teacher/assignments/:id - Delete assignment (Teacher/Admin only)
    @DeleteMapping("/teacher/assignments/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<Void> deleteAssignment(@PathVariable Long id) {
        assignmentService.deleteAssignment(id);
        return ResponseEntity.noContent().build();
    }
}
