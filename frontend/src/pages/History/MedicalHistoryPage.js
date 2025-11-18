import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useLanguage } from '../../contexts/LanguageContext';
import { ClipboardDocumentListIcon, CheckCircleIcon, ScissorsIcon } from '@heroicons/react/24/outline';



const MedicalHistoryPage = () => {
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ id: null, date: '', title: '', notes: '' });
  const [loading, setLoading] = useState(false);

  const stats = useMemo(() => {
    const total = items.length;
    const completed = items.filter(item => item.status === 'completed' || item.status === 'resolved').length;
    const ongoing = items.filter(item => item.status === 'ongoing').length;
    const surgeries = items.filter(item => item.type === 'surgery').length;
    return { total, completed, ongoing, surgeries };
  }, [items]);

  const load = async () => {
    const res = await axios.get('/health/history');
    setItems(res.data.items || []);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (form.id) {
        await axios.put(`/health/history/${form.id}`, { date: form.date, title: form.title, notes: form.notes });
      } else {
        await axios.post('/health/history', { date: form.date, title: form.title, notes: form.notes });
      }
      setForm({ id: null, date: '', title: '', notes: '' });
      await load();
    } finally {
      setLoading(false);
    }
  };

  const editItem = (item) => setForm({ id: item.id, date: item.date, title: item.title, notes: item.notes || '' });
  const deleteItem = async (id) => { await axios.delete(`/health/history/${id}`); await load(); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="h1">{t('healthOverview')}</h1>
      </div>


        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Card 1: Tổng số (Màu giống card 'Hoàn thành' bên Fitness) */}
      <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary-600)] to-[var(--primary-700)] rounded-xl flex items-center justify-center">
              <ClipboardDocumentListIcon className="w-6 h-6 text-white" />
          </div>
            <span className="text-3xl font-bold text-[var(--primary-600)]">{stats.total}</span>
          </div>
          <h3 className="text-lg font-semibold text-[var(--neutral-800)]">Tổng số</h3>
          </div>

        {/* Card 2: Hoàn thành (Màu giống card 'Calo đốt cháy' bên Fitness) */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[var(--accent-600)] to-[var(--accent-700)] rounded-xl flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-[var(--accent-600)]">{stats.completed}</span>
          </div>
          <h3 className="text-lg font-semibold text-[var(--neutral-800)]">Hoàn thành</h3>
      </div>

        {/* Card 3: Đang điều trị (Màu giống card 'Phút tập luyện' bên Fitness) */}
      <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[var(--accent-600)] to-[var(--accent-700)] rounded-xl flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-white" />
                </div>
            <span className="text-3xl font-bold text-[var(--accent-600)]">{stats.completed}</span>
                </div>
          <h3 className="text-lg font-semibold text-[var(--neutral-800)]">Hoàn thành</h3>
              </div>

        {/* Card 4: Phẫu thuật (Màu giống card 'Đánh giá TB' bên Fitness & Icon mới) */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#F59E0B] to-[#FACC15] rounded-xl flex items-center justify-center">
              <ScissorsIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-[#F59E0B]">{stats.surgeries}</span>
          </div>
          <h3 className="text-lg font-semibold text-[var(--neutral-800)]">Phẫu thuật</h3>
        </div>
      </div>
    </div>
  );
};

export default MedicalHistoryPage;


