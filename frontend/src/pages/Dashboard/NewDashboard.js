import React from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import {
  BookOpenIcon,
  ClockIcon,
  TrophyIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  StarIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const NewDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch lesson progress
  const { data: progressData, isLoading: isLoadingProgress } = useQuery(
    'lessonProgress',
    async () => {
      const response = await api.get('/student/lessons/progress');
      return response.data;
    },
    { enabled: user?.role === 'student' }
  );

  // Fetch study time stats
  const { data: studyStats, isLoading: isLoadingStats } = useQuery(
    'studyStats',
    async () => {
      const response = await api.get('/student/study/stats');
      return response.data;
    },
    { enabled: user?.role === 'student' }
  );

  // Fetch calendar events
  const { data: calendarEvents, isLoading: isLoadingCalendar } = useQuery(
    'calendar',
    async () => {
      const response = await api.get('/calendar');
      return response.data;
    }
  );

  // Fetch lessons
  const { data: lessons, isLoading: isLoadingLessons } = useQuery(
    'lessons',
    async () => {
      const response = await api.get('/lessons');
      return response.data;
    }
  );

  // Fetch student ranking
  const { data: ranking, isLoading: isLoadingRanking } = useQuery(
    'studentRanking',
    async () => {
      const response = await api.get('/ranking/students');
      return response.data;
    }
  );

  if (isLoadingProgress || isLoadingStats || isLoadingCalendar || isLoadingLessons || isLoadingRanking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Calculate overall progress
  const calculateOverallProgress = () => {
    if (!progressData || progressData.length === 0) return 0;
    const totalProgress = progressData.reduce((sum, p) => {
      const lessonProgress = p.completed ? 100 : 
        (p.videoProgressSeconds && p.totalCheckpoints > 0) 
          ? ((p.videoProgressSeconds / (lessons?.find(l => l.id === p.lesson?.id)?.totalDuration || 1)) * 50 + 
             (p.checkpointsCompleted / p.totalCheckpoints) * 30 + 
             (p.quizScore || 0) * 0.2)
          : 0;
      return sum + lessonProgress;
    }, 0);
    return Math.round(totalProgress / progressData.length);
  };

  const overallProgress = calculateOverallProgress();
  const stars = Math.floor(overallProgress / 5); // 5% = 1 sao

  // Get today's events
  const todayEvents = calendarEvents?.filter(event => {
    const eventDate = new Date(event.startTime);
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
  }) || [];

  // Get recent lessons
  const recentLessons = lessons?.slice(0, 3) || [];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Xin chào, {user?.name || 'Người dùng'}!</h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'student' ? 'Học sinh' : user?.role === 'teacher' ? 'Giáo viên' : 'Quản trị viên'}
          </p>
        </div>
      </div>

      {/* Progress Overview */}
      {user?.role === 'student' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Tiến trình tổng</h3>
              <ChartBarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-600">{overallProgress}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Thành tích</h3>
              <TrophyIcon className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="flex items-center space-x-1">
              {Array.from({ length: stars }).map((_, i) => (
                <StarIcon key={i} className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              ))}
              {Array.from({ length: Math.max(0, 20 - stars) }).map((_, i) => (
                <StarIcon key={i} className="w-6 h-6 text-gray-300" />
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-2">{stars} / 20 sao</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Thời gian học</h3>
              <ClockIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600">
              {studyStats?.totalHours?.toFixed(1) || 0} giờ
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Hôm nay: {studyStats?.todayMinutes || 0} phút
            </p>
          </div>
        </div>
      )}

      {/* Today's Schedule */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <CalendarDaysIcon className="w-6 h-6 mr-2" />
            Lịch hôm nay
          </h2>
          <button
            onClick={() => navigate('/calendar')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Xem tất cả →
          </button>
        </div>
        {todayEvents.length > 0 ? (
          <div className="space-y-3">
            {todayEvents.slice(0, 3).map((event) => (
              <motion.div
                key={event.id}
                whileHover={{ y: -2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 transition-all cursor-pointer"
              >
                <div>
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(event.startTime).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Không có sự kiện nào hôm nay</p>
        )}
      </div>

      {/* Recent Lessons */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <BookOpenIcon className="w-6 h-6 mr-2" />
            Bài học gần đây
          </h2>
          <button
            onClick={() => navigate('/lessons')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Xem tất cả →
          </button>
        </div>
        {recentLessons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentLessons.map((lesson) => {
              const progress = progressData?.find(p => p.lesson?.id === lesson.id);
              return (
                <motion.div
                  key={lesson.id}
                  onClick={() => navigate(`/lessons/${lesson.id}`)}
                  whileHover={{ y: -2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  className="p-4 border border-gray-200 rounded-lg bg-white cursor-pointer transition-all"
                >
                  <h3 className="font-semibold mb-2">{lesson.title}</h3>
                  {progress && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{
                            width: `${progress.completed ? 100 : (progress.videoProgressSeconds / (lesson.totalDuration || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {progress.completed ? 'Hoàn thành' : 'Đang học'}
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500">Chưa có bài học nào</p>
        )}
      </div>

      {/* Student Ranking */}
      {ranking && ranking.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <SparklesIcon className="w-6 h-6 mr-2 text-yellow-500" />
              Bảng xếp hạng học sinh
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Hạng</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Tên học sinh</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Số sao</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((student, index) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b bg-white hover:bg-gray-50 transition-all"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {index === 0 && <TrophyIcon className="w-5 h-5 text-yellow-500 mr-2" />}
                        {index === 1 && <TrophyIcon className="w-5 h-5 text-gray-400 mr-2" />}
                        {index === 2 && <TrophyIcon className="w-5 h-5 text-orange-500 mr-2" />}
                        <span className={`font-semibold ${index < 3 ? 'text-lg' : ''}`}>
                          {index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">{student.name}</td>
                    <td className="py-3 px-4 text-gray-600">{student.email}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {Array.from({ length: student.stars }).map((_, i) => (
                          <StarIcon key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        ))}
                        {Array.from({ length: Math.max(0, 20 - student.stars) }).map((_, i) => (
                          <StarIcon key={i} className="w-5 h-5 text-gray-300" />
                        ))}
                        <span className="ml-2 font-semibold text-gray-700">{student.stars}</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.button
          onClick={() => navigate('/lessons')}
          whileHover={{ y: -2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          className="p-6 bg-white rounded-lg transition-all text-left border border-gray-200"
        >
          <BookOpenIcon className="w-8 h-8 text-blue-600 mb-2" />
          <h3 className="font-semibold">Bài học</h3>
          <p className="text-sm text-gray-600">Xem tất cả bài học</p>
        </motion.button>

        <motion.button
          onClick={() => navigate('/assignments')}
          whileHover={{ y: -2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          className="p-6 bg-white rounded-lg transition-all text-left border border-gray-200"
        >
          <ClipboardDocumentListIcon className="w-8 h-8 text-green-600 mb-2" />
          <h3 className="font-semibold">Bài tập</h3>
          <p className="text-sm text-gray-600">Xem bài tập</p>
        </motion.button>

        <motion.button
          onClick={() => navigate('/study-time')}
          whileHover={{ y: -2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          className="p-6 bg-white rounded-lg transition-all text-left border border-gray-200"
        >
          <ClockIcon className="w-8 h-8 text-purple-600 mb-2" />
          <h3 className="font-semibold">Thời gian học</h3>
          <p className="text-sm text-gray-600">Theo dõi học tập</p>
        </motion.button>

        <motion.button
          onClick={() => navigate('/chatbot')}
          whileHover={{ y: -2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          className="p-6 bg-white rounded-lg transition-all text-left border border-gray-200"
        >
          <ChatBubbleLeftRightIcon className="w-8 h-8 text-orange-600 mb-2" />
          <h3 className="font-semibold">Chatbot</h3>
          <p className="text-sm text-gray-600">Hỏi đáp AI</p>
        </motion.button>
      </div>
    </div>
  );
};

export default NewDashboard;
