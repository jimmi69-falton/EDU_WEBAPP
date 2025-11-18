package com.hrmanagement.controller;

import com.hrmanagement.model.CalendarEvent;
import com.hrmanagement.service.CalendarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CalendarController {

    @Autowired
    private CalendarService calendarService;

    // GET /api/calendar - Get all events (filtered by role)
    @GetMapping("/calendar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<CalendarEvent>> getAllEvents() {
        List<CalendarEvent> events = calendarService.getAllEvents();
        return ResponseEntity.ok(events);
    }

    // POST /api/calendar - Create event (personal for student, can be for all for teacher/admin)
    @PostMapping("/calendar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CalendarEvent> createEvent(@RequestBody CalendarEvent event) {
        CalendarEvent newEvent = calendarService.createEvent(event);
        return ResponseEntity.ok(newEvent);
    }

    // POST /api/admin/calendar - Create system-wide event (Admin only)
    @PostMapping("/admin/calendar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CalendarEvent> createSystemEvent(@RequestBody CalendarEvent event) {
        CalendarEvent newEvent = calendarService.createEvent(event);
        return ResponseEntity.ok(newEvent);
    }

    // PUT /api/calendar/:id - Update event
    @PutMapping("/calendar/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CalendarEvent> updateEvent(
            @PathVariable Long id,
            @RequestBody CalendarEvent eventDetails) {
        CalendarEvent updatedEvent = calendarService.updateEvent(id, eventDetails);
        return ResponseEntity.ok(updatedEvent);
    }

    // DELETE /api/calendar/:id - Delete event
    @DeleteMapping("/calendar/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        calendarService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
}
