package com.hrmanagement.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Entity
@Table(name = "lesson_progress")
public class LessonProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id")
    @JsonIgnore
    private Lesson lesson;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    @JsonIgnore
    private User student;

    @Column(name = "video_progress_seconds")
    private Integer videoProgressSeconds;

    @Column(name = "quiz_score")
    private Double quizScore; // 0-100

    @Column(name = "completed")
    private Boolean completed = false;

    @Column(name = "checkpoints_completed")
    private Integer checkpointsCompleted = 0;

    @Column(name = "total_checkpoints")
    private Integer totalCheckpoints = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public LessonProgress() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Lesson getLesson() { return lesson; }
    public void setLesson(Lesson lesson) { this.lesson = lesson; }
    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }
    public Integer getVideoProgressSeconds() { return videoProgressSeconds; }
    public void setVideoProgressSeconds(Integer videoProgressSeconds) { this.videoProgressSeconds = videoProgressSeconds; }
    public Double getQuizScore() { return quizScore; }
    public void setQuizScore(Double quizScore) { this.quizScore = quizScore; }
    public Boolean getCompleted() { return completed; }
    public void setCompleted(Boolean completed) { this.completed = completed; }
    public Integer getCheckpointsCompleted() { return checkpointsCompleted; }
    public void setCheckpointsCompleted(Integer checkpointsCompleted) { this.checkpointsCompleted = checkpointsCompleted; }
    public Integer getTotalCheckpoints() { return totalCheckpoints; }
    public void setTotalCheckpoints(Integer totalCheckpoints) { this.totalCheckpoints = totalCheckpoints; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

