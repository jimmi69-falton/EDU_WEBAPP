import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDaysIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Bars3Icon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import Modal from '../../components/UI/Modal';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { notifications } from '../../utils/notifications';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../utils/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const toYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const monthStr = String(date.getMonth() + 1).padStart(2, '0');
  const dayStr = String(date.getDate()).padStart(2, '0');
  return `${year}-${monthStr}-${dayStr}`;
};

const Calendar = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [monthDays, setMonthDays] = useState([]);
  const [leading, setLeading] = useState(0);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const todayString = useMemo(() => toYYYYMMDD(new Date()), []);
  const [selectedDateString, setSelectedDateString] = useState(todayString);
  const [viewMode, setViewMode] = useState('calendar');

  // Fetch calendar events
  const { data: allEvents = [], isLoading: isLoadingEvents } = useQuery(
    'calendar',
    async () => {
      const response = await api.get('/calendar');
      return response.data;
    },
    {
      onError: () => {
        toast.error('Tải lịch học thất bại');
      },
    }
  );

  const createEventMutation = useMutation(
    (data) => api.post('/calendar', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('calendar');
        setModalOpen(false);
        resetEditing();
        toast.success('Tạo lịch học thành công!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Tạo lịch học thất bại');
      },
    }
  );

  const updateEventMutation = useMutation(
    ({ id, data }) => api.put(`/calendar/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('calendar');
        setModalOpen(false);
        resetEditing();
        toast.success('Cập nhật lịch học thành công!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật lịch học thất bại');
      },
    }
  );

  const deleteEventMutation = useMutation(
    (id) => api.delete(`/calendar/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('calendar');
        toast.success('Xóa lịch học thành công!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Xóa lịch học thất bại');
      },
    }
  );

  const resetEditing = () => {
    // Parse selectedDateString thành local date (YYYY-MM-DD)
    // Không cần parse qua Date object, dùng trực tiếp string
    const dateStr = selectedDateString || todayString;
    const timeStr = '08:00';
    
    setEditing({
      id: null,
      title: '',
      description: '',
      date: dateStr,
      startTime: timeStr,
      endTime: timeStr,
      assignedTo: user?.role === 'teacher' ? 'all' : 'user',
    });
  };

  // Calculate month days
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const adjustedStartingDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1; // Monday = 0

    setLeading(adjustedStartingDay);

    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateStr = toYYYYMMDD(date);
      const dayEvents = allEvents.filter((event) => {
        // Parse ISO string và lấy local date để so sánh đúng
        const eventDate = new Date(event.startTime);
        const eventDateStr = toYYYYMMDD(eventDate);
        return eventDateStr === dateStr;
      });

      days.push({
        day: i,
        date: dateStr,
        items: dayEvents,
      });
    }

    setMonthDays(days);
  }, [currentDate, allEvents]);

  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();
    if (month === today.getMonth() && year === today.getFullYear()) {
      setSelectedDateString(todayString);
    } else {
      setSelectedDateString(toYYYYMMDD(new Date(year, month, 1)));
    }
  }, [currentDate, todayString]);

  const selectedDayEvents = useMemo(() => {
    const day = monthDays.find((d) => d.date === selectedDateString);
    return day ? day.items || [] : [];
  }, [selectedDateString, monthDays]);

  const formattedSelectedDate = useMemo(() => {
    if (selectedDateString === todayString) return 'Hôm nay';
    const date = new Date(selectedDateString + 'T00:00:00');
    return date.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [selectedDateString, todayString, language]);

  const groupedEvents = useMemo(() => {
    const futureEvents = allEvents
      .filter((e) => {
        // Parse ISO string và so sánh local date
        const eventDate = new Date(e.startTime);
        const eventDateStr = toYYYYMMDD(eventDate);
        return eventDateStr >= todayString;
      })
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    return futureEvents.reduce((acc, event) => {
      // Parse ISO string và lấy local date string
      const eventDate = new Date(event.startTime);
      const date = toYYYYMMDD(eventDate);
      if (!acc[date]) acc[date] = [];
      acc[date].push(event);
      return acc;
    }, {});
  }, [allEvents, todayString]);

  const openCreateModal = () => {
    resetEditing();
    setModalOpen(true);
  };

  const openEditModal = (event) => {
    // Parse date từ ISO string và convert sang local time để hiển thị đúng
    const eventDate = new Date(event.startTime);
    const eventEndDate = new Date(event.endTime);
    
    // Lấy local date và time (tránh timezone shift)
    const localDate = toYYYYMMDD(eventDate);
    const localStartTime = String(eventDate.getHours()).padStart(2, '0') + ':' + 
                          String(eventDate.getMinutes()).padStart(2, '0');
    const localEndTime = String(eventEndDate.getHours()).padStart(2, '0') + ':' + 
                         String(eventEndDate.getMinutes()).padStart(2, '0');
    
    setEditing({
      id: event.id,
      title: event.title,
      description: event.description || '',
      date: localDate,
      startTime: localStartTime,
      endTime: localEndTime,
      assignedTo: event.assignedTo || 'user',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Format date/time string không có timezone để tránh lùi ngày
    // Format: "YYYY-MM-DDTHH:mm:ss" (không có timezone)
    const formatDateTime = (dateStr, timeStr) => {
      return `${dateStr}T${timeStr}:00`;
    };
    
    const payload = {
      title: editing.title,
      description: editing.description,
      startTime: formatDateTime(editing.date, editing.startTime),
      endTime: formatDateTime(editing.date, editing.endTime),
      assignedTo: editing.assignedTo,
    };

    if (editing.id) {
      updateEventMutation.mutate({ id: editing.id, data: payload });
    } else {
      createEventMutation.mutate(payload);
    }
  };

  const deleteEvent = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa lịch học này?')) {
      deleteEventMutation.mutate(id);
    }
  };

  const formatTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoadingEvents) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner />
        <span className="ml-4 text-lg text-gray-700">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="h1">Lịch học</h1>
        <div className="flex items-center space-x-2">
          <button
            className="p-2 hover:bg-gray-100 rounded-lg"
            onClick={() => setViewMode(viewMode === 'calendar' ? 'list' : 'calendar')}
          >
            {viewMode === 'calendar' ? (
              <Bars3Icon className="w-6 h-6 text-gray-600" />
            ) : (
              <CalendarIcon className="w-6 h-6 text-gray-600" />
            )}
          </button>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <PlusIcon className="w-5 h-5 mr-2" /> Tạo lịch học
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-[var(--neutral-500)] text-sm mb-2">Hôm nay</p>
            <CalendarDaysIcon className="w-6 h-6 text-[var(--primary-600)]" />
          </div>
          <p className="text-3xl font-bold text-[var(--primary-600)]">
            {selectedDayEvents.length}
          </p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-[var(--neutral-500)] text-sm mb-2">Lịch cá nhân</p>
            <UserIcon className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {allEvents.filter((e) => e.assignedTo === 'user').length}
          </p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-[var(--neutral-500)] text-sm mb-2">Lịch chung</p>
            <UserGroupIcon className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">
            {allEvents.filter((e) => e.assignedTo === 'all').length}
          </p>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="card p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="h2">Lịch học</h2>
              <div className="flex items-center space-x-2">
                <button
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() =>
                    setCurrentDate(
                      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
                    )
                  }
                >
                  <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
                </button>
                <span className="text-sm font-semibold text-gray-700 min-w-[120px] text-center">
                  {currentDate.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <button
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() =>
                    setCurrentDate(
                      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
                    )
                  }
                >
                  <ChevronRightIcon className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  className="btn btn-secondary text-xs py-2 px-3"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Hôm nay
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-3">
              {(language === 'vi'
                ? ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
                : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
              ).map((d) => (
                <div key={d} className="text-center text-sm font-semibold text-gray-600 pb-2">
                  {d}
                </div>
              ))}
              {Array.from({ length: leading }, (_, i) => (
                <div key={'e' + i} />
              ))}
              {monthDays.map((dayObj) => {
                const events = dayObj.items || [];
                const hasEvents = events.length > 0;
                const isToday = dayObj.date === todayString;
                const isSelected = dayObj.date === selectedDateString;
                let dayClasses = `
                  relative h-[88px] overflow-hidden rounded-lg p-1.5
                  text-left transition-all duration-200 border group
                `;
                if (isSelected) {
                  dayClasses += ' bg-primary-50 border-primary-500 shadow-md scale-105';
                } else {
                  dayClasses += ' border-gray-200 hover:border-primary-300 hover:bg-primary-50';
                  if (hasEvents) {
                    dayClasses += ' bg-sky-50';
                  } else {
                    dayClasses += ' bg-white';
                  }
                }
                return (
                  <motion.button
                    key={dayObj.date}
                    className={dayClasses}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedDateString(dayObj.date)}
                    title={events.map((e) => e.title).join(', ')}
                  >
                    {isToday && (
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-accent-500"></div>
                    )}
                    <div className="absolute top-1.5 right-1.5">
                      <span
                        className={`text-sm font-semibold w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
                          isSelected
                            ? 'bg-primary-600 text-white'
                            : isToday
                            ? 'text-primary-700 font-bold'
                            : 'text-gray-600 group-hover:text-primary-600'
                        }`}
                      >
                        {dayObj.day}
                      </span>
                    </div>
                    <div className="absolute top-8 left-1.5 right-1.5 flex flex-col space-y-0.5">
                      {events.slice(0, 2).map((event) => {
                        const isPersonal = event.assignedTo === 'user';
                        const bgColor = isPersonal ? 'bg-blue-100' : 'bg-green-100';
                        const textColor = isPersonal ? 'text-blue-800' : 'text-green-800';
                        return (
                          <div
                            key={event.id}
                            className={`${bgColor} rounded px-1.5 py-px w-full`}
                            title={event.title}
                          >
                            <div className="flex items-center space-x-1.5">
                              <div
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isPersonal ? 'bg-blue-600' : 'bg-green-600'
                                } flex-shrink-0`}
                              />
                              <div className="flex-1 min-w-0">
                                <p className={`truncate text-[11px] font-medium ${textColor}`}>
                                  {event.title}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {events.length > 2 && (
                        <div className="text-[10px] font-semibold text-gray-500 pl-1">
                          + {events.length - 2} thêm
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Right Column - Event List */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="h3">{formattedSelectedDate}</h2>
              <button
                className="btn btn-secondary text-xs py-2 px-3"
                onClick={openCreateModal}
              >
                <PlusIcon className="w-4 h-4 mr-1" /> Tạo
              </button>
            </div>
            <div className="space-y-3">
              <AnimatePresence>
                {selectedDayEvents.map((event) => {
                  const isPersonal = event.assignedTo === 'user';
                  return (
                    <motion.div
                      key={event.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              {isPersonal ? (
                                <UserIcon className="w-5 h-5 text-blue-600" />
                              ) : (
                                <UserGroupIcon className="w-5 h-5 text-green-600" />
                              )}
                              <p className="font-semibold text-gray-800">{event.title}</p>
                            </div>
                            <div className="flex items-center space-x-2 mt-1 ml-7 text-sm text-gray-500">
                              <ClockIcon className="w-4 h-4" />
                              <span>
                                {formatTime(event.startTime)} - {formatTime(event.endTime)}
                              </span>
                            </div>
                            {event.description && (
                              <p className="text-sm text-gray-600 mt-1 ml-7">
                                {event.description}
                              </p>
                            )}
                          </div>
                          <span
                            className={`badge ${
                              isPersonal ? 'badge-info' : 'badge-healthy'
                            }`}
                          >
                            {isPersonal ? 'Cá nhân' : 'Chung'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <button
                              className="btn btn-secondary text-xs py-2 w-full"
                              onClick={() => openEditModal(event)}
                            >
                              <PencilSquareIcon className="w-4 h-4 mr-1" /> Sửa
                            </button>
                          </div>
                          <button
                            className="p-2 hover:bg-red-100 text-red-600 rounded-lg"
                            onClick={() => deleteEvent(event.id)}
                            disabled={deleteEventMutation.isLoading}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {selectedDayEvents.length === 0 && (
                <div className="text-center py-12">
                  <CalendarDaysIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Không có lịch học nào cho ngày này</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="card p-6">
          <h2 className="h2 mb-6">Tất cả lịch học</h2>
          <div className="space-y-6">
            {Object.keys(groupedEvents).length === 0 && (
              <div className="text-center py-12">
                <CalendarDaysIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Không có lịch học nào sắp tới.</p>
              </div>
            )}
            {Object.keys(groupedEvents).map((dateStr) => {
              const events = groupedEvents[dateStr];
              const dateObj = new Date(dateStr + 'T00:00:00');
              const formattedDate = dateObj.toLocaleDateString(
                language === 'vi' ? 'vi-VN' : 'en-US',
                { weekday: 'long', day: 'numeric', month: 'long' }
              );
              return (
                <div key={dateStr}>
                  <h3 className="h3 mb-3">
                    {formattedDate} {dateStr === todayString ? '(Hôm nay)' : ''}
                  </h3>
                  <div className="space-y-3">
                    {events.map((event) => {
                      const isPersonal = event.assignedTo === 'user';
                      return (
                        <div key={event.id} className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                {isPersonal ? (
                                  <UserIcon className="w-5 h-5 text-blue-600" />
                                ) : (
                                  <UserGroupIcon className="w-5 h-5 text-green-600" />
                                )}
                                <p className="font-semibold text-gray-800">{event.title}</p>
                              </div>
                              <div className="flex items-center space-x-2 mt-1 ml-7 text-sm text-gray-500">
                                <ClockIcon className="w-4 h-4" />
                                <span>
                                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                                </span>
                              </div>
                              {event.description && (
                                <p className="text-sm text-gray-600 mt-1 ml-7">{event.description}</p>
                              )}
                            </div>
                            <span
                              className={`badge ${
                                isPersonal ? 'badge-info' : 'badge-healthy'
                              }`}
                            >
                              {isPersonal ? 'Cá nhân' : 'Chung'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <button
                                className="btn btn-secondary text-xs py-2 w-full"
                                onClick={() => openEditModal(event)}
                              >
                                <PencilSquareIcon className="w-4 h-4 mr-1" /> Sửa
                              </button>
                            </div>
                            <button
                              className="p-2 hover:bg-red-100 text-red-600 rounded-lg"
                              onClick={() => deleteEvent(event.id)}
                              disabled={deleteEventMutation.isLoading}
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          resetEditing();
        }}
        title={editing?.id ? 'Sửa lịch học' : 'Tạo lịch học'}
      >
        {editing && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề
              </label>
              <input
                className="input"
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder="Nhập tiêu đề"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <textarea
                className="input"
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                placeholder="Nhập mô tả (tùy chọn)"
                rows="3"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ngày</label>
                <input
                  type="date"
                  className="input"
                  value={editing.date}
                  onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giờ bắt đầu
                </label>
                <input
                  type="time"
                  className="input"
                  value={editing.startTime}
                  onChange={(e) => setEditing({ ...editing, startTime: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giờ kết thúc
              </label>
              <input
                type="time"
                className="input"
                value={editing.endTime}
                onChange={(e) => setEditing({ ...editing, endTime: e.target.value })}
                required
              />
            </div>
            {user?.role === 'teacher' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại lịch học
                </label>
                <select
                  className="input"
                  value={editing.assignedTo}
                  onChange={(e) => setEditing({ ...editing, assignedTo: e.target.value })}
                >
                  <option value="all">Lịch chung (Tất cả học sinh)</option>
                  <option value="user">Lịch cá nhân</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Lịch chung sẽ hiển thị cho tất cả học sinh
                </p>
              </div>
            )}
            {user?.role === 'student' && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <UserIcon className="w-4 h-4 inline mr-1" />
                  Bạn chỉ có thể tạo lịch học cá nhân
                </p>
              </div>
            )}
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setModalOpen(false);
                  resetEditing();
                }}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={createEventMutation.isLoading || updateEventMutation.isLoading}
              >
                {createEventMutation.isLoading || updateEventMutation.isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : editing.id ? (
                  'Cập nhật'
                ) : (
                  'Tạo'
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Calendar;
