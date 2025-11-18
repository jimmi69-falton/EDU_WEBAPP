package com.hrmanagement.service;

import com.hrmanagement.model.Lesson;
import com.hrmanagement.model.LessonProgress;
import com.hrmanagement.model.User;
import com.hrmanagement.repository.LessonProgressRepository;
import com.hrmanagement.repository.LessonRepository;
import com.hrmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ProgressService {

    @Autowired
    private LessonProgressRepository progressRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }
        return userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với email: " + username));
    }

    public List<LessonProgress> getStudentProgress() {
        User currentUser = getCurrentUser();
        if (!"student".equalsIgnoreCase(currentUser.getRole())) {
            throw new RuntimeException("Chỉ học sinh mới có thể xem tiến trình của mình.");
        }
        return progressRepository.findByStudentId(currentUser.getId());
    }

    public LessonProgress getLessonProgress(Long lessonId) {
        User currentUser = getCurrentUser();
        if (!"student".equalsIgnoreCase(currentUser.getRole())) {
            throw new RuntimeException("Chỉ học sinh mới có thể xem tiến trình bài học.");
        }
        return progressRepository.findByLessonIdAndStudentId(lessonId, currentUser.getId())
                .orElse(null);
    }

    @Transactional
    public LessonProgress updateProgress(Long lessonId, LessonProgress progressData) {
        User currentUser = getCurrentUser();
        if (!"student".equalsIgnoreCase(currentUser.getRole())) {
            throw new RuntimeException("Chỉ học sinh mới có thể cập nhật tiến trình.");
        }

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài học với ID: " + lessonId));

        Optional<LessonProgress> existing = progressRepository.findByLessonIdAndStudentId(lessonId, currentUser.getId());

        LessonProgress progress;
        if (existing.isPresent()) {
            progress = existing.get();
            if (progressData.getVideoProgressSeconds() != null) {
                progress.setVideoProgressSeconds(progressData.getVideoProgressSeconds());
            }
            if (progressData.getQuizScore() != null) {
                progress.setQuizScore(progressData.getQuizScore());
            }
            if (progressData.getCompleted() != null) {
                progress.setCompleted(progressData.getCompleted());
            }
            if (progressData.getCheckpointsCompleted() != null) {
                progress.setCheckpointsCompleted(progressData.getCheckpointsCompleted());
            }
            if (progressData.getTotalCheckpoints() != null) {
                progress.setTotalCheckpoints(progressData.getTotalCheckpoints());
            }
        } else {
            progress = new LessonProgress();
            progress.setLesson(lesson);
            progress.setStudent(currentUser);
            progress.setVideoProgressSeconds(progressData.getVideoProgressSeconds() != null ? progressData.getVideoProgressSeconds() : 0);
            progress.setQuizScore(progressData.getQuizScore());
            progress.setCompleted(progressData.getCompleted() != null ? progressData.getCompleted() : false);
            progress.setCheckpointsCompleted(progressData.getCheckpointsCompleted() != null ? progressData.getCheckpointsCompleted() : 0);
            progress.setTotalCheckpoints(progressData.getTotalCheckpoints() != null ? progressData.getTotalCheckpoints() : 0);
        }

        return progressRepository.save(progress);
    }

    public List<LessonProgress> getLessonProgressForTeacher(Long lessonId) {
        User currentUser = getCurrentUser();
        if (!"teacher".equalsIgnoreCase(currentUser.getRole()) && !"admin".equalsIgnoreCase(currentUser.getRole())) {
            throw new RuntimeException("Chỉ giáo viên hoặc admin mới có thể xem tiến trình học sinh.");
        }

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài học với ID: " + lessonId));

        if (!lesson.getTeacher().getId().equals(currentUser.getId()) && !"admin".equalsIgnoreCase(currentUser.getRole())) {
            throw new RuntimeException("Bạn không có quyền xem tiến trình của bài học này.");
        }

        return progressRepository.findByLessonId(lessonId);
    }
}

