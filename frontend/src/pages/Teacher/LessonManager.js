import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { motion } from 'framer-motion';
import Modal from '../../components/UI/Modal';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const LessonManager = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtubeUrl: '',
    totalDuration: 0,
  });

  const { data: lessons, isLoading } = useQuery('teacherLessons', async () => {
    const response = await api.get('/lessons');
    return response.data;
  });

  const createMutation = useMutation(
    (data) => api.post('/lessons/teacher', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('teacherLessons');
        setIsModalOpen(false);
        resetForm();
        toast.success('Tạo bài học thành công!');
      },
      onError: () => toast.error('Lỗi khi tạo bài học'),
    }
  );

  const updateMutation = useMutation(
    ({ id, data }) => api.put(`/lessons/teacher/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('teacherLessons');
        setIsModalOpen(false);
        setEditingLesson(null);
        resetForm();
        toast.success('Cập nhật bài học thành công!');
      },
      onError: () => toast.error('Lỗi khi cập nhật bài học'),
    }
  );

  const deleteMutation = useMutation(
    (id) => api.delete(`/lessons/teacher/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('teacherLessons');
        toast.success('Xóa bài học thành công!');
      },
      onError: () => toast.error('Lỗi khi xóa bài học'),
    }
  );

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      youtubeUrl: '',
      totalDuration: 0,
    });
    setEditingLesson(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingLesson) {
      updateMutation.mutate({ id: editingLesson.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description || '',
      youtubeUrl: lesson.youtubeUrl || '',
      totalDuration: lesson.totalDuration || 0,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa bài học này?')) {
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
        <h1 className="text-3xl font-bold">Quản lý bài học</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Tạo bài học mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons && lessons.length > 0 ? (
          lessons.map((lesson) => (
            <motion.div
              key={lesson.id}
              whileHover={{ y: -2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              className="bg-white border border-gray-200 rounded-lg p-6 transition-all flex flex-col"
            >
              <h3 className="text-xl font-semibold mb-2">{lesson.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2 flex-1">{lesson.description}</p>
              <div className="space-y-2">
                {/* Hàng đầu: Các nút chính */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => navigate(`/lessons/${lesson.id}`)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-medium"
                  >
                    Chi tiết
                  </button>
                  <button
                    onClick={() => navigate(`/teacher/lessons/${lesson.id}/checkpoints`)}
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-xs font-medium"
                  >
                    Checkpoints
                  </button>
                  <button
                    onClick={() => navigate(`/teacher/lessons/${lesson.id}/progress`)}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium"
                  >
                    Tiến trình
                  </button>
                </div>
                {/* Hàng dưới: Các nút phụ */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(lesson)}
                    className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-xs font-medium flex items-center justify-center"
                  >
                    <PencilIcon className="w-4 h-4 mr-1" />
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(lesson.id)}
                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-medium flex items-center justify-center"
                  >
                    <TrashIcon className="w-4 h-4 mr-1" />
                    Xóa
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-gray-500">Chưa có bài học nào</p>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm(); }}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">
            {editingLesson ? 'Chỉnh sửa bài học' : 'Tạo bài học mới'}
          </h2>
          
          <div>
            <label className="block text-sm font-medium mb-2">Tiêu đề</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border rounded-lg px-4 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border rounded-lg px-4 py-2"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">YouTube URL</label>
            <input
              type="url"
              value={formData.youtubeUrl}
              onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
              className="w-full border rounded-lg px-4 py-2"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Thời lượng (giây)</label>
            <input
              type="number"
              value={formData.totalDuration}
              onChange={(e) => setFormData({ ...formData, totalDuration: parseInt(e.target.value) })}
              className="w-full border rounded-lg px-4 py-2"
              min="0"
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => { setIsModalOpen(false); resetForm(); }}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editingLesson ? 'Cập nhật' : 'Tạo'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LessonManager;

