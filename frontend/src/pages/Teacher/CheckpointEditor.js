import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../utils/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Modal from '../../components/UI/Modal';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

const CheckpointEditor = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState(0);
  const [formData, setFormData] = useState({
    question: '',
    questionType: 'MCQ',
    options: ['', ''],
    correctAnswer: '',
    explanation: '',
  });

  const { data: lesson } = useQuery(['lesson', lessonId], async () => {
    const response = await api.get(`/lessons/${lessonId}`);
    return response.data;
  }, { enabled: !!lessonId });

  const { data: checkpoints, isLoading } = useQuery(
    ['checkpoints', lessonId],
    async () => {
      const response = await api.get(`/lessons/${lessonId}/checkpoints`);
      return response.data;
    },
    { enabled: !!lessonId }
  );

  const createMutation = useMutation(
    (data) => api.post(`/lessons/${lessonId}/checkpoints`, {
      ...data,
      timeInSeconds: selectedTime,
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['checkpoints', lessonId]);
        setIsModalOpen(false);
        resetForm();
        toast.success('Tạo checkpoint thành công!');
      },
      onError: () => toast.error('Lỗi khi tạo checkpoint'),
    }
  );

  const deleteMutation = useMutation(
    (checkpointId) => api.delete(`/lessons/${lessonId}/checkpoints/${checkpointId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['checkpoints', lessonId]);
        toast.success('Xóa checkpoint thành công!');
      },
      onError: () => toast.error('Lỗi khi xóa checkpoint'),
    }
  );

  const resetForm = () => {
    setFormData({
      question: '',
      questionType: 'MCQ',
      options: ['', ''],
      correctAnswer: '',
      explanation: '',
    });
    setSelectedTime(0);
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, ''],
    });
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        options: newOptions,
        correctAnswer: formData.correctAnswer === formData.options[index] ? '' : formData.correctAnswer,
      });
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({
      ...formData,
      options: newOptions,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate MCQ options
    if (formData.questionType === 'MCQ') {
      const validOptions = formData.options.filter(opt => opt.trim() !== '');
      if (validOptions.length < 2) {
        toast.error('Vui lòng nhập ít nhất 2 lựa chọn cho câu hỏi trắc nghiệm!');
        return;
      }
      if (!formData.correctAnswer || !validOptions.includes(formData.correctAnswer)) {
        toast.error('Vui lòng chọn đáp án đúng từ các lựa chọn!');
        return;
      }
    }

    let options = formData.questionType === 'MCQ' 
      ? JSON.stringify(formData.options.filter(opt => opt.trim() !== ''))
      : '[]';
    
    createMutation.mutate({
      question: formData.question,
      questionType: formData.questionType,
      options: options,
      correctAnswer: formData.correctAnswer,
      explanation: formData.explanation,
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
        <div>
          <h1 className="text-3xl font-bold">Checkpoint Editor</h1>
          <p className="text-gray-600 mt-1">{lesson?.title}</p>
        </div>
        <button
          onClick={() => navigate(`/lessons/${lessonId}`)}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Quay lại bài học
        </button>
      </div>

      {/* Timeline */}
      {lesson?.youtubeUrl && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Timeline Video</h2>
          <div className="relative bg-gray-200 h-12 rounded-lg mb-4">
            {checkpoints && checkpoints.map((cp) => (
              <div
                key={cp.id}
                className="absolute top-0 h-full w-1 bg-blue-600 cursor-pointer hover:bg-blue-700"
                style={{
                  left: `${(cp.timeInSeconds / (lesson.totalDuration || 3600)) * 100}%`,
                }}
                title={`${formatTime(cp.timeInSeconds)}: ${cp.question}`}
              />
            ))}
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="0"
              max={lesson.totalDuration || 3600}
              value={selectedTime}
              onChange={(e) => setSelectedTime(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm font-medium">{formatTime(selectedTime)}</span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Thêm checkpoint
            </button>
          </div>
        </div>
      )}

      {/* Checkpoints List */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Danh sách Checkpoints</h2>
        {checkpoints && checkpoints.length > 0 ? (
          <div className="space-y-4">
            {checkpoints.map((checkpoint) => (
              <div
                key={checkpoint.id}
                className="flex justify-between items-start p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                      {formatTime(checkpoint.timeInSeconds)}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                      {checkpoint.questionType}
                    </span>
                  </div>
                  <p className="font-medium">{checkpoint.question}</p>
                  {checkpoint.explanation && (
                    <p className="text-sm text-gray-600 mt-1">{checkpoint.explanation}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('Bạn có chắc muốn xóa checkpoint này?')) {
                      deleteMutation.mutate(checkpoint.id);
                    }
                  }}
                  className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Chưa có checkpoint nào</p>
        )}
      </div>

      {/* Create Checkpoint Modal */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm(); }} size="xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">Tạo Checkpoint tại {formatTime(selectedTime)}</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Câu hỏi <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="input w-full"
              rows={3}
              placeholder="Nhập câu hỏi..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại câu hỏi
            </label>
            <select
              value={formData.questionType}
              onChange={(e) => {
                const newType = e.target.value;
                setFormData({
                  ...formData,
                  questionType: newType,
                  options: newType === 'MCQ' ? ['', ''] : formData.options,
                  correctAnswer: '',
                });
              }}
              className="input w-full"
            >
              <option value="MCQ">Trắc nghiệm (MCQ)</option>
              <option value="TRUE_FALSE">Đúng/Sai</option>
              <option value="SHORT">Tự luận ngắn</option>
            </select>
          </div>

          {formData.questionType === 'MCQ' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Các lựa chọn <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {formData.options.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="correct-checkpoint"
                      checked={formData.correctAnswer === option && option.trim() !== ''}
                      onChange={() => {
                        if (option.trim() !== '') {
                          setFormData({ ...formData, correctAnswer: option });
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        updateOption(optIndex, e.target.value);
                        if (formData.correctAnswer === option) {
                          setFormData({ ...formData, correctAnswer: e.target.value });
                        }
                      }}
                      className="input flex-1"
                      placeholder={`Lựa chọn ${optIndex + 1}`}
                    />
                    {formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(optIndex)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOption}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Thêm lựa chọn</span>
                </button>
              </div>
            </div>
          )}

          {formData.questionType === 'TRUE_FALSE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đáp án đúng <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.correctAnswer}
                onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                className="input w-full"
                required
              >
                <option value="">Chọn đáp án</option>
                <option value="Đúng">Đúng</option>
                <option value="Sai">Sai</option>
              </select>
            </div>
          )}

          {formData.questionType === 'SHORT' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đáp án đúng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.correctAnswer}
                onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                className="input w-full"
                placeholder="Nhập đáp án đúng..."
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giải thích (tùy chọn)
            </label>
            <textarea
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              className="input w-full"
              rows={2}
              placeholder="Giải thích đáp án..."
            />
          </div>

          <div className="flex space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => { setIsModalOpen(false); resetForm(); }}
              className="btn btn-secondary flex-1"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
            >
              Tạo checkpoint
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CheckpointEditor;

