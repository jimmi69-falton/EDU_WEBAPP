import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  HeartIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CalendarIcon,
  DocumentTextIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ScissorsIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTheme } from "../../contexts/ThemeContext";
import Button from "../../components/UI/Button";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import Modal from "../../components/UI/Modal";
// --- MỚI: Dùng React Query và API Instance ---
import { useQuery, useMutation, useQueryClient } from "react-query";
import api from "../../api";
import { notifications } from "../../utils/notifications";
// --- HẾT CODE MỚI ---

const MedicalHistoryOverview = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    date: new Date().toISOString().split("T")[0],
    title: "",
    notes: "",
    status: "untreated",
    type: "checkup",
  });

  // --------------------------
  // 🔹 API CALL (Fetch Data)
  // --------------------------
  const { data: medicalHistory = [], isLoading: isLoadingHistory } = useQuery(
    "medicalHistory",
    async () => {
      // FIX: Endpoint đúng của Medical History là: /api/health/medical-history
      const response = await api.get("/health/medical-history");
      return response.data;
    },
    {
      select: (data) => (Array.isArray(data) ? data : data?.items || []),
    }
  );

  // --------------------------
  // 🔹 MUTATIONS (Create, Update, Delete)
  // --------------------------
  const historyMutation = useMutation(
    async (data) => {
      // FIX: Gửi lên đúng endpoint
      if (data.id) {
        await api.put(`/health/medical-history/${data.id}`, data);
      } else {
        await api.post("/health/medical-history", data);
      }
    },
    {
      onSuccess: () => {
        // Làm mới cache của trang này và Dashboard
        queryClient.invalidateQueries("medicalHistory");
        queryClient.invalidateQueries("healthStats");
        notifications.measurementAdded(); // Dùng thông báo thêm mới
        setShowModal(false);
      },
      onError: (error) => {
        console.error("Mutation Error:", error.response || error);
        notifications.actionFailed(
          t("medicalHistory.save") || "lưu lịch sử bệnh lý"
        );
      },
    }
  );

  const deleteMutation = useMutation(
    async (id) => {
      await api.delete(`/health/medical-history/${id}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("medicalHistory");
        queryClient.invalidateQueries("healthStats");
        notifications.reminderDeleted();
      },
      onError: () =>
        notifications.actionFailed(
          t("medicalHistory.delete") || "xóa lịch sử bệnh lý"
        ),
    }
  );

  // --------------------------
  // 🔹 STATS VÀ HELPERS
  // --------------------------
  const stats = useMemo(() => {
    const total = medicalHistory.length;
    // status đã được sửa trong Model MedicalHistory (completed, resolved, ongoing)
    const completed = medicalHistory.filter(
      (item) => item.status === "untreated" || item.status === "resolved"
    ).length;
    const ongoing = medicalHistory.filter(
      (item) => item.status === "ongoing"
    ).length;
    const surgeries = medicalHistory.filter(
      (item) => item.type === "surgery"
    ).length;
    return { total, completed, ongoing, surgeries };
  }, [medicalHistory]);

  const getStatusInfo = (status) => {
    switch (status) {
      case "untreated":
      case "resolved":
        return {
          color: "green",
          icon: CheckCircleIcon,
          text: t("medicalHistory.resolved") || "Đã khỏi/Hoàn thành",
        };
      case "ongoing":
        return {
          color: "yellow",
          icon: ClockIcon,
          text: t("medicalHistory.ongoing") || "Đang điều trị",
        };
      default:
        return {
          color: "gray",
          icon: ExclamationTriangleIcon,
          text: t("medicalHistory.unknown") || "Không xác định",
        };
    }
  };

  const getTypeInfo = (type) => {
    switch (type) {
      case "checkup":
        return {
          color: "blue",
          text: t("medicalHistory.typeCheckup") || "Khám sức khỏe",
        };
      case "vaccination":
        return {
          color: "green",
          text: t("medicalHistory.typeVaccination") || "Tiêm phòng",
        };
      case "symptom":
        return {
          color: "red",
          text: t("medicalHistory.typeSymptom") || "Triệu chứng",
        };
      case "allergy":
        return {
          color: "yellow",
          text: t("medicalHistory.typeAllergy") || "Dị ứng",
        };
      case "surgery":
        return {
          color: "purple",
          text: t("medicalHistory.typeSurgery") || "Phẫu thuật",
        };
      default:
        return { color: "gray", text: t("medicalHistory.typeOther") || "Khác" };
    }
  };

  // --------------------------
  // 🔹 HANDLERS
  // --------------------------
  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      date: new Date().toISOString().split("T")[0],
      title: "",
      notes: "",
      status: "untreated",
      type: "checkup",
    });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      id: item.id,
      date: item.date, // Backend trả về LocalDate String
      title: item.title,
      notes: item.notes || "",
      status: item.status || "untreated",
      type: item.type || "checkup",
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      id: editingItem ? editingItem.id : null,
    };
    historyMutation.mutate(payload);
  };

  const handleDelete = (id) => {
    if (
      window.confirm(
        t("medicalHistory.confirmDelete") || "Bạn có chắc chắn muốn xóa không?"
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoadingHistory) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`rounded-xl p-6 shadow-sm ${
          theme === "dark"
            ? "bg-[var(--glass-bg-primary)] border-[var(--glass-border)]"
            : "bg-white border border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
              {t("medicalHistory.title") || "Lịch sử Bệnh lý"}
            </h1>
            <p className="text-[var(--text-secondary)]">
              {t("medicalHistory.subtitle") ||
                "Quản lý các sự kiện y tế quan trọng."}
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={openCreateModal}
            disabled={historyMutation.isLoading}
          >
            {historyMutation.isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <PlusIcon className="w-5 h-5 mr-2" />
            )}{" "}
            {t("medicalHistory.addNew") || "Thêm mới"}
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
        >
          <div
            className={`rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow ${
              theme === "dark"
                ? "bg-[var(--glass-bg-primary)] border-[var(--glass-border)]"
                : "bg-white border border-gray-200"
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary-600)] to-[var(--primary-700)] flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)]">
                  {t("medicalHistory.total") || "Tổng số"}
                </p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          <div
            className={`rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow ${
              theme === "dark"
                ? "bg-[var(--glass-bg-primary)] border-[var(--glass-border)]"
                : "bg-white border border-gray-200"
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-600)] to-[var(--accent-700)] flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)]">
                  {t("medicalHistory.completed") || "Hoàn thành"}
                </p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {stats.completed}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.15 }}
        >
          <div
            className={`rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow ${
              theme === "dark"
                ? "bg-[var(--glass-bg-primary)] border-[var(--glass-border)]"
                : "bg-white border border-gray-200"
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)]">
                  {t("medicalHistory.ongoing") || "Đang điều trị"}
                </p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {stats.ongoing}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.2 }}
        >
          <div
            className={`rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow ${
              theme === "dark"
                ? "bg-[var(--glass-bg-primary)] border-[var(--glass-border)]"
                : "bg-white border border-gray-200"
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#FACC15] flex items-center justify-center">
                <ScissorsIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)]">
                  {t("medicalHistory.surgery") || "Phẫu thuật"}
                </p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {stats.surgeries}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Medical History List */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.25 }}
      >
        <div
          className={`rounded-xl p-6 shadow-sm ${
            theme === "dark"
              ? "bg-[var(--glass-bg-primary)] border-[var(--glass-border)]"
              : "bg-white border border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              {t("medicalHistory.listTitle") || "Các Bản Ghi Y Tế"}
            </h2>
          </div>

          <div className="space-y-4">
            {medicalHistory.length === 0 ? (
              <div className="text-center py-12">
                <DocumentTextIcon className="w-16 h-16 mx-auto text-[var(--neutral-500)] mb-4" />
                <p className="text-[var(--text-secondary)] mb-4">
                  {t("medicalHistory.noData") || "Chưa có bản ghi nào."}
                </p>
                <Button onClick={openCreateModal} icon={PlusIcon}>
                  {t("medicalHistory.addFirst") || "Thêm bản ghi đầu tiên"}
                </Button>
              </div>
            ) : (
              medicalHistory.map((item, index) => {
                const statusInfo = getStatusInfo(item.status);
                const typeInfo = getTypeInfo(item.type);
                const StatusIcon = statusInfo.icon;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15, delay: 0.3 + index * 0.05 }}
                    className={`rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 ${
                      theme === "dark"
                        ? "bg-[var(--glass-bg-primary)] border-[var(--glass-border)] hover:border-[var(--glass-border-light)]"
                        : "bg-white border border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div
                            className={`w-3 h-3 rounded-full bg-${statusInfo.color}-500`}
                          />
                          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                            {item.title}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium bg-${typeInfo.color}-100 text-${typeInfo.color}-800`}
                          >
                            {typeInfo.text}
                          </span>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-[var(--text-secondary)] mb-3">
                          <div className="flex items-center space-x-2">
                            <CalendarIcon className="w-4 h-4" />
                            <span>
                              {new Date(item.date).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <StatusIcon className="w-4 h-4" />
                            <span>{statusInfo.text}</span>
                          </div>
                        </div>

                        {item.notes && (
                          <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                            {item.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openEditModal(item)}
                          icon={PencilIcon}
                          disabled={
                            historyMutation.isLoading ||
                            deleteMutation.isLoading
                          }
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          icon={TrashIcon}
                          disabled={
                            historyMutation.isLoading ||
                            deleteMutation.isLoading
                          }
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </motion.div>

      {/* Modal for Add/Edit */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          editingItem
            ? t("medicalHistory.editTitle") || "Chỉnh sửa"
            : t("medicalHistory.addTitle") || "Thêm mới"
        }
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                {t("medicalHistory.date") || "Ngày"}
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="glass-input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                {t("medicalHistory.typeLabel") &&
                !t("medicalHistory.typeLabel").startsWith("medicalHistory.")
                  ? t("medicalHistory.typeLabel")
                  : t("medicalHistory.type") || "Loại"}
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="glass-input w-full"
                required
              >
                <option value="checkup">
                  {t("medicalHistory.typeCheckup")}
                </option>
                <option value="vaccination">
                  {t("medicalHistory.typeVaccination")}
                </option>
                <option value="symptom">
                  {t("medicalHistory.typeSymptom")}
                </option>
                <option value="allergy">
                  {t("medicalHistory.typeAllergy")}
                </option>
                <option value="surgery">
                  {t("medicalHistory.typeSurgery")}
                </option>
                <option value="other">{t("medicalHistory.typeOther")}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              {t("medicalHistory.titleLabel") || "Tiêu đề"}
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="glass-input w-full"
              placeholder={
                t("medicalHistory.titlePlaceholder") ||
                "Ví dụ: Cảm cúm, Khám tổng quát"
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              {t("medicalHistory.status") || "Trạng thái"}
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="glass-input w-full"
              required
            >
              <option value="untreated">{t("medicalHistory.untreated")}</option>
              <option value="resolved">{t("medicalHistory.resolved")}</option>
              <option value="ongoing">{t("medicalHistory.ongoing")}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              {t("medicalHistory.notes") || "Ghi chú"}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={4}
              className="glass-input w-full resize-none"
              placeholder={
                t("medicalHistory.notesPlaceholder") ||
                "Ghi chú chi tiết về tình trạng hoặc điều trị"
              }
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
              disabled={historyMutation.isLoading}
            >
              {t("medicalHistory.cancel") || "Hủy"}
            </Button>
            <Button type="submit" disabled={historyMutation.isLoading}>
              {historyMutation.isLoading ? (
                <LoadingSpinner size="sm" />
              ) : editingItem ? (
                t("medicalHistory.update")
              ) : (
                t("medicalHistory.add")
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MedicalHistoryOverview;
