package com.hrmanagement.service;

import com.hrmanagement.model.FinalQuiz;
import com.hrmanagement.model.Lesson;
import com.hrmanagement.model.User;
import com.hrmanagement.repository.FinalQuizRepository;
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
public class QuizService {

    @Autowired
    private FinalQuizRepository quizRepository;

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

    public List<FinalQuiz> getQuizzesByLessonId(Long lessonId) {
        return quizRepository.findByLessonId(lessonId);
    }

    @Transactional
    public FinalQuiz createQuiz(Long lessonId, FinalQuiz quiz) {
        User currentUser = getCurrentUser();
        if (!"teacher".equalsIgnoreCase(currentUser.getRole()) && !"admin".equalsIgnoreCase(currentUser.getRole())) {
            throw new RuntimeException("Chỉ giáo viên hoặc admin mới có thể tạo quiz.");
        }

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài học với ID: " + lessonId));

        if (!lesson.getTeacher().getId().equals(currentUser.getId()) && !"admin".equalsIgnoreCase(currentUser.getRole())) {
            throw new RuntimeException("Bạn không có quyền thêm quiz vào bài học này.");
        }

        // Check if quiz already exists for this lesson
        Optional<FinalQuiz> existingQuiz = quizRepository.findByLessonId(lessonId).stream().findFirst();
        if (existingQuiz.isPresent()) {
            throw new RuntimeException("Bài học này đã có quiz. Vui lòng cập nhật quiz hiện có.");
        }

        quiz.setLesson(lesson);
        return quizRepository.save(quiz);
    }

    @Transactional
    public FinalQuiz updateQuiz(Long lessonId, Long quizId, FinalQuiz quizDetails) {
        User currentUser = getCurrentUser();
        FinalQuiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy quiz để cập nhật"));

        if (!quiz.getLesson().getId().equals(lessonId)) {
            throw new RuntimeException("Quiz không thuộc về bài học này.");
        }

        if (!quiz.getLesson().getTeacher().getId().equals(currentUser.getId()) && !"admin".equalsIgnoreCase(currentUser.getRole())) {
            throw new RuntimeException("Bạn không có quyền cập nhật quiz này.");
        }

        if (quizDetails.getQuestion() != null) quiz.setQuestion(quizDetails.getQuestion());
        if (quizDetails.getOptions() != null) quiz.setOptions(quizDetails.getOptions());
        if (quizDetails.getCorrectAnswer() != null) quiz.setCorrectAnswer(quizDetails.getCorrectAnswer());
        if (quizDetails.getExplanation() != null) quiz.setExplanation(quizDetails.getExplanation());
        if (quizDetails.getQuestionType() != null) quiz.setQuestionType(quizDetails.getQuestionType());

        return quizRepository.save(quiz);
    }

    @Transactional
    public void deleteQuiz(Long lessonId, Long quizId) {
        User currentUser = getCurrentUser();
        FinalQuiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy quiz để xóa"));

        if (!quiz.getLesson().getId().equals(lessonId)) {
            throw new RuntimeException("Quiz không thuộc về bài học này.");
        }

        if (!quiz.getLesson().getTeacher().getId().equals(currentUser.getId()) && !"admin".equalsIgnoreCase(currentUser.getRole())) {
            throw new RuntimeException("Bạn không có quyền xóa quiz này.");
        }

        quizRepository.delete(quiz);
    }
}
