package com.hrmanagement.repository;

import com.hrmanagement.model.FinalQuiz;
import com.hrmanagement.model.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FinalQuizRepository extends JpaRepository<FinalQuiz, Long> {
    List<FinalQuiz> findByLesson(Lesson lesson);
    List<FinalQuiz> findByLessonId(Long lessonId);
}

