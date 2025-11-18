package com.hrmanagement.repository;

import com.hrmanagement.model.Assignment;
import com.hrmanagement.model.AssignmentSubmission;
import com.hrmanagement.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, Long> {
    Optional<AssignmentSubmission> findByAssignmentAndStudent(Assignment assignment, User student);
    List<AssignmentSubmission> findByStudent(User student);
    List<AssignmentSubmission> findByAssignment(Assignment assignment);
}

