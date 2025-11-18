package com.hrmanagement.controller;

import com.hrmanagement.model.AssignmentSubmission;
import com.hrmanagement.service.AssignmentSubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teacher/assignments")
public class AssignmentSubmissionTeacherController {

    @Autowired
    private AssignmentSubmissionService submissionService;

    // GET /api/teacher/assignments/:id/submissions - Get all submissions for an assignment (Teacher only)
    @GetMapping("/{id}/submissions")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<List<AssignmentSubmission>> getSubmissions(@PathVariable Long id) {
        List<AssignmentSubmission> submissions = submissionService.getSubmissionsByAssignment(id);
        return ResponseEntity.ok(submissions);
    }

    // PUT /api/teacher/submissions/:id/grade - Grade a submission (Teacher only)
    @PutMapping("/submissions/{id}/grade")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<AssignmentSubmission> gradeSubmission(
            @PathVariable Long id,
            @RequestBody Map<String, Double> request) {
        Double score = request.get("score");
        AssignmentSubmission graded = submissionService.gradeSubmission(id, score);
        return ResponseEntity.ok(graded);
    }
}

