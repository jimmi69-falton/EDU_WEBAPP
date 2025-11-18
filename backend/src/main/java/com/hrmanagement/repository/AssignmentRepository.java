package com.hrmanagement.repository;

import com.hrmanagement.model.Assignment;
import com.hrmanagement.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByTeacher(User teacher);
    List<Assignment> findByTeacherId(Long teacherId);
    List<Assignment> findByType(String type);
    List<Assignment> findAllByOrderByCreatedAtDesc();
}

