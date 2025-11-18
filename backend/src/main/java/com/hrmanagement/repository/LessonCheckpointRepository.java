package com.hrmanagement.repository;

import com.hrmanagement.model.Lesson;
import com.hrmanagement.model.LessonCheckpoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonCheckpointRepository extends JpaRepository<LessonCheckpoint, Long> {
    List<LessonCheckpoint> findByLessonOrderByTimeInSecondsAsc(Lesson lesson);
    List<LessonCheckpoint> findByLessonId(Long lessonId);
}

