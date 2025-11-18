package com.hrmanagement.service;

import com.hrmanagement.model.Lesson;
import com.hrmanagement.model.LessonCheckpoint;
import com.hrmanagement.model.User;
import com.hrmanagement.repository.LessonCheckpointRepository;
import com.hrmanagement.repository.LessonRepository;
import com.hrmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CheckpointService {

    @Autowired
    private LessonCheckpointRepository checkpointRepository;

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

    public List<LessonCheckpoint> getCheckpointsByLessonId(Long lessonId) {
        return checkpointRepository.findByLessonId(lessonId);
    }

    @Transactional
    public LessonCheckpoint createCheckpoint(Long lessonId, LessonCheckpoint checkpoint) {
        User currentUser = getCurrentUser();
        if (!"teacher".equalsIgnoreCase(currentUser.getRole()) && !"admin".equalsIgnoreCase(currentUser.getRole())) {
            throw new RuntimeException("Chỉ giáo viên hoặc admin mới có thể tạo checkpoint.");
        }

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài học với ID: " + lessonId));

        if (!lesson.getTeacher().getId().equals(currentUser.getId()) && !"admin".equalsIgnoreCase(currentUser.getRole())) {
            throw new RuntimeException("Bạn không có quyền thêm checkpoint vào bài học này.");
        }

        checkpoint.setLesson(lesson);
        return checkpointRepository.save(checkpoint);
    }

    @Transactional
    public LessonCheckpoint updateCheckpoint(Long lessonId, Long checkpointId, LessonCheckpoint checkpointDetails) {
        User currentUser = getCurrentUser();
        LessonCheckpoint checkpoint = checkpointRepository.findById(checkpointId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy checkpoint để cập nhật"));

        if (!checkpoint.getLesson().getId().equals(lessonId)) {
            throw new RuntimeException("Checkpoint không thuộc về bài học này.");
        }

        if (!checkpoint.getLesson().getTeacher().getId().equals(currentUser.getId()) && !"admin".equalsIgnoreCase(currentUser.getRole())) {
            throw new RuntimeException("Bạn không có quyền cập nhật checkpoint này.");
        }

        if (checkpointDetails.getQuestion() != null) checkpoint.setQuestion(checkpointDetails.getQuestion());
        if (checkpointDetails.getOptions() != null) checkpoint.setOptions(checkpointDetails.getOptions());
        if (checkpointDetails.getCorrectAnswer() != null) checkpoint.setCorrectAnswer(checkpointDetails.getCorrectAnswer());
        if (checkpointDetails.getExplanation() != null) checkpoint.setExplanation(checkpointDetails.getExplanation());
        if (checkpointDetails.getQuestionType() != null) checkpoint.setQuestionType(checkpointDetails.getQuestionType());
        if (checkpointDetails.getTimeInSeconds() != null) checkpoint.setTimeInSeconds(checkpointDetails.getTimeInSeconds());

        return checkpointRepository.save(checkpoint);
    }

    @Transactional
    public void deleteCheckpoint(Long lessonId, Long checkpointId) {
        User currentUser = getCurrentUser();
        LessonCheckpoint checkpoint = checkpointRepository.findById(checkpointId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy checkpoint để xóa"));

        if (!checkpoint.getLesson().getId().equals(lessonId)) {
            throw new RuntimeException("Checkpoint không thuộc về bài học này.");
        }

        if (!checkpoint.getLesson().getTeacher().getId().equals(currentUser.getId()) && !"admin".equalsIgnoreCase(currentUser.getRole())) {
            throw new RuntimeException("Bạn không có quyền xóa checkpoint này.");
        }

        checkpointRepository.delete(checkpoint);
    }
}
