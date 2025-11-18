package com.hrmanagement.repository;

import com.hrmanagement.model.Assignment;
import com.hrmanagement.model.AssignmentQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentQuestionRepository extends JpaRepository<AssignmentQuestion, Long> {
    List<AssignmentQuestion> findByAssignment(Assignment assignment);
    List<AssignmentQuestion> findByAssignmentIdOrderByOrderIndexAsc(Long assignmentId);
    void deleteByAssignment(Assignment assignment);
}

