import React from 'react';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import api from '../../utils/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { motion } from 'framer-motion';

const StudentProgress = () => {
  const { lessonId } = useParams();

  const { data: progressList, isLoading } = useQuery(
    ['lessonProgress', lessonId],
    async () => {
      const response = await api.get(`/teacher/lessons/${lessonId}/progress`);
      return response.data;
    },
    { enabled: !!lessonId }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tiến trình học sinh</h1>

      <div className="space-y-4">
        {progressList && progressList.length > 0 ? (
          progressList.map((progress) => (
            <motion.div
              key={progress.id}
              whileHover={{ y: -2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              className="bg-white border border-gray-200 rounded-lg p-6 transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    {progress.student?.name || 'Học sinh'}
                  </h3>
                  <div className="mt-4 space-y-2">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Tiến trình video</span>
                        <span>
                          {progress.videoProgressSeconds && progress.totalCheckpoints > 0
                            ? Math.round((progress.videoProgressSeconds / (progress.totalCheckpoints * 60)) * 100)
                            : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${progress.videoProgressSeconds && progress.totalCheckpoints > 0
                              ? Math.round((progress.videoProgressSeconds / (progress.totalCheckpoints * 60)) * 100)
                              : 0}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Checkpoints hoàn thành</span>
                        <span>
                          {progress.checkpointsCompleted || 0} / {progress.totalCheckpoints || 0}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${progress.totalCheckpoints > 0
                              ? (progress.checkpointsCompleted / progress.totalCheckpoints) * 100
                              : 0}%`,
                          }}
                        />
                      </div>
                    </div>

                    {progress.quizScore !== null && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Điểm quiz</span>
                          <span className="font-semibold">{progress.quizScore}%</span>
                        </div>
                      </div>
                    )}

                    <div className="mt-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          progress.completed
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {progress.completed ? 'Hoàn thành' : 'Đang học'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-gray-500">Chưa có học sinh nào học bài này</p>
        )}
      </div>
    </div>
  );
};

export default StudentProgress;

