import React from 'react';
import { useQuery } from 'react-query';
import api from '../../utils/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { motion } from 'framer-motion';

const Lessons = () => {
  const { data: lessons, isLoading } = useQuery('lessons', async () => {
    const response = await api.get('/lessons');
    return response.data;
  });

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
        <h1 className="text-3xl font-bold">Bài học</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons && lessons.length > 0 ? (
          lessons.map((lesson) => (
            <motion.div
              key={lesson.id}
              whileHover={{ y: -2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              className="bg-white border border-gray-200 rounded-lg p-6 transition-all cursor-pointer"
              onClick={() => window.location.href = `/lessons/${lesson.id}`}
            >
              <h3 className="text-xl font-semibold mb-2">{lesson.title}</h3>
              <p className="text-gray-600 mb-4">{lesson.description}</p>
              <a
                href={`/lessons/${lesson.id}`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Xem chi tiết →
              </a>
            </motion.div>
          ))
        ) : (
          <p className="text-gray-500">Chưa có bài học nào</p>
        )}
      </div>
    </div>
  );
};

export default Lessons;

