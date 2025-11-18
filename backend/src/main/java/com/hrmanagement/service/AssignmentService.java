package com.hrmanagement.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hrmanagement.model.Assignment;
import com.hrmanagement.model.AssignmentQuestion;
import com.hrmanagement.model.Lesson;
import com.hrmanagement.model.User;
import com.hrmanagement.repository.AssignmentQuestionRepository;
import com.hrmanagement.repository.AssignmentRepository;
import com.hrmanagement.repository.LessonRepository;
import com.hrmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AssignmentService {

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private LessonRepository lessonRepository;

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

    public List<Assignment> getStudentAssignments() {
        User currentUser = getCurrentUser();
        if (!"student".equalsIgnoreCase(currentUser.getRole())) {
            throw new RuntimeException("Chỉ học sinh mới có thể xem bài tập của mình.");
        }
        return assignmentRepository.findAll(); // In real app, filter by student's class/lessons
    }

    public List<Assignment> getTeacherAssignments() {
        User currentUser = getCurrentUser();
        if (!"teacher".equalsIgnoreCase(currentUser.getRole()) && !"admin".equalsIgnoreCase(currentUser.getRole())) {
            throw new RuntimeException("Chỉ giáo viên hoặc admin mới có thể xem bài tập.");
        }
        return assignmentRepository.findByTeacherId(currentUser.getId());
    }

    @Transactional
    public Assignment createAssignment(Assignment assignment, List<AssignmentQuestion> questions) {
        User currentUser = getCurrentUser();
        if (!"teacher".equalsIgnoreCase(currentUser.getRole()) && !"admin".equalsIgnoreCase(currentUser.getRole())) {
            throw new RuntimeException("Chỉ giáo viên hoặc admin mới có thể tạo bài tập.");
        }

        assignment.setTeacher(currentUser);

        if (assignment.getLesson() != null && assignment.getLesson().getId() != null) {
            Lesson lesson = lessonRepository.findById(assignment.getLesson().getId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy bài học với ID: " + assignment.getLesson().getId()));
            assignment.setLesson(lesson);
        }

        Assignment savedAssignment = assignmentRepository.save(assignment);

        // Save questions
        if (questions != null && !questions.isEmpty()) {
            for (int i = 0; i < questions.size(); i++) {
                AssignmentQuestion question = questions.get(i);
                question.setAssignment(savedAssignment);
                question.setOrderIndex(i + 1);
                
                // Convert options array to JSON string if needed
                if (question.getOptions() != null && !question.getOptions().startsWith("[")) {
                    // If options is not JSON, assume it's a single string and wrap it
                    try {
                        List<String> optionsList = objectMapper.readValue(question.getOptions(), new TypeReference<List<String>>() {});
                        question.setOptions(objectMapper.writeValueAsString(optionsList));
                    } catch (Exception e) {
                        // If parsing fails, assume it's already a JSON string or handle accordingly
                    }
                }
                
                assignmentQuestionRepository.save(question);
            }
        }

        return savedAssignment;
    }

    @Transactional
    public Assignment updateAssignment(Long id, Assignment assignmentDetails, List<AssignmentQuestion> questions) {
        User currentUser = getCurrentUser();
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài tập để cập nhật"));

        if (!assignment.getTeacher().getId().equals(currentUser.getId()) && !"admin".equalsIgnoreCase(currentUser.getRole())) {
            throw new RuntimeException("Bạn không có quyền cập nhật bài tập này.");
        }

        if (assignmentDetails.getTitle() != null) assignment.setTitle(assignmentDetails.getTitle());
        if (assignmentDetails.getDescription() != null) assignment.setDescription(assignmentDetails.getDescription());
        if (assignmentDetails.getType() != null) assignment.setType(assignmentDetails.getType());
        if (assignmentDetails.getDeadline() != null) assignment.setDeadline(assignmentDetails.getDeadline());
        if (assignmentDetails.getLesson() != null && assignmentDetails.getLesson().getId() != null) {
            Lesson lesson = lessonRepository.findById(assignmentDetails.getLesson().getId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy bài học với ID: " + assignmentDetails.getLesson().getId()));
            assignment.setLesson(lesson);
        }

        Assignment savedAssignment = assignmentRepository.save(assignment);

        // Update questions: delete old ones and save new ones
        if (questions != null) {
            assignmentQuestionRepository.deleteByAssignment(savedAssignment);
            
            for (int i = 0; i < questions.size(); i++) {
                AssignmentQuestion question = questions.get(i);
                question.setAssignment(savedAssignment);
                question.setOrderIndex(i + 1);
                question.setId(null); // Ensure it's a new question
                
                // Convert options array to JSON string if needed
                if (question.getOptions() != null && !question.getOptions().startsWith("[")) {
                    try {
                        List<String> optionsList = objectMapper.readValue(question.getOptions(), new TypeReference<List<String>>() {});
                        question.setOptions(objectMapper.writeValueAsString(optionsList));
                    } catch (Exception e) {
                        // If parsing fails, assume it's already a JSON string
                    }
                }
                
                assignmentQuestionRepository.save(question);
            }
        }

        return savedAssignment;
    }

    public List<AssignmentQuestion> getAssignmentQuestions(Long assignmentId) {
        return assignmentQuestionRepository.findByAssignmentIdOrderByOrderIndexAsc(assignmentId);
    }

    @Transactional
    public void deleteAssignment(Long id) {
        User currentUser = getCurrentUser();
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài tập để xóa"));

        if (!assignment.getTeacher().getId().equals(currentUser.getId()) && !"admin".equalsIgnoreCase(currentUser.getRole())) {
            throw new RuntimeException("Bạn không có quyền xóa bài tập này.");
        }

        assignmentRepository.delete(assignment);
    }
}
