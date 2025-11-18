package com.hrmanagement.controller;

import com.hrmanagement.service.RankingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ranking")
public class RankingController {

    @Autowired
    private RankingService rankingService;

    // GET /api/ranking/students - Get student ranking by stars
    @GetMapping("/students")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getStudentRanking() {
        List<Map<String, Object>> ranking = rankingService.getStudentRanking();
        return ResponseEntity.ok(ranking);
    }
}

