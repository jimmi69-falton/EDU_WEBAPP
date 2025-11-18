package com.hrmanagement.repository;

import com.hrmanagement.model.StudyTime;
import com.hrmanagement.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudyTimeRepository extends JpaRepository<StudyTime, Long> {
    Optional<StudyTime> findByStudentAndDate(User student, LocalDate date);
    Optional<StudyTime> findByStudentIdAndDate(Long studentId, LocalDate date);
    List<StudyTime> findByStudentOrderByDateDesc(User student);
    List<StudyTime> findByStudentId(Long studentId);
    List<StudyTime> findByStudentIdAndDateBetween(Long studentId, LocalDate startDate, LocalDate endDate);
}

