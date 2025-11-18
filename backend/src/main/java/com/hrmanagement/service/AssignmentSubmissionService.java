package com.hrmanagement.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hrmanagement.model.Assignment;
import com.hrmanagement.model.AssignmentQuestion;
import com.hrmanagement.model.AssignmentSubmission;
import com.hrmanagement.model.User;
import com.hrmanagement.repository.AssignmentQuestionRepository;
import com.hrmanagement.repository.AssignmentRepository;
import com.hrmanagement.repository.AssignmentSubmissionRepository;
import com.hrmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AssignmentSubmissionService {

    @Autowired
    private AssignmentSubmissionRepository submissionRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AssignmentQuestionRepository assignmentQuestionRepository;

    @Autowired
    private ObjectMapper objectMapper;

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

    @Transactional
    public AssignmentSubmission submitAssignment(Long assignmentId, AssignmentSubmission submission) {
        User currentUser = getCurrentUser();
        if (!"student".equals(currentUser.getRole())) {
            throw new RuntimeException("Chỉ học sinh mới được nộp bài");
        }

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy assignment"));

        // Kiểm tra xem đã nộp chưa
        Optional<AssignmentSubmission> existingSubmission = submissionRepository.findByAssignmentAndStudent(assignment, currentUser);
        AssignmentSubmission finalSubmission;
        
        if (existingSubmission.isPresent()) {
            // Cập nhật submission cũ
            finalSubmission = existingSubmission.get();
            finalSubmission.setContent(submission.getContent());
        } else {
            // Tạo submission mới
            finalSubmission = submission;
            finalSubmission.setAssignment(assignment);
            finalSubmission.setStudent(currentUser);
        }

        // Tự động chấm điểm cho MCQ
        try {
            List<AssignmentQuestion> questions = assignmentQuestionRepository.findByAssignmentIdOrderByOrderIndexAsc(assignmentId);
            if (questions != null && !questions.isEmpty() && submission.getContent() != null) {
                Map<String, String> answers = objectMapper.readValue(submission.getContent(), new TypeReference<Map<String, String>>() {});
                
                int correctCount = 0;
                int totalQuestions = questions.size();
                
                for (AssignmentQuestion question : questions) {
                    String questionId = question.getId().toString();
                    String studentAnswer = answers.get(questionId);
                    
                    if (studentAnswer != null && studentAnswer.equals(question.getCorrectAnswer())) {
                        correctCount++;
                    }
                }
                
                // Tính điểm: (số câu đúng / tổng số câu) * 10
                double score = (double) correctCount / totalQuestions * 10.0;
                finalSubmission.setScore(score);
            }
        } catch (Exception e) {
            // Nếu không parse được JSON hoặc có lỗi, không tự động chấm điểm
            // Giáo viên sẽ chấm thủ công
        }

        return submissionRepository.save(finalSubmission);
    }

    public AssignmentSubmission getSubmissionByAssignment(Long assignmentId) {
        User currentUser = getCurrentUser();
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy assignment"));

        return submissionRepository.findByAssignmentAndStudent(assignment, currentUser)
                .orElseThrow(() -> new RuntimeException("Chưa nộp bài cho assignment này"));
    }

    public List<AssignmentSubmission> getSubmissionsByAssignment(Long assignmentId) {
        User currentUser = getCurrentUser();
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy assignment"));

        // Kiểm tra quyền
        if (!assignment.getTeacher().getId().equals(currentUser.getId()) && !"admin".equals(currentUser.getRole())) {
            throw new RuntimeException("Chỉ giáo viên của assignment này mới được xem submissions");
        }

        return submissionRepository.findByAssignment(assignment);
    }

    public AssignmentSubmission gradeSubmission(Long submissionId, Double score) {
        User currentUser = getCurrentUser();
        AssignmentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy submission"));

        // Kiểm tra quyền
        if (!submission.getAssignment().getTeacher().getId().equals(currentUser.getId()) && !"admin".equals(currentUser.getRole())) {
            throw new RuntimeException("Chỉ giáo viên mới được chấm điểm");
        }

        submission.setScore(score);
        return submissionRepository.save(submission);
    }
}

