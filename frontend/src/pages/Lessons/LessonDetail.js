import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../utils/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import VideoPlayerWithCheckpoints from '../../components/VideoPlayer/VideoPlayerWithCheckpoints';
import { useAuth } from '../../contexts/AuthContext';

const LessonDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showQuiz, setShowQuiz] = useState(false);
  
  const { data: lesson, isLoading } = useQuery(['lesson', id], async () => {
    const response = await api.get(`/lessons/${id}`);
    return response.data;
  });

  const { data: checkpoints } = useQuery(['checkpoints', id], async () => {
    const response = await api.get(`/lessons/${id}/checkpoints`);
    return response.data;
  }, { enabled: !!id });

  const { data: quiz } = useQuery(['quiz', id], async () => {
    const response = await api.get(`/lessons/${id}/quiz`);
    return response.data;
  }, { enabled: !!id });

  const { data: progress } = useQuery(['progress', id], async () => {
    const response = await api.get(`/student/lessons/${id}/progress`);
    return response.data;
  }, { enabled: !!id && user?.role === 'student' });

  const updateProgressMutation = useMutation(
    (data) => api.post(`/student/lessons/${id}/progress`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['progress', id]);
      },
    }
  );

  const handleCheckpointAnswer = async (checkpointId, answer, isCorrect) => {
    if (user?.role === 'student' && lesson) {
      // Get current video time or use 0
      const videoProgressSeconds = progress?.videoProgressSeconds || 0;
      
      // Calculate total checkpoints from lesson
      const totalCheckpoints = checkpoints?.length || 0;
      const currentCompleted = progress?.checkpointsCompleted || 0;
      const newCompleted = currentCompleted + 1;
      
      const updatedProgress = {
        lessonId: lesson.id,
        videoProgressSeconds: videoProgressSeconds,
        checkpointsCompleted: newCompleted,
        totalCheckpoints: totalCheckpoints,
        completed: newCompleted >= totalCheckpoints && progress?.quizScore !== null,
      };
      
      updateProgressMutation.mutate(updatedProgress);
      
      // Also invalidate progress query to refresh UI
      queryClient.invalidateQueries(['progress', id]);
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
        <h1 className="text-3xl font-bold">{lesson?.title}</h1>
        {user?.role === 'student' && progress && (
          <div className="text-sm text-gray-600">
            Tiến trình: {progress.completed ? '100%' : 
              `${Math.round((progress.checkpointsCompleted / (progress.totalCheckpoints || 1)) * 100)}%`}
          </div>
        )}
      </div>
      
      {lesson?.youtubeUrl && user?.role === 'student' ? (
        <div className="w-full">
          <h2 className="text-xl font-semibold mb-4">Video bài học</h2>
          <VideoPlayerWithCheckpoints
            youtubeUrl={lesson.youtubeUrl}
            checkpoints={checkpoints || []}
            onCheckpointAnswer={handleCheckpointAnswer}
            lessonId={id}
          />
        </div>
      ) : lesson?.youtubeUrl ? (
        <div className="w-full">
          <h2 className="text-xl font-semibold mb-4">Video bài học</h2>
          <div className="aspect-video w-full">
            <iframe
              src={lesson.youtubeUrl.replace('watch?v=', 'embed/')}
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        </div>
      ) : null}

      {checkpoints && checkpoints.length > 0 && (user?.role === 'teacher' || user?.role === 'admin') && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Checkpoints</h2>
          <ul className="space-y-2">
            {checkpoints.map((checkpoint) => (
              <li key={checkpoint.id} className="border-l-4 border-blue-500 pl-4">
                <p className="font-medium">{checkpoint.question}</p>
                <p className="text-sm text-gray-600">
                  Thời gian: {Math.floor(checkpoint.timeInSeconds / 60)}:{(checkpoint.timeInSeconds % 60).toString().padStart(2, '0')}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {quiz && quiz.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Quiz cuối bài</h2>
            {user?.role === 'student' && (
              <button
                onClick={() => setShowQuiz(!showQuiz)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {showQuiz ? 'Ẩn quiz' : 'Làm quiz'}
              </button>
            )}
          </div>
          {showQuiz || user?.role !== 'student' ? (
            <ul className="space-y-4">
              {quiz.map((q) => (
                <li key={q.id} className="border-b pb-4">
                  <p className="font-medium mb-2">{q.question}</p>
                  {q.options && (
                    <div className="space-y-2 mt-2">
                      {JSON.parse(q.options).map((option, index) => (
                        <div key={index} className="p-2 bg-gray-100 rounded border border-gray-200">
                          {option}
                          {option === q.correctAnswer && (
                            <span className="ml-2 text-green-600 font-semibold">✓ Đúng</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {q.explanation && (
                    <p className="text-sm text-gray-600 mt-2">{q.explanation}</p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Nhấn "Làm quiz" để bắt đầu</p>
          )}
        </div>
      )}
    </div>
  );
};

export default LessonDetail;

