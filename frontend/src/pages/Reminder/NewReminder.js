import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BellIcon,
  PlusIcon,
  PencilSquareIcon,
  PowerIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BeakerIcon,
  FireIcon, 
  MoonIcon,
  CalendarDaysIcon,
  Bars3Icon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import Modal from '../../components/UI/Modal';
import { useLanguage } from '../../contexts/LanguageContext';
import { notifications } from '../../utils/notifications';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../api'; 
import LoadingSpinner from '../../components/UI/LoadingSpinner'; 

// (Các hàm helper 'toYYYYMMDD' và 'getReminderTypeDetails' giữ nguyên)
const toYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const monthStr = String(date.getMonth() + 1).padStart(2, '0');
  const dayStr = String(date.getDate()).padStart(2, '0');
  return `${year}-${monthStr}-${dayStr}`;
};
const getReminderTypeDetails = (type) => {
  switch (type) {
    case 'medication':
      return { 
        Icon: BeakerIcon, 
        colorClass: 'bg-[var(--status-danger)]', 
        textClass: 'text-[var(--status-danger)]',
        calendarBg: 'bg-red-100',
        calendarText: 'text-red-800'
      };
    case 'workout':
      return { 
        Icon: FireIcon, 
        colorClass: 'bg-[var(--status-healthy)]', 
        textClass: 'text-[var(--status-healthy)]',
        calendarBg: 'bg-green-100',
        calendarText: 'text-green-800'
      };
    case 'sleep': 
      return { 
        Icon: MoonIcon, 
        colorClass: 'bg-[var(--purple-600)]', 
        textClass: 'text-[var(--purple-700)]',
        calendarBg: 'bg-purple-100',
        calendarText: 'text-purple-800'
      };
    default: // 'general'
      return { 
        Icon: BellIcon, 
        colorClass: 'bg-[var(--status-info)]', 
        textClass: 'text-[var(--status-info)]',
        calendarBg: 'bg-sky-100',
        calendarText: 'text-sky-800'
      };
  }
};


