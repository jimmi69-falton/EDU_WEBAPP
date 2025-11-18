import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Modal from '../../components/UI/Modal';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  BookOpenIcon,
  XMarkIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const Assignments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [questions, setQuestions] = useState([]);

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  // Fetch assignments based on role
  const { data: assignments, isLoading } = useQuery(
    isTeacher ? 'teacherAssignments' : 'studentAssignments',
    async () => {
      const endpoint = isTeacher ? '/teacher/assignments' : '/student/assignments';
      const response = await api.get(endpoint);
      return response.data;
    }
  );

  // Fetch submission status for each assignment (student only)
  const { data: submissionsMap = {}, refetch: refetchSubmissions } = useQuery(
    'assignmentSubmissions',
    async () => {
      if (isTeacher || !assignments || assignments.length === 0) return {};
      
      const submissions = {};
      await Promise.all(
        assignments.map(async (assignment) => {
          try {
            const response = await api.get(`/student/assignments/${assignment.id}/submission`);
            submissions[assignment.id] = response.data;
          } catch (error) {
            if (error.response?.status !== 404) {
              console.error(`Error fetching submission for assignment ${assignment.id}:`, error);
            }
            // 404 means not submitted yet, which is fine
          }
        })
      );
      return submissions;
    },
    {
      enabled: !isTeacher && assignments && assignments.length > 0,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    }
  );

  // Refetch submissions when assignments change (e.g., after invalidate)
  useEffect(() => {
    if (!isTeacher && assignments && assignments.length > 0) {
      refetchSubmissions();
    }
  }, [assignments, isTeacher, refetchSubmissions]);

  // Fetch lessons for teacher (to select when creating assignment)
  const { data: lessons = [] } = useQuery(
    'lessons',
    async () => {
      const response = await api.get('/lessons');
      return response.data;
    },
    {
      enabled: isTeacher, // Only fetch if teacher
    }
  );

  // Fetch questions for an assignment when editing
  const { data: assignmentQuestions = [] } = useQuery(
    ['assignmentQuestions', editing?.id],
    async () => {
      const response = await api.get(`/assignments/${editing?.id}/questions`);
      return response.data;
    },
    {
      enabled: !!editing?.id && isTeacher,
    }
  );

  const createMutation = useMutation(
    (data) => api.post('/teacher/assignments', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('teacherAssignments');
        setModalOpen(false);
        resetEditing();
        setQuestions([]);
        toast.success('Tạo bài tập thành công!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Tạo bài tập thất bại');
      },
    }
  );

  const updateMutation = useMutation(
    ({ id, data }) => api.put(`/teacher/assignments/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('teacherAssignments');
        setModalOpen(false);
        resetEditing();
        setQuestions([]);
        toast.success('Cập nhật bài tập thành công!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật bài tập thất bại');
      },
    }
  );

  const deleteMutation = useMutation(
    (id) => api.delete(`/teacher/assignments/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('teacherAssignments');
        toast.success('Xóa bài tập thành công!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Xóa bài tập thất bại');
      },
    }
  );

  const resetEditing = () => {
    setEditing({
      title: '',
      description: '',
      type: 'homework',
      deadline: '',
      lessonId: null,
    });
    setQuestions([]);
  };

  const openCreateModal = () => {
    resetEditing();
    setModalOpen(true);
  };

  const openEditModal = async (assignment) => {
    setEditing({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description || '',
      type: assignment.type,
      deadline: assignment.deadline ? assignment.deadline.split('T')[0] : '',
      lessonId: assignment.lesson?.id || null,
    });
    
    // Fetch questions for this assignment
    try {
      const response = await api.get(`/assignments/${assignment.id}/questions`);
      const fetchedQuestions = response.data.map((q) => ({
        id: q.id,
        question: q.question,
        questionType: q.questionType || 'MCQ',
        options: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
      }));
      setQuestions(fetchedQuestions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestions([]);
    }
    
    setModalOpen(true);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now(), // Temporary ID
        question: '',
        questionType: 'MCQ',
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: '',
      },
    ]);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateQuestionOption = (questionIndex, optionIndex, value) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const addOption = (questionIndex) => {
    const updated = [...questions];
    updated[questionIndex].options.push('');
    setQuestions(updated);
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updated = [...questions];
    updated[questionIndex].options = updated[questionIndex].options.filter((_, i) => i !== optionIndex);
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate questions
    if (questions.length === 0) {
      toast.error('Vui lòng thêm ít nhất một câu hỏi!');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        toast.error(`Câu hỏi ${i + 1}: Vui lòng nhập câu hỏi!`);
        return;
      }
      if (q.questionType === 'MCQ') {
        const validOptions = q.options.filter((opt) => opt.trim());
        if (validOptions.length < 2) {
          toast.error(`Câu hỏi ${i + 1}: Cần ít nhất 2 lựa chọn!`);
          return;
        }
        if (!q.correctAnswer.trim()) {
          toast.error(`Câu hỏi ${i + 1}: Vui lòng chọn đáp án đúng!`);
          return;
        }
      } else if (!q.correctAnswer.trim()) {
        toast.error(`Câu hỏi ${i + 1}: Vui lòng nhập đáp án đúng!`);
        return;
      }
    }

    const payload = {
      title: editing.title,
      description: editing.description,
      type: editing.type,
      deadline: editing.deadline || null,
      lesson: editing.lessonId ? { id: editing.lessonId } : null,
      questions: questions.map((q) => ({
        question: q.question,
        questionType: q.questionType,
        options: JSON.stringify(q.options.filter((opt) => opt.trim())),
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      })),
    };

    if (editing.id) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa bài tập này?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="h1">Bài tập</h1>
        {isTeacher && (
          <motion.button
            onClick={openCreateModal}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Tạo bài tập</span>
          </motion.button>
        )}
      </div>

      <div className="space-y-4">
        {assignments && assignments.length > 0 ? (
          assignments.map((assignment) => (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold">{assignment.title}</h3>
                      <span
                        className={`badge ${
                          assignment.type === 'homework' ? 'badge-warning' : 'badge-info'
                        }`}
                      >
                        {assignment.type === 'homework' ? 'Về nhà' : 'Trên lớp'}
                      </span>
                    </div>
                    {assignment.description && (
                      <p className="text-gray-600 mb-3">{assignment.description}</p>
                    )}
                    <div className="flex gap-4 text-sm text-gray-500">
                      {assignment.lesson && (
                        <div className="flex items-center space-x-1">
                          <BookOpenIcon className="w-4 h-4" />
                          <span>Bài học: {assignment.lesson.title}</span>
                        </div>
                      )}
                      {assignment.deadline && (
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="w-4 h-4" />
                          <span>
                            Hạn nộp: {new Date(assignment.deadline).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {isTeacher ? (
                      <>
                        <motion.button
                          onClick={() => openEditModal(assignment)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="btn btn-secondary p-2"
                          title="Sửa"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDelete(assignment.id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="btn btn-danger p-2"
                          title="Xóa"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </motion.button>
                      </>
                    ) : (
                      (() => {
                        const submission = submissionsMap[assignment.id];
                        const hasSubmitted = !!submission;
                        
                        return (
                          <div className="flex flex-col items-center justify-center space-y-3 min-w-[150px]">
                            {hasSubmitted ? (
                              <>
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg w-full justify-center border border-green-200"
                                >
                                  <CheckCircleIcon className="w-5 h-5" />
                                  <span className="font-semibold">Đã nộp</span>
                                </motion.div>
                                {submission.score !== null && (
                                  <div className="text-center">
                                    <p className="text-sm text-gray-600 mb-1">Điểm số</p>
                                    <p className="text-lg font-bold text-gray-800">
                                      {submission.score.toFixed(1)}<span className="text-sm font-normal text-gray-500">/10</span>
                                    </p>
                                  </div>
                                )}
                                <motion.button
                                  onClick={() => navigate(`/assignments/${assignment.id}`)}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="btn btn-secondary text-sm w-full"
                                >
                                  Xem lại
                                </motion.button>
                              </>
                            ) : (
                              <motion.button
                                onClick={() => navigate(`/assignments/${assignment.id}`)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn btn-primary w-full"
                              >
                                Làm bài
                              </motion.button>
                            )}
                          </div>
                        );
                      })()
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <ClipboardDocumentListIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {isTeacher ? 'Chưa có bài tập nào. Hãy tạo bài tập mới!' : 'Chưa có bài tập nào'}
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal for Teacher */}
      {isTeacher && editing && (
        <Modal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            resetEditing();
          }}
          title={editing.id ? 'Sửa bài tập' : 'Tạo bài tập mới'}
          size="xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4 border-b pb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="input w-full"
                  placeholder="Nhập tiêu đề bài tập"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="input w-full"
                  rows={3}
                  placeholder="Nhập mô tả bài tập"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại bài tập <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={editing.type}
                    onChange={(e) => setEditing({ ...editing, type: e.target.value })}
                    className="input w-full"
                  >
                    <option value="homework">Bài tập về nhà</option>
                    <option value="classwork">Bài tập trên lớp</option>
                  </select>
                </div>

                {editing.type === 'homework' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hạn nộp
                    </label>
                    <input
                      type="date"
                      value={editing.deadline}
                      onChange={(e) => setEditing({ ...editing, deadline: e.target.value })}
                      className="input w-full"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bài học (tùy chọn)
                </label>
                <select
                  value={editing.lessonId || ''}
                  onChange={(e) =>
                    setEditing({ ...editing, lessonId: e.target.value || null })
                  }
                  className="input w-full"
                >
                  <option value="">Không gắn với bài học cụ thể</option>
                  {lessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Questions Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Câu hỏi trắc nghiệm</h3>
                <motion.button
                  type="button"
                  onClick={addQuestion}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Thêm câu hỏi</span>
                </motion.button>
              </div>

              <AnimatePresence>
                {questions.map((q, qIndex) => (
                  <motion.div
                    key={q.id || qIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="border rounded-lg p-4 bg-white border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-gray-700">
                        Câu hỏi {qIndex + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Câu hỏi <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={q.question}
                          onChange={(e) =>
                            updateQuestion(qIndex, 'question', e.target.value)
                          }
                          className="input w-full"
                          rows={2}
                          placeholder="Nhập câu hỏi..."
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Loại câu hỏi
                        </label>
                        <select
                          value={q.questionType}
                          onChange={(e) =>
                            updateQuestion(qIndex, 'questionType', e.target.value)
                          }
                          className="input w-full"
                        >
                          <option value="MCQ">Trắc nghiệm (MCQ)</option>
                          <option value="TRUE_FALSE">Đúng/Sai</option>
                          <option value="SHORT">Tự luận ngắn</option>
                        </select>
                      </div>

                      {q.questionType === 'MCQ' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Các lựa chọn <span className="text-red-500">*</span>
                          </label>
                          <div className="space-y-2">
                            {q.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  name={`correct-${qIndex}`}
                                  checked={q.correctAnswer === option}
                                  onChange={() =>
                                    updateQuestion(qIndex, 'correctAnswer', option)
                                  }
                                  className="w-4 h-4"
                                />
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) =>
                                    updateQuestionOption(qIndex, optIndex, e.target.value)
                                  }
                                  className="input flex-1"
                                  placeholder={`Lựa chọn ${optIndex + 1}`}
                                />
                                {q.options.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => removeOption(qIndex, optIndex)}
                                    className="text-red-600 hover:text-red-700 p-1"
                                  >
                                    <XMarkIcon className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => addOption(qIndex)}
                              className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                            >
                              <PlusIcon className="w-4 h-4" />
                              <span>Thêm lựa chọn</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {q.questionType === 'TRUE_FALSE' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Đáp án đúng <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={q.correctAnswer}
                            onChange={(e) =>
                              updateQuestion(qIndex, 'correctAnswer', e.target.value)
                            }
                            className="input w-full"
                            required
                          >
                            <option value="">Chọn đáp án</option>
                            <option value="Đúng">Đúng</option>
                            <option value="Sai">Sai</option>
                          </select>
                        </div>
                      )}

                      {q.questionType === 'SHORT' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Đáp án đúng <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={q.correctAnswer}
                            onChange={(e) =>
                              updateQuestion(qIndex, 'correctAnswer', e.target.value)
                            }
                            className="input w-full"
                            placeholder="Nhập đáp án đúng..."
                            required
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Giải thích (tùy chọn)
                        </label>
                        <textarea
                          value={q.explanation}
                          onChange={(e) =>
                            updateQuestion(qIndex, 'explanation', e.target.value)
                          }
                          className="input w-full"
                          rows={2}
                          placeholder="Giải thích đáp án..."
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {questions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Chưa có câu hỏi nào. Hãy thêm câu hỏi để tạo bài tập!</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  resetEditing();
                }}
                className="btn btn-secondary"
              >
                Hủy
              </button>
              <button type="submit" className="btn btn-primary">
                {editing.id ? 'Cập nhật' : 'Tạo bài tập'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Assignments;
