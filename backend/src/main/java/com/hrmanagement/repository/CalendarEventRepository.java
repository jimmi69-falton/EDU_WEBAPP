package com.hrmanagement.repository;

import com.hrmanagement.model.CalendarEvent;
import com.hrmanagement.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {
    List<CalendarEvent> findByUser(User user);
    List<CalendarEvent> findByUserId(Long userId);
    List<CalendarEvent> findByAdmin(User admin);
    List<CalendarEvent> findByAssignedTo(String assignedTo);
    List<CalendarEvent> findByUserIdOrAssignedTo(Long userId, String assignedTo);
    List<CalendarEvent> findByUserIdAndAssignedTo(Long userId, String assignedTo);
    List<CalendarEvent> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);
}

