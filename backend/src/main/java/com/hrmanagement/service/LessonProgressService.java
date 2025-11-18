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

import java.util.List;
import java.util.Optional;

@Service
public class LessonProgressService {

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

    public List<LessonProgress> getAllProgressForStudent() {
        User currentUser = getCurrentUser();
        if (!"student".equals(currentUser.getRole())) {
            throw new RuntimeException("Chỉ học sinh mới được xem tiến trình của mình");
        }
        return progressRepository.findByStudent(currentUser);
    }

    public LessonProgress getProgressByLesson(Long lessonId) {
        User currentUser = getCurrentUser();
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài học"));

        Optional<LessonProgress> progressOpt = progressRepository.findByLessonAndStudent(lesson, currentUser);
        if (progressOpt.isPresent()) {
            return progressOpt.get();
        }

        // Tạo progress mới nếu chưa có
        LessonProgress newProgress = new LessonProgress();
        newProgress.setLesson(lesson);
        newProgress.setStudent(currentUser);
        newProgress.setVideoProgressSeconds(0);
        newProgress.setQuizScore(0.0);
        newProgress.setCompleted(false);
        newProgress.setCheckpointsCompleted(0);
        newProgress.setTotalCheckpoints(0);
        return progressRepository.save(newProgress);
    }

    public LessonProgress updateProgress(Long lessonId, LessonProgress progressDetails) {
        User currentUser = getCurrentUser();
        if (!"student".equals(currentUser.getRole())) {
            throw new RuntimeException("Chỉ học sinh mới được cập nhật tiến trình");
        }

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài học"));

        Optional<LessonProgress> progressOpt = progressRepository.findByLessonAndStudent(lesson, currentUser);
        LessonProgress progress;

        if (progressOpt.isPresent()) {
            progress = progressOpt.get();
        } else {
            progress = new LessonProgress();
            progress.setLesson(lesson);
            progress.setStudent(currentUser);
        }

        // Cập nhật các trường
        if (progressDetails.getVideoProgressSeconds() != null) {
            progress.setVideoProgressSeconds(progressDetails.getVideoProgressSeconds());
        }
        if (progressDetails.getQuizScore() != null) {
            progress.setQuizScore(progressDetails.getQuizScore());
        }
        if (progressDetails.getCompleted() != null) {
            progress.setCompleted(progressDetails.getCompleted());
        }
        if (progressDetails.getCheckpointsCompleted() != null) {
            progress.setCheckpointsCompleted(progressDetails.getCheckpointsCompleted());
        }
        if (progressDetails.getTotalCheckpoints() != null) {
            progress.setTotalCheckpoints(progressDetails.getTotalCheckpoints());
        }

        return progressRepository.save(progress);
    }

    public List<LessonProgress> getProgressByLessonForTeacher(Long lessonId) {
        User currentUser = getCurrentUser();
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài học"));

        // Kiểm tra quyền
        if (!lesson.getTeacher().getId().equals(currentUser.getId()) && !"admin".equals(currentUser.getRole())) {
            throw new RuntimeException("Chỉ giáo viên của bài học này mới được xem tiến trình học sinh");
        }

        return progressRepository.findByLesson(lesson);
    }
}

