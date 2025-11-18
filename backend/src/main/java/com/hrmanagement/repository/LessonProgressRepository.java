package com.hrmanagement.repository;

import com.hrmanagement.model.Lesson;
import com.hrmanagement.model.LessonProgress;
import com.hrmanagement.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {
    Optional<LessonProgress> findByLessonAndStudent(Lesson lesson, User student);
    Optional<LessonProgress> findByLessonIdAndStudentId(Long lessonId, Long studentId);
    List<LessonProgress> findByStudent(User student);
    List<LessonProgress> findByStudentId(Long studentId);
    List<LessonProgress> findByLesson(Lesson lesson);
    List<LessonProgress> findByLessonId(Long lessonId);
}