const NewReminder = () => {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient(); 

  // (Giữ nguyên các state)
  const [monthDays, setMonthDays] = useState([]);
  const [leading, setLeading] = useState(0);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const todayString = useMemo(() => toYYYYMMDD(new Date()), []);
  const [selectedDateString, setSelectedDateString] = useState(todayString);
  const [todaySummary, setTodaySummary] = useState({ total: 0, medication: 0, workout: 0, sleep: 0 });
  const [viewMode, setViewMode] = useState('calendar');
  const [confirmDeleteModal, setConfirmDeleteModal] = useState({ isOpen: false, event: null });

  // (Giữ nguyên useQuery)
  const { data: allReminders = [], isLoading: isLoadingReminders } = useQuery('reminders', 
    async () => {
      const response = await api.get('/health/reminders'); 
      return response.data;
    },
    {
      onError: () => {
        notifications.actionFailed(t('fetchReminders') || 'Tải nhắc nhở thất bại');
      }
    }
  );

  // --- SỬA LỖI 1: Đảm bảo TẤT CẢ các mutation đều làm mới 'healthStats' ---
  
  // Hàm helper để làm mới cache
  const invalidateCaches = () => {
    queryClient.invalidateQueries('reminders');
    queryClient.invalidateQueries('healthStats'); // Đây là chìa khóa
  };

  const toggleReminderMutation = useMutation(
    async ({ id, enabled }) => {
      const reminderToUpdate = allReminders.find(r => r.id === id);
      await api.put(`/health/reminders/${id}`, { ...reminderToUpdate, enabled });
    },
    {
      onMutate: async ({ id, enabled }) => {
        enabled ? notifications.reminderEnabled() : notifications.reminderDisabled();
        await queryClient.cancelQueries('reminders');
        const previousReminders = queryClient.getQueryData('reminders');
        queryClient.setQueryData('reminders', (oldData) =>
          oldData.map(r =>
            r.id === id ? { ...r, enabled: enabled } : r
          )
        );
        return { previousReminders };
      },
      onError: (err, variables, context) => {
        queryClient.setQueryData('reminders', context.previousReminders);
        notifications.actionFailed(t('updateReminder') || 'Cập nhật thất bại');
      },
      onSettled: () => {
        invalidateCaches(); // Luôn làm mới cả hai
      },
    }
  );

  const deleteReminderMutation = useMutation(
    async ({ id, deleteType = 'instance' }) => {
      await api.delete(`/health/reminders/${id}`, { params: { deleteType } });
    },
    {
      onMutate: async ({ id, deleteType }) => {
        notifications.reminderDeleted(); 
        setConfirmDeleteModal({ isOpen: false, event: null });
        await queryClient.cancelQueries('reminders');
        const previousReminders = queryClient.getQueryData('reminders');
        queryClient.setQueryData('reminders', (oldData) => {
          if (deleteType === 'instance') {
            return oldData.filter(r => r.id !== id);
          } else {
            const event = oldData.find(r => r.id === id);
            if (event && event.seriesId) {
              return oldData.filter(r => r.seriesId !== event.seriesId);
            }
            return oldData.filter(r => r.id !== id);
          }
        });
        return { previousReminders };
      },
      onError: (err, variables, context) => {
        queryClient.setQueryData('reminders', context.previousReminders);
        notifications.actionFailed(t('deleteReminder') || 'Xóa thất bại');
      },
      onSettled: () => {
        invalidateCaches(); // Luôn làm mới cả hai
      },
    }
  );

  const createReminderMutation = useMutation(
    async (newReminder) => {
      await api.post('/health/reminders', newReminder);
    },
    {
      onSuccess: () => {
        invalidateCaches(); // Luôn làm mới cả hai
        notifications.reminderCreated();
        setModalOpen(false);
      },
      onError: () => notifications.actionFailed(t('createReminder') || 'Tạo thất bại'),
    }
  );

  const updateReminderMutation = useMutation(
    async (updatedReminder) => {
      await api.put(`/health/reminders/${updatedReminder.id}`, updatedReminder);
    },
    {
      onSuccess: () => {
        invalidateCaches(); // Luôn làm mới cả hai
        notifications.reminderUpdated();
        setModalOpen(false);
      },
      onError: () => notifications.actionFailed(t('updateReminder') || 'Cập nhật thất bại'),
    }
  );
  // --- HẾT SỬA LỖI 1 ---


  // (Toàn bộ phần code còn lại của file NewReminder.js (useEffect, logic, JSX) được giữ nguyên)
  // ...
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const leadingCount = (firstDayOfMonth.getDay() + 6) % 7;
    const newMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = toYYYYMMDD(new Date(year, month, i));
      const remindersForThisDay = allReminders.filter(r => r.date === dateStr); 
      newMonthDays.push({ day: i, date: dateStr, items: remindersForThisDay });
    }
    setLeading(leadingCount);
    setMonthDays(newMonthDays);
    const today = new Date();
    if (month === today.getMonth() && year === today.getFullYear()) {
      const remindersForToday = allReminders.filter(r => r.date === todayString);
      setTodaySummary({
        total: remindersForToday.length,
        medication: remindersForToday.filter(r => r.type === 'medication').length,
        workout: remindersForToday.filter(r => r.type === 'workout').length,
        sleep: remindersForToday.filter(r => r.type === 'sleep').length,
      });
    } else {
      setTodaySummary({ total: 0, medication: 0, workout: 0, sleep: 0 });
    }
  }, [currentDate, allReminders, todayString]);

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

  const selectedDayReminders = useMemo(() => {
    const day = monthDays.find(d => d.date === selectedDateString);
    return day ? (day.items || []) : [];
  }, [selectedDateString, monthDays]);

  const formattedSelectedDate = useMemo(() => {
    if (selectedDateString === todayString) return t('today');
    const date = new Date(selectedDateString + 'T00:00:00');
    return date.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  }, [selectedDateString, todayString, t, language]); 

  const groupedReminders = useMemo(() => {
    const futureReminders = allReminders.filter(r => r.date >= todayString).sort((a, b) => new Date(a.date) - new Date(b.date));
    return futureReminders.reduce((acc, reminder) => {
      const date = reminder.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(reminder);
      return acc;
    }, {});
  }, [allReminders, todayString]);

  const toggleReminder = async (id, enabled) => {
    toggleReminderMutation.mutate({ id, enabled });
  };

  const deleteReminder = (id) => {
    const eventToDelete = allReminders.find(r => r.id === id);
    if (!eventToDelete) return;
    if (eventToDelete.seriesId) setConfirmDeleteModal({ isOpen: true, event: eventToDelete });
    else {
      if (window.confirm(t('deleteReminderConfirmation'))) {
        deleteReminderMutation.mutate({ id, deleteType: 'instance' });
      }
    }
  };

  const handleDeleteConfirm = (deleteType) => {
    const event = confirmDeleteModal.event;
    deleteReminderMutation.mutate({ id: event.id, deleteType });
  };

  const openCreateModal = () => {
    setEditing({ id: null, title: '', date: selectedDateString, time: '08:00:00', enabled: true, repeat: 'none', endDate: selectedDateString, type: 'general', seriesId: null });
    setModalOpen(true);
  };

  const openEditModal = (reminder) => {
    setEditing({ ...reminder, repeat: reminder.repeat || 'none', endDate: reminder.endDate || reminder.date, type: reminder.type || 'general', seriesId: reminder.seriesId || null });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...editing, time: editing.time.length === 5 ? editing.time + ':00' : editing.time };
    const isLoading = createReminderMutation.isLoading || updateReminderMutation.isLoading;
    if (isLoading) return; 
    if (payload.id) { 
      updateReminderMutation.mutate(payload);
    } else { 
      createReminderMutation.mutate(payload);
    }
  };

  if (isLoadingReminders) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner />
        <span className="ml-4 text-lg text-gray-700">{t('loading') || 'Đang tải...'}</span>
      </div>
    );
  }

  // ... (Phần JSX - return) ...
  return (
    <div className="space-y-6">
      {/* Header (Giữ nguyên) */}
      <div className="flex items-center justify-between">
        <h1 className="h1">{t('myReminders')}</h1>
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg" onClick={() => setViewMode(viewMode === 'calendar' ? 'list' : 'calendar')}>
            {viewMode === 'calendar' ? <Bars3Icon className="w-6 h-6 text-gray-600" /> : <CalendarIcon className="w-6 h-6 text-gray-600" />}
          </button>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <PlusIcon className="w-5 h-5 mr-2" /> {t('createReminder')}
          </button>
        </div>
      </div>

      {/* 4 Thẻ Tóm Tắt Mới (Giữ nguyên) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-[var(--neutral-500)] text-sm mb-2">{t('today')}</p>
            <CalendarDaysIcon className="w-6 h-6 text-[var(--primary-600)]" />
          </div>
          <p className="text-3xl font-bold text-[var(--primary-600)]">{todaySummary.total}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-[var(--neutral-500)] text-sm mb-2">{t('medication')}</p>
            <BeakerIcon className="w-6 h-6 text-[var(--status-danger)]" />
          </div>
          <p className="text-3xl font-bold text-[var(--status-danger)]">{todaySummary.medication}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-[var(--neutral-500)] text-sm mb-2">{t('exercise')}</p>
            <FireIcon className="w-6 h-6 text-[var(--status-healthy)]" />
          </div>
          <p className="text-3xl font-bold text-[var(--status-healthy)]">{todaySummary.workout}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-[var(--neutral-500)] text-sm mb-2">{t('bedtime')}</p>
            <MoonIcon className="w-6 h-6 text-[var(--purple-600)]" />
          </div>
          <p className="text-3xl font-bold text-[var(--purple-600)]">{todaySummary.sleep}</p>
        </div>
      </div>

      {/* Conditional Rendering: Calendar View (Giữ nguyên) */}
      {viewMode === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar (Giữ nguyên) */}
          <div className="card p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="h2">{t('myReminders')}</h2>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>
                  <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
                </button>
                <span className="text-sm font-semibold text-gray-700 min-w-[120px] text-center">
                {currentDate.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>
                  <ChevronRightIcon className="w-5 h-5 text-gray-600" />
                </button>
                <button className="btn btn-secondary text-xs py-2 px-3" onClick={() => setCurrentDate(new Date())}>
                  {t('today')}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-3">
            {(language === 'vi' ? ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']).map(d => (
                <div key={d} className="text-center text-sm font-semibold text-gray-600 pb-2"> {d} </div>
              ))}
              {Array.from({ length: leading }, (_, i) => (<div key={'e' + i} />))}
              {monthDays.map((dayObj) => {
                const reminders = dayObj.items || [];
                const hasReminders = reminders.length > 0;
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
                  if (hasReminders) {
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
                    title={reminders.map(r => r.title).join(', ')}
                  >
                    {isToday && (
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-accent-500"></div>
                    )}
                    <div className="absolute top-1.5 right-1.5">
                      <span className={`text-sm font-semibold w-6 h-6 flex items-center justify-center rounded-full transition-colors ${isSelected ? 'bg-primary-600 text-white' : (isToday ? 'text-primary-700 font-bold' : 'text-gray-600 group-hover:text-primary-600')
                       }`}>
                        {dayObj.day}
                      </span>
                    </div>
                    <div className="absolute top-8 left-1.5 right-1.5 flex flex-col space-y-0.5">
                      {reminders.slice(0, 2).map(r => {
                        const { colorClass, calendarBg, calendarText } = getReminderTypeDetails(r.type);
                        return (
                           <div key={r.id} className={`${calendarBg} rounded px-1.5 py-px w-full`} title={r.title}>
                             <div className="flex items-center space-x-1.5">
                               <div className={`w-1.5 h-1.5 rounded-full ${colorClass} flex-shrink-0`} />
                               <div className="flex-1 min-w-0">
                                 <p className={`truncate text-[11px] font-medium ${calendarText}`}>
                                   {r.title}
                                 </p>
                               </div>
                             </div>
                           </div>
                        );
                      })}
                      {reminders.length > 2 && (
                        <div className="text-[10px] font-semibold text-gray-500 pl-1">
                          + {reminders.length - 2} {t('more')}
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* CỘT BÊN PHẢI (DANH SÁCH NHẮC NHỞ) (Giữ nguyên) */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="h3">{formattedSelectedDate}</h2>
              <button className="btn btn-secondary text-xs py-2 px-3" onClick={() => openCreateModal()}>
                <PlusIcon className="w-4 h-4 mr-1" /> {t('create')}
              </button>
            </div>
            <div className="space-y-3">
              <AnimatePresence>
                {selectedDayReminders.map(r => {
                  const { Icon, textClass } = getReminderTypeDetails(r.type);
                  return (
                    <motion.div key={r.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                      <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className={`flex items-center space-x-2 ${textClass}`}>
                              <Icon className="w-5 h-5" />
                              <p className="font-semibold text-gray-800">{r.title}</p>
                            </div>
                            <p className="text-sm text-gray-500 mt-1 ml-7">{r.time?.slice(0, 5)}</p>
                          </div>
                          <span className={`badge ${r.enabled ? 'badge-healthy' : 'badge-neutral'}`}>
                            {t('enabled')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <button className="btn btn-secondary text-xs py-2 w-full" onClick={() => openEditModal(r)}>
                              <PencilSquareIcon className="w-4 h-4 mr-1" /> {t('edit')}
                            </button>
                            <button 
                              className={`btn text-xs py-2 w-full ${r.enabled ? 'btn-success' : 'btn-secondary'}`} 
                              onClick={() => toggleReminder(r.id, !r.enabled)}
                              disabled={toggleReminderMutation.isLoading} 
                            >
                              <PowerIcon className="w-4 h-4 mr-1" /> 
                              {t('enabled')}
                            </button>
                          </div>
                          <button 
                            className="p-2 hover:bg-red-100 text-red-600 rounded-lg" 
                            onClick={() => deleteReminder(r.id)}
                            disabled={deleteReminderMutation.isLoading} 
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {selectedDayReminders.length === 0 && (
                <div className="text-center py-12">
                  <BellIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">{t('noReminder')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Conditional Rendering: List View (Giữ nguyên) */}
      {viewMode === 'list' && (
        <div className="card p-6">
          <h2 className="h2 mb-6">{t('allReminders')}</h2>
          <div className="space-y-6">
            {Object.keys(groupedReminders).length === 0 && (
              <div className="text-center py-12">
                <BellIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Không có nhắc nhở nào sắp tới.</p>
              </div>
            )}
            {Object.keys(groupedReminders).map(dateStr => {
              const reminders = groupedReminders[dateStr];
              const dateObj = new Date(dateStr + 'T00:00:00');
              const formattedDate = dateObj.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' });
              return (
                <div key={dateStr}>
                  <h3 className="h3 mb-3">{formattedDate} {dateStr === todayString ? `(${t('today')})` : ''}</h3>
                  <div className="space-y-3">
                    {reminders.map(r => {
                      const { Icon, textClass } = getReminderTypeDetails(r.type);
                      return (
                        <div key={r.id} className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className={`flex items-center space-x-2 ${textClass}`}>
                                <Icon className="w-5 h-5" />
                                <p className="font-semibold text-gray-800">{r.title}</p>
                              </div>
                              <p className="text-sm text-gray-500 mt-1 ml-7">{r.time?.slice(0, 5)}</p>
                            </div>
                            <span className={`badge ${r.enabled ? 'badge-healthy' : 'badge-neutral'}`}>
                              {t('enabled')}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <button className="btn btn-secondary text-xs py-2 w-full" onClick={() => openEditModal(r)}>
                                <PencilSquareIcon className="w-4 h-4 mr-1" /> {t('edit')}
                              </button>
                              <button 
                                className={`btn text-xs py-2 w-full ${r.enabled ? 'btn-success' : 'btn-secondary'}`} 
                                onClick={() => toggleReminder(r.id, !r.enabled)}
                                disabled={toggleReminderMutation.isLoading} 
                              >
                                <PowerIcon className="w-4 h-4 mr-1" /> 
                                {t('enabled')}
                              </button>
                            </div>
                            <button 
                              className="p-2 hover:bg-red-100 text-red-600 rounded-lg" 
                              onClick={() => deleteReminder(r.id)}
                              disabled={deleteReminderMutation.isLoading} 
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

      {/* MODAL (Tạo/Sửa) (Giữ nguyên) */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing?.id ? t('editReminder') : t('createReminder')}>
        {editing && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('reminderMessage')}</label>
              <input className="input" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder={t('reminderTitle')} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{editing.repeat === 'none' ? t('medicalHistory.day') : t('startDate')}</label>
                <input type="date" className="input" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('selectTime')}</label>
                <input type="time" className="input" value={(editing.time || '').slice(0, 5)} onChange={(e) => setEditing({ ...editing, time: e.target.value })} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('reminderType')}</label>
                <select className="input" value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })}>
                  <option value="general">{t('general')}</option>
                  <option value="medication">{t('medication')}</option>
                  <option value="workout">{t('exercise')}</option>
                  <option value="sleep">{t('bedtime')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('repeat')}</label>
                <select className="input" value={editing.repeat} onChange={(e) => setEditing({ ...editing, repeat: e.target.value })}>
                  <option value="none">{t('never')}</option>
                  <option value="daily">{t('daily')}</option>
                  <option value="weekly">{t('weekly')}</option>
                </select>
              </div>
            </div>
            {editing.repeat !== 'none' && (
              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('endDate')}</label>
                <input type="date" className="input" value={editing.endDate} onChange={(e) => setEditing({ ...editing, endDate: e.target.value })} required min={editing.date} />
              </div>
            )}
            {editing.id && editing.seriesId && (
              <p className="text-xs text-gray-500">Lưu ý: Chỉnh sửa một sự kiện lặp sẽ tách nó ra khỏi chuỗi.</p>
            )}
            <div>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-600" checked={!!editing.enabled} onChange={(e) => setEditing({ ...editing, enabled: e.target.checked })} />
                <span className="text-sm text-gray-700">{t('enabled')}</span>
              </label>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>{t('cancel')}</button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={createReminderMutation.isLoading || updateReminderMutation.isLoading} 
              >
                {(createReminderMutation.isLoading || updateReminderMutation.isLoading) ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  editing.id ? t('update') : t('create')
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL XÁC NHẬN XÓA LẶP (Giữ nguyên) */}
      <Modal isOpen={confirmDeleteModal.isOpen} onClose={() => setConfirmDeleteModal({ isOpen: false, event: null })} title={t('deleteRecurringReminderTitle')} size="sm">
        <p className="text-gray-600 mb-6">{t('deleteRecurringReminderPrompt')} "{confirmDeleteModal.event?.title}"?</p>
        <div className="flex flex-col space-y-3">
          <button 
            type="button" 
            className="btn btn-danger w-full" 
            onClick={() => handleDeleteConfirm('series')}
            disabled={deleteReminderMutation.isLoading} 
          >
            {deleteReminderMutation.isLoading ? <LoadingSpinner size="sm"/> : t('deleteAllOccurrences')}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary w-full" 
            onClick={() => handleDeleteConfirm('instance')}
            disabled={deleteReminderMutation.isLoading} 
          >
             {deleteReminderMutation.isLoading ? <LoadingSpinner size="sm"/> : t('deleteThisOccurrenceOnly')}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default NewReminder;