package com.hrmanagement.controller;

import com.hrmanagement.model.AssignmentSubmission;
import com.hrmanagement.service.AssignmentSubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/student/assignments")
public class AssignmentSubmissionController {

    @Autowired
    private AssignmentSubmissionService submissionService;

    // POST /api/student/assignments/:id/submit - Submit assignment
    @PostMapping("/{id}/submit")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<AssignmentSubmission> submitAssignment(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        AssignmentSubmission submission = new AssignmentSubmission();
        
        // Content sẽ là JSON string chứa answers: {"questionId": "answer", ...}
        if (request.get("answers") != null) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                submission.setContent(mapper.writeValueAsString(request.get("answers")));
            } catch (Exception e) {
                submission.setContent((String) request.get("answers"));
            }
        }
        
        AssignmentSubmission savedSubmission = submissionService.submitAssignment(id, submission);
        return ResponseEntity.ok(savedSubmission);
    }

    // GET /api/student/assignments/:id/submission - Get my submission
    @GetMapping("/{id}/submission")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<AssignmentSubmission> getMySubmission(@PathVariable Long id) {
        try {
            AssignmentSubmission submission = submissionService.getSubmissionByAssignment(id);
            return ResponseEntity.ok(submission);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

}

