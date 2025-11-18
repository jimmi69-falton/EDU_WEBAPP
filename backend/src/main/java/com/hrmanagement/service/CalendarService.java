package com.hrmanagement.service;

import com.hrmanagement.model.CalendarEvent;
import com.hrmanagement.model.User;
import com.hrmanagement.repository.CalendarEventRepository;
import com.hrmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CalendarService {

    @Autowired
    private CalendarEventRepository calendarEventRepository;

    @Autowired
    private UserRepository userRepository;

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

    public List<CalendarEvent> getAllEvents() {
        User currentUser = getCurrentUser();
        
        // Students see their personal events + events assigned to "all" (from teachers/admins)
        // Query: (user_id = student.id) OR (assignedTo = "all")
        // This means: student's personal events + all common events (regardless of who created them)
        if ("student".equalsIgnoreCase(currentUser.getRole())) {
            return calendarEventRepository.findByUserIdOrAssignedTo(currentUser.getId(), "all");
        }
        
        // Teachers see their events + events assigned to "all"
        // Query: (user_id = teacher.id) OR (assignedTo = "all")
        // This means: teacher's events (both personal and common they created) + all common events
        if ("teacher".equalsIgnoreCase(currentUser.getRole())) {
            return calendarEventRepository.findByUserIdOrAssignedTo(currentUser.getId(), "all");
        }
        
        // Admins see all events
        return calendarEventRepository.findAll();
    }

    @Transactional
    public CalendarEvent createEvent(CalendarEvent event) {
        User currentUser = getCurrentUser();
        
        // Students can only create personal events
        if ("student".equalsIgnoreCase(currentUser.getRole())) {
            event.setUser(currentUser);
            event.setAssignedTo("user"); // Force to personal
            return calendarEventRepository.save(event);
        }
        
        // Teachers can create events for all students (assignedTo="all") or personal
        if ("teacher".equalsIgnoreCase(currentUser.getRole())) {
            event.setUser(currentUser);
            // If assignedTo is "all", all students will see it
            // If assignedTo is "user" or null, it's personal
            if (event.getAssignedTo() == null || event.getAssignedTo().isEmpty()) {
                event.setAssignedTo("user"); // Default to personal
            }
            return calendarEventRepository.save(event);
        }
        
        // Admins can create events for anyone
        if ("admin".equalsIgnoreCase(currentUser.getRole())) {
            if (event.getUser() == null) {
                event.setUser(currentUser);
            }
            // Admin can set assignedTo to "all" for system-wide events
            if (event.getAssignedTo() == null || event.getAssignedTo().isEmpty()) {
                event.setAssignedTo("all"); // Default to all for admin
            }
            return calendarEventRepository.save(event);
        }
        
        throw new RuntimeException("Không có quyền tạo sự kiện.");
    }

    @Transactional
    public CalendarEvent updateEvent(Long id, CalendarEvent eventDetails) {
        User currentUser = getCurrentUser();
        CalendarEvent event = calendarEventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sự kiện để cập nhật"));

        // Check permissions
        if (!event.getUser().getId().equals(currentUser.getId()) && !"admin".equalsIgnoreCase(currentUser.getRole())) {
            throw new RuntimeException("Bạn không có quyền cập nhật sự kiện này.");
        }

        if (eventDetails.getTitle() != null) event.setTitle(eventDetails.getTitle());
        if (eventDetails.getDescription() != null) event.setDescription(eventDetails.getDescription());
        if (eventDetails.getStartTime() != null) event.setStartTime(eventDetails.getStartTime());
        if (eventDetails.getEndTime() != null) event.setEndTime(eventDetails.getEndTime());
        // Only teacher and admin can change assignedTo
        if (eventDetails.getAssignedTo() != null && ("admin".equalsIgnoreCase(currentUser.getRole()) || "teacher".equalsIgnoreCase(currentUser.getRole()))) {
            // Teacher can only set to "all" or "user", admin can set anything
            if ("teacher".equalsIgnoreCase(currentUser.getRole())) {
                if ("all".equals(eventDetails.getAssignedTo()) || "user".equals(eventDetails.getAssignedTo())) {
                    event.setAssignedTo(eventDetails.getAssignedTo());
                }
            } else {
                event.setAssignedTo(eventDetails.getAssignedTo());
            }
        }

        return calendarEventRepository.save(event);
    }

    @Transactional
    public void deleteEvent(Long id) {
        User currentUser = getCurrentUser();
        CalendarEvent event = calendarEventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sự kiện để xóa"));

        if (!event.getUser().getId().equals(currentUser.getId()) && !"admin".equalsIgnoreCase(currentUser.getRole())) {
            throw new RuntimeException("Bạn không có quyền xóa sự kiện này.");
        }

        calendarEventRepository.delete(event);
    }
}
