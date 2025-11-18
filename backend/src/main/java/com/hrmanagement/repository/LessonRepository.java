package com.hrmanagement.repository;

import com.hrmanagement.model.Lesson;
import com.hrmanagement.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByTeacher(User teacher);
    List<Lesson> findAllByOrderByCreatedAtDesc();
}

