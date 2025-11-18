package com.hrmanagement.service;

import com.hrmanagement.model.Lesson;
import com.hrmanagement.model.User;
import com.hrmanagement.repository.LessonRepository;
import com.hrmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LessonService {

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

    public List<Lesson> getAllLessons() {
        User currentUser = getCurrentUser();
        // Teacher chỉ thấy bài học của mình, Student thấy tất cả
        if ("teacher".equals(currentUser.getRole())) {
            return lessonRepository.findByTeacher(currentUser);
        }
        return lessonRepository.findAllByOrderByCreatedAtDesc();
    }

    public Lesson getLessonById(Long id) {
        return lessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài học với ID: " + id));
    }

    public Lesson createLesson(Lesson lesson) {
        User currentUser = getCurrentUser();
        if (!"teacher".equals(currentUser.getRole()) && !"admin".equals(currentUser.getRole())) {
            throw new RuntimeException("Chỉ giáo viên mới được tạo bài học");
        }
        lesson.setTeacher(currentUser);
        return lessonRepository.save(lesson);
    }

    public Lesson updateLesson(Long id, Lesson lessonDetails) {
        User currentUser = getCurrentUser();
        Lesson existingLesson = lessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài học"));

        // Kiểm tra quyền
        if (!existingLesson.getTeacher().getId().equals(currentUser.getId()) && !"admin".equals(currentUser.getRole())) {
            throw new RuntimeException("Không có quyền cập nhật bài học này");
        }

        // Cập nhật các trường
        if (lessonDetails.getTitle() != null) existingLesson.setTitle(lessonDetails.getTitle());
        if (lessonDetails.getDescription() != null) existingLesson.setDescription(lessonDetails.getDescription());
        if (lessonDetails.getYoutubeUrl() != null) existingLesson.setYoutubeUrl(lessonDetails.getYoutubeUrl());
        if (lessonDetails.getTotalDuration() != null) existingLesson.setTotalDuration(lessonDetails.getTotalDuration());

        return lessonRepository.save(existingLesson);
    }

    public void deleteLesson(Long id) {
        User currentUser = getCurrentUser();
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài học"));

        if (!lesson.getTeacher().getId().equals(currentUser.getId()) && !"admin".equals(currentUser.getRole())) {
            throw new RuntimeException("Không có quyền xóa bài học này");
        }

        lessonRepository.delete(lesson);
    }
}

