import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../utils/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ClockIcon, PlayIcon, StopIcon, ChartBarIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

const StudyTime = () => {
  const [isStudying, setIsStudying] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const queryClient = useQueryClient();
  const intervalRef = useRef(null);

  const { data: stats, isLoading, refetch: refetchStats } = useQuery(
    'studyStats', 
    async () => {
      const response = await api.get('/student/study/stats');
      console.log('Study stats fetched:', response.data);
      return response.data;
    },
    {
      refetchOnMount: true, // Always refetch when component mounts
      refetchOnWindowFocus: true, // Refetch when window gets focus
      staleTime: 0, // Always consider data stale to ensure fresh data
      cacheTime: 0, // Don't cache, always fetch fresh data
    }
  );

  // Real-time timer
  useEffect(() => {
    if (isStudying && startTime) {
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000); // Update every second

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      setElapsedTime(0);
    }
  }, [isStudying, startTime]);

  // Format time helper
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return {
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
    };
  };

  // Calculate total time including current session (only when studying)
  const getTotalTodayMinutes = () => {
    const baseMinutes = stats?.todayMinutes || 0;
    if (isStudying) {
      const currentSessionMinutes = Math.floor(elapsedTime / 60);
      return baseMinutes + currentSessionMinutes;
    }
    return baseMinutes; // When not studying, use server value
  };

  const getTotalTodaySeconds = () => {
    const baseSeconds = (stats?.todayMinutes || 0) * 60;
    if (isStudying) {
      return baseSeconds + elapsedTime;
    }
    return baseSeconds; // When not studying, use server value
  };

  const startMutation = useMutation(
    () => api.post('/student/study/start'),
    {
      onSuccess: () => {
        setIsStudying(true);
        setStartTime(Date.now());
        setElapsedTime(0);
        toast.success('Bắt đầu học!');
        queryClient.invalidateQueries('studyStats');
      },
    }
  );

  const stopMutation = useMutation(
    (seconds) => api.post('/student/study/stop', { seconds }),
    {
      onSuccess: async (response, variables) => {
        const savedSeconds = variables; // seconds passed to mutation
        const savedMinutes = Math.floor(savedSeconds / 60);
        const remainingSeconds = savedSeconds % 60;
        setIsStudying(false);
        setStartTime(null);
        setElapsedTime(0);
        
        // Wait a bit for DB to commit, then refetch stats
        setTimeout(async () => {
          await refetchStats();
        }, 500);
        
        if (remainingSeconds > 0) {
          toast.success(`Đã lưu ${savedMinutes} phút ${remainingSeconds} giây học tập!`);
        } else {
          toast.success(`Đã lưu ${savedMinutes} phút học tập!`);
        }
      },
      onError: (error) => {
        console.error('Error stopping study:', error);
        console.error('Error response:', error.response?.data);
        toast.error(error.response?.data?.message || error.message || 'Lỗi khi lưu thời gian học');
      },
    }
  );

  const handleStart = () => {
    startMutation.mutate();
  };

  const handleStop = () => {
    if (startTime) {
      const elapsedMs = Date.now() - startTime;
      // Calculate exact seconds
      const seconds = Math.floor(elapsedMs / 1000);
      console.log('Stopping study session:', seconds, 'seconds (', Math.floor(seconds / 60), 'minutes', seconds % 60, 'seconds)');
      
      // Only save if at least 1 second
      if (seconds >= 1) {
        stopMutation.mutate(seconds);
      } else {
        setIsStudying(false);
        setStartTime(null);
        setElapsedTime(0);
        toast.info('Thời gian học quá ngắn, không được lưu.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const currentTime = formatTime(elapsedTime);
  const totalTodayTime = formatTime(getTotalTodaySeconds());
  
  // Get stats from DB (always use DB values when not studying)
  // Handle both old format (minutes) and new format (seconds) for backward compatibility
  const totalSeconds = stats?.totalSeconds || (stats?.totalMinutes ? stats.totalMinutes * 60 : 0);
  const totalTime = formatTime(totalSeconds);
  const todaySeconds = stats?.todaySeconds || (stats?.todayMinutes ? stats.todayMinutes * 60 : 0);
  const todayTime = formatTime(todaySeconds);
  const studyDays = stats?.studyDays || 0;
  
  // Debug: log stats to see what we're getting
  console.log('Current stats:', {
    totalSeconds,
    todaySeconds,
    studyDays,
    stats
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="h1">Theo dõi thời gian học</h1>
      </div>

      {/* Timer Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <div className="text-center space-y-6">
          {!isStudying ? (
            <motion.button
              onClick={handleStart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-6 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 text-xl font-semibold shadow-lg flex items-center justify-center space-x-3 mx-auto"
            >
              <PlayIcon className="w-6 h-6" />
              <span>Bắt đầu học</span>
            </motion.button>
          ) : (
            <div className="space-y-6">
              <div className="text-2xl font-semibold text-green-600 flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span>Đang học...</span>
              </div>
              
              {/* Real-time Clock */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <ClockIcon className="w-8 h-8 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-700">Phiên học hiện tại</h3>
                </div>
                <div className="flex items-center justify-center space-x-4">
                  <motion.div
                    key={currentTime.hours}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="bg-white rounded-xl p-4 shadow-lg min-w-[80px] border border-gray-200"
                  >
                    <div className="text-4xl font-bold text-blue-600">{currentTime.hours}</div>
                    <div className="text-xs text-gray-500 mt-1">GIỜ</div>
                  </motion.div>
                  <div className="text-4xl font-bold text-gray-400">:</div>
                  <motion.div
                    key={currentTime.minutes}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="bg-white rounded-xl p-4 shadow-lg min-w-[80px] border border-gray-200"
                  >
                    <div className="text-4xl font-bold text-blue-600">{currentTime.minutes}</div>
                    <div className="text-xs text-gray-500 mt-1">PHÚT</div>
                  </motion.div>
                  <div className="text-4xl font-bold text-gray-400">:</div>
                  <motion.div
                    key={currentTime.seconds}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="bg-white rounded-xl p-4 shadow-lg min-w-[80px] border border-gray-200"
                  >
                    <div className="text-4xl font-bold text-blue-600">{currentTime.seconds}</div>
                    <div className="text-xs text-gray-500 mt-1">GIÂY</div>
                  </motion.div>
                </div>
              </div>

              <motion.button
                onClick={handleStop}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-6 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 text-xl font-semibold shadow-lg flex items-center justify-center space-x-3 mx-auto"
              >
                <StopIcon className="w-6 h-6" />
                <span>Dừng học</span>
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Cards - Only show when NOT studying */}
      {!isStudying && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Study Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <ChartBarIcon className="w-8 h-8 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Tổng thời gian học</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline space-x-2">
                  <p key={`total-hours-${totalTime.hours}`} className="text-4xl font-bold text-blue-600">{totalTime.hours}</p>
                  <span className="text-xl text-gray-600">:</span>
                  <p key={`total-minutes-${totalTime.minutes}`} className="text-4xl font-bold text-blue-600">{totalTime.minutes}</p>
                  <span className="text-xl text-gray-600">:</span>
                  <p key={`total-seconds-${totalTime.seconds}`} className="text-4xl font-bold text-blue-600">{totalTime.seconds}</p>
                </div>
                <p className="text-sm text-gray-600">
                  ({Math.floor(totalSeconds / 60)} phút {totalSeconds % 60} giây)
                </p>
              </div>
            </div>
          </motion.div>

          {/* Today's Study Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <ClockIcon className="w-8 h-8 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-800">Hôm nay</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline space-x-2">
                  <motion.p
                    key={`today-hours-${todayTime.hours}`}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-4xl font-bold text-green-600"
                  >
                    {todayTime.hours}
                  </motion.p>
                  <span className="text-xl text-gray-600">:</span>
                  <motion.p
                    key={`today-minutes-${todayTime.minutes}`}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-4xl font-bold text-green-600"
                  >
                    {todayTime.minutes}
                  </motion.p>
                  <span className="text-xl text-gray-600">:</span>
                  <motion.p
                    key={`today-seconds-${todayTime.seconds}`}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-4xl font-bold text-green-600"
                  >
                    {todayTime.seconds}
                  </motion.p>
                </div>
                <p className="text-sm text-gray-600">
                  ({Math.floor(todaySeconds / 60)} phút {todaySeconds % 60} giây)
                </p>
              </div>
            </div>
          </motion.div>

          {/* Study Days */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <CalendarDaysIcon className="w-8 h-8 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-800">Số ngày học</h3>
              </div>
              <p className="text-4xl font-bold text-purple-600">
                {studyDays}
              </p>
              <p className="text-sm text-gray-600 mt-2">ngày</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default StudyTime;

