package com.hrmanagement.service;

import com.hrmanagement.model.Lesson;
import com.hrmanagement.model.LessonProgress;
import com.hrmanagement.model.User;
import com.hrmanagement.repository.LessonProgressRepository;
import com.hrmanagement.repository.LessonRepository;
import com.hrmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RankingService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LessonProgressRepository lessonProgressRepository;

    @Autowired
    private LessonRepository lessonRepository;

    /**
     * Tính toán số sao cho một học sinh dựa trên tiến trình học tập
     * Công thức: overallProgress / 5 (5% = 1 sao)
     */
    private int calculateStars(Long studentId) {
        List<LessonProgress> progressList = lessonProgressRepository.findByStudentId(studentId);
        
        if (progressList == null || progressList.isEmpty()) {
            return 0;
        }

        double totalProgress = 0;
        int count = 0;

        for (LessonProgress progress : progressList) {
            // Fetch lesson từ repository để tránh LAZY loading issue
            Long lessonId = progress.getLesson() != null ? progress.getLesson().getId() : null;
            if (lessonId == null) continue;
            
            Lesson lesson = lessonRepository.findById(lessonId).orElse(null);
            if (lesson == null) continue;

            double lessonProgress = 0;
            
            if (progress.getCompleted() != null && progress.getCompleted()) {
                lessonProgress = 100;
            } else if (progress.getVideoProgressSeconds() != null && lesson.getTotalDuration() != null && lesson.getTotalDuration() > 0) {
                // Tính progress từ video (50%), checkpoints (30%), quiz (20%)
                double videoProgress = ((double) progress.getVideoProgressSeconds() / lesson.getTotalDuration()) * 50;
                
                double checkpointProgress = 0;
                if (progress.getTotalCheckpoints() != null && progress.getTotalCheckpoints() > 0) {
                    checkpointProgress = ((double) progress.getCheckpointsCompleted() / progress.getTotalCheckpoints()) * 30;
                }
                
                double quizProgress = 0;
                if (progress.getQuizScore() != null) {
                    quizProgress = progress.getQuizScore() * 0.2;
                }
                
                lessonProgress = videoProgress + checkpointProgress + quizProgress;
            }
            
            totalProgress += lessonProgress;
            count++;
        }

        if (count == 0) return 0;
        
        double overallProgress = totalProgress / count;
        return (int) Math.floor(overallProgress / 5); // 5% = 1 sao
    }

    /**
     * Lấy bảng xếp hạng tất cả học sinh dựa trên số sao
     */
    public List<Map<String, Object>> getStudentRanking() {
        List<User> students = userRepository.findAll().stream()
                .filter(user -> "student".equalsIgnoreCase(user.getRole()))
                .collect(Collectors.toList());

        List<Map<String, Object>> ranking = new ArrayList<>();

        for (User student : students) {
            int stars = calculateStars(student.getId());
            
            Map<String, Object> studentRank = new HashMap<>();
            studentRank.put("id", student.getId());
            studentRank.put("name", student.getName());
            studentRank.put("email", student.getEmail());
            studentRank.put("stars", stars);
            
            ranking.add(studentRank);
        }

        // Sắp xếp theo số sao giảm dần
        ranking.sort((a, b) -> {
            Integer starsA = (Integer) a.get("stars");
            Integer starsB = (Integer) b.get("stars");
            return starsB.compareTo(starsA);
        });

        return ranking;
    }
}

