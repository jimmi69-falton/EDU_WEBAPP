package com.hrmanagement.controller;

import com.hrmanagement.model.LessonCheckpoint;
import com.hrmanagement.service.CheckpointService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lessons")
public class CheckpointController {

    @Autowired
    private CheckpointService checkpointService;

    // GET /api/lessons/:id/checkpoints - Get all checkpoints for a lesson
    @GetMapping("/{lessonId}/checkpoints")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<LessonCheckpoint>> getCheckpointsByLessonId(@PathVariable Long lessonId) {
        List<LessonCheckpoint> checkpoints = checkpointService.getCheckpointsByLessonId(lessonId);
        return ResponseEntity.ok(checkpoints);
    }

    // POST /api/lessons/:id/checkpoints - Create a checkpoint (Teacher/Admin only)
    @PostMapping("/{lessonId}/checkpoints")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<LessonCheckpoint> createCheckpoint(
            @PathVariable Long lessonId,
            @RequestBody LessonCheckpoint checkpoint) {
        LessonCheckpoint newCheckpoint = checkpointService.createCheckpoint(lessonId, checkpoint);
        return ResponseEntity.ok(newCheckpoint);
    }

    // PUT /api/lessons/:lessonId/checkpoints/:id - Update a checkpoint (Teacher/Admin only)
    @PutMapping("/{lessonId}/checkpoints/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<LessonCheckpoint> updateCheckpoint(
            @PathVariable Long lessonId,
            @PathVariable Long id,
            @RequestBody LessonCheckpoint checkpointDetails) {
        LessonCheckpoint updatedCheckpoint = checkpointService.updateCheckpoint(lessonId, id, checkpointDetails);
        return ResponseEntity.ok(updatedCheckpoint);
    }

    // DELETE /api/lessons/:lessonId/checkpoints/:id - Delete a checkpoint (Teacher/Admin only)
    @DeleteMapping("/{lessonId}/checkpoints/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<Void> deleteCheckpoint(
            @PathVariable Long lessonId,
            @PathVariable Long id) {
        checkpointService.deleteCheckpoint(lessonId, id);
        return ResponseEntity.noContent().build();
    }
}
