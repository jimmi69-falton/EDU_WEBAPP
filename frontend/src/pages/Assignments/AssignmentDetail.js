import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../utils/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const AssignmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submission, setSubmission] = useState(null);

  // Fetch assignment details
  const { data: assignment, isLoading: assignmentLoading } = useQuery(
    ['assignment', id],
    async () => {
      const response = await api.get(`/student/assignments`);
      const assignments = response.data;
      return assignments.find((a) => a.id === parseInt(id));
    },
    {
      enabled: !!id,
    }
  );

  // Fetch questions
  const { data: questions = [], isLoading: questionsLoading } = useQuery(
    ['assignmentQuestions', id],
    async () => {
      const response = await api.get(`/assignments/${id}/questions`);
      return response.data;
    },
    {
      enabled: !!id,
    }
  );

  // Fetch my submission
  const { data: mySubmission, isLoading: submissionLoading } = useQuery(
    ['mySubmission', id],
    async () => {
      try {
        const response = await api.get(`/student/assignments/${id}/submission`);
        return response.data;
      } catch (error) {
        if (error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    {
      enabled: !!id,
    }
  );

  useEffect(() => {
    if (mySubmission && mySubmission.content) {
      try {
        const parsedAnswers = JSON.parse(mySubmission.content);
        setAnswers(parsedAnswers);
        setSubmitted(true);
        setSubmission(mySubmission);
      } catch (e) {
        // If not JSON, treat as plain text
      }
    }
  }, [mySubmission]);

  const submitMutation = useMutation(
    (data) => api.post(`/student/assignments/${id}/submit`, data),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries(['mySubmission', id]);
        queryClient.invalidateQueries('assignmentSubmissions'); // Invalidate submissions list
        queryClient.invalidateQueries('studentAssignments'); // Also invalidate assignments to ensure refetch
        setSubmitted(true);
        setSubmission(response.data);
        toast.success('Nộp bài thành công!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Nộp bài thất bại');
      },
    }
  );

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer,
    });
  };

  const handleSubmit = () => {
    // Validate all questions are answered
    const unansweredQuestions = questions.filter(
      (q) => !answers[q.id.toString()]
    );

    if (unansweredQuestions.length > 0) {
      toast.error(
        `Vui lòng trả lời tất cả các câu hỏi! Còn ${unansweredQuestions.length} câu chưa trả lời.`
      );
      return;
    }

    if (
      window.confirm(
        'Bạn có chắc muốn nộp bài? Sau khi nộp bạn không thể sửa lại.'
      )
    ) {
      submitMutation.mutate({
        answers: answers,
      });
    }
  };

  const parseOptions = (optionsString) => {
    if (!optionsString) return [];
    try {
      return JSON.parse(optionsString);
    } catch (e) {
      return [];
    }
  };

  if (assignmentLoading || questionsLoading || submissionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Không tìm thấy bài tập</p>
          <button
            onClick={() => navigate('/assignments')}
            className="btn btn-primary"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const isOverdue =
    assignment.deadline &&
    new Date(assignment.deadline) < new Date() &&
    !submitted;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={() => navigate('/assignments')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-secondary p-2"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </motion.button>
          <div>
            <h1 className="h1">{assignment.title}</h1>
            {assignment.description && (
              <p className="text-gray-600 mt-1">{assignment.description}</p>
            )}
          </div>
        </div>
        {assignment.deadline && (
          <div className="flex items-center space-x-2 text-sm">
            <ClockIcon className="w-5 h-5 text-gray-500" />
            <span
              className={
                isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'
              }
            >
              Hạn nộp: {new Date(assignment.deadline).toLocaleDateString('vi-VN')}
            </span>
          </div>
        )}
      </div>

      {/* Submission Status */}
      {submitted && submission && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-100 border border-green-300 rounded-lg p-4"
        >
          <div className="flex items-center space-x-3">
            <CheckCircleIcon className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-800">
                Đã nộp bài thành công!
              </p>
              {submission.score !== null && (
                <p className="text-green-700 mt-1">
                  Điểm số: <span className="font-bold">{submission.score.toFixed(1)}/10</span>
                </p>
              )}
              <p className="text-sm text-green-600 mt-1">
                Nộp lúc:{' '}
                {new Date(submission.submittedAt).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Questions */}
      {questions.length > 0 ? (
        <div className="space-y-6">
          {questions.map((question, index) => {
            const questionId = question.id.toString();
            const selectedAnswer = answers[questionId];
            const options = parseOptions(question.options);
            const isCorrect =
              submitted &&
              submission &&
              selectedAnswer === question.correctAnswer;

            return (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      Câu {index + 1}: {question.question}
                    </h3>
                    {submitted && (
                      <div className="flex items-center space-x-2">
                        {isCorrect ? (
                          <CheckCircleIcon className="w-6 h-6 text-green-600" />
                        ) : (
                          <XCircleIcon className="w-6 h-6 text-red-600" />
                        )}
                      </div>
                    )}
                  </div>

                  {question.questionType === 'MCQ' && options.length > 0 ? (
                    <div className="space-y-2">
                      {options.map((option, optIndex) => (
                        <label
                          key={optIndex}
                          className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedAnswer === option
                              ? submitted
                                ? isCorrect
                                  ? 'border-green-500 bg-green-100'
                                  : 'border-red-500 bg-red-100'
                                : 'border-blue-500 bg-blue-100'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${questionId}`}
                            value={option}
                            checked={selectedAnswer === option}
                            onChange={() =>
                              !submitted &&
                              handleAnswerChange(questionId, option)
                            }
                            disabled={submitted}
                            className="w-4 h-4"
                          />
                          <span className="flex-1">{option}</span>
                          {submitted &&
                            option === question.correctAnswer && (
                              <CheckCircleIcon className="w-5 h-5 text-green-600" />
                            )}
                        </label>
                      ))}
                    </div>
                  ) : question.questionType === 'TRUE_FALSE' ? (
                    <div className="space-y-2">
                      {['Đúng', 'Sai'].map((option) => (
                        <label
                          key={option}
                          className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedAnswer === option
                              ? submitted
                                ? isCorrect
                                  ? 'border-green-500 bg-green-100'
                                  : 'border-red-500 bg-red-100'
                                : 'border-blue-500 bg-blue-100'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${questionId}`}
                            value={option}
                            checked={selectedAnswer === option}
                            onChange={() =>
                              !submitted &&
                              handleAnswerChange(questionId, option)
                            }
                            disabled={submitted}
                            className="w-4 h-4"
                          />
                          <span className="flex-1">{option}</span>
                          {submitted &&
                            option === question.correctAnswer && (
                              <CheckCircleIcon className="w-5 h-5 text-green-600" />
                            )}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={selectedAnswer || ''}
                      onChange={(e) =>
                        !submitted &&
                        handleAnswerChange(questionId, e.target.value)
                      }
                      disabled={submitted}
                      className="input w-full"
                      placeholder="Nhập câu trả lời..."
                    />
                  )}

                  {submitted && question.explanation && (
                    <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
                      <p className="text-sm font-semibold text-blue-800 mb-1">
                        Giải thích:
                      </p>
                      <p className="text-sm text-blue-700">
                        {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* Submit Button */}
          {!submitted && (
            <div className="flex justify-end">
              <motion.button
                onClick={handleSubmit}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary px-8 py-3 text-lg"
                disabled={submitMutation.isLoading}
              >
                {submitMutation.isLoading ? 'Đang nộp...' : 'Nộp bài'}
              </motion.button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500 text-lg">
            Bài tập này chưa có câu hỏi nào.
          </p>
        </div>
      )}
    </div>
  );
};

export default AssignmentDetail;

