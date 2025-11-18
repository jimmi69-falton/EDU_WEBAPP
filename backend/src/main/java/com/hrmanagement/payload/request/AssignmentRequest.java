package com.hrmanagement.payload.request;

import com.hrmanagement.model.Assignment;
import com.hrmanagement.model.AssignmentQuestion;

import java.util.List;

public class AssignmentRequest {
    private Assignment assignment;
    private List<AssignmentQuestion> questions;

    public AssignmentRequest() {}

    public Assignment getAssignment() {
        return assignment;
    }

    public void setAssignment(Assignment assignment) {
        this.assignment = assignment;
    }

    public List<AssignmentQuestion> getQuestions() {
        return questions;
    }

    public void setQuestions(List<AssignmentQuestion> questions) {
        this.questions = questions;
    }
}

