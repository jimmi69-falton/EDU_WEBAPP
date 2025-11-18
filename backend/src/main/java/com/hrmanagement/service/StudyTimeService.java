package com.hrmanagement.service;

import com.hrmanagement.model.StudyTime;
import com.hrmanagement.model.User;
import com.hrmanagement.repository.StudyTimeRepository;
import com.hrmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class StudyTimeService {

    @Autowired
    private StudyTimeRepository studyTimeRepository;

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

    @Transactional
    public StudyTime startStudy() {
        User currentUser = getCurrentUser();
        if (!"student".equalsIgnoreCase(currentUser.getRole())) {
            throw new RuntimeException("Chỉ học sinh mới có thể bắt đầu học.");
        }

        LocalDate today = LocalDate.now();
        Optional<StudyTime> existing = studyTimeRepository.findByStudentIdAndDate(currentUser.getId(), today);

        if (existing.isPresent()) {
            // Already started today, return existing
            return existing.get();
        }

        StudyTime studyTime = new StudyTime();
        studyTime.setStudent(currentUser);
        studyTime.setDate(today);
        studyTime.setTotalSeconds(0);
        return studyTimeRepository.save(studyTime);
    }

    @Transactional
    public StudyTime stopStudy(Integer seconds) {
        User currentUser = getCurrentUser();
        if (!"student".equalsIgnoreCase(currentUser.getRole())) {
            throw new RuntimeException("Chỉ học sinh mới có thể dừng học.");
        }

        LocalDate today = LocalDate.now();
        StudyTime studyTime = studyTimeRepository.findByStudentIdAndDate(currentUser.getId(), today)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiên học để dừng."));

        // Get old value - handle both old format (minutes) and new format (seconds)
        Integer oldValue = studyTime.getTotalSeconds();
        int oldSeconds = 0;
        if (oldValue != null) {
            // If value is less than 10000, assume it's old format (minutes) and convert
            // Otherwise assume it's already in seconds
            if (oldValue < 10000) {
                oldSeconds = oldValue * 60; // Convert minutes to seconds
            } else {
                oldSeconds = oldValue; // Already in seconds
            }
        }
        
        int newSeconds = oldSeconds + seconds;
        studyTime.setTotalSeconds(newSeconds);
        
        StudyTime saved = studyTimeRepository.save(studyTime);
        // Flush to ensure DB is updated immediately
        studyTimeRepository.flush();
        
        System.out.println("Study time saved: " + saved.getTotalSeconds() + " seconds (" + saved.getTotalMinutes() + " minutes) for student " + currentUser.getId() + " on " + today);
        
        return saved;
    }

    public Map<String, Object> getStudyStats() {
        User currentUser = getCurrentUser();
        if (!"student".equalsIgnoreCase(currentUser.getRole())) {
            throw new RuntimeException("Chỉ học sinh mới có thể xem thống kê học tập.");
        }

        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(7);

        // Get all study times (not just recent week)
        List<StudyTime> allStudyTimes = studyTimeRepository.findByStudentId(currentUser.getId());

        List<StudyTime> recentStudyTimes = studyTimeRepository.findByStudentIdAndDateBetween(
                currentUser.getId(), weekStart, today);

        int todaySeconds = studyTimeRepository.findByStudentIdAndDate(currentUser.getId(), today)
                .map(st -> {
                    Integer value = st.getTotalSeconds();
                    if (value == null) return 0;
                    // Handle old format (minutes) - if value < 10000, assume it's minutes
                    if (value < 10000) {
                        return value * 60; // Convert minutes to seconds
                    }
                    return value; // Already in seconds
                })
                .orElse(0);
        int todayMinutes = todaySeconds / 60;

        int weekTotalSeconds = recentStudyTimes.stream()
                .mapToInt(st -> {
                    Integer value = st.getTotalSeconds();
                    if (value == null) return 0;
                    // Handle old format (minutes) - if value < 10000, assume it's minutes
                    if (value < 10000) {
                        return value * 60; // Convert minutes to seconds
                    }
                    return value; // Already in seconds
                })
                .sum();
        int weekTotalMinutes = weekTotalSeconds / 60;

        // Calculate total seconds from all study times
        int totalSeconds = allStudyTimes.stream()
                .mapToInt(st -> {
                    Integer value = st.getTotalSeconds();
                    if (value == null) return 0;
                    // Handle old format (minutes) - if value < 10000, assume it's minutes
                    if (value < 10000) {
                        return value * 60; // Convert minutes to seconds
                    }
                    return value; // Already in seconds
                })
                .sum();
        int totalMinutes = totalSeconds / 60;

        // Count unique study days
        long studyDays = allStudyTimes.stream()
                .map(StudyTime::getDate)
                .distinct()
                .count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("todaySeconds", todaySeconds);
        stats.put("todayMinutes", todayMinutes);
        stats.put("todayHours", todaySeconds / 3600.0);
        stats.put("weekTotalSeconds", weekTotalSeconds);
        stats.put("weekTotalMinutes", weekTotalMinutes);
        stats.put("totalSeconds", totalSeconds);
        stats.put("totalMinutes", totalMinutes);
        stats.put("totalHours", totalSeconds / 3600.0);
        stats.put("studyDays", studyDays);
        stats.put("recentStudyTimes", recentStudyTimes);

        return stats;
    }
}
