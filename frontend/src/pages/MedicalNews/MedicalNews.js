import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  NewspaperIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  UserIcon,
  HeartIcon,
  ShieldCheckIcon,
  BeakerIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  ArrowRightIcon,
  CalendarIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { useTheme } from "../../contexts/ThemeContext";
import { useLanguage } from "../../contexts/LanguageContext";
// --- MỚI: Dùng API Instance chung ---
import api from "../../api"; 
import LoadingSpinner from "../../components/UI/LoadingSpinner";
// --- HẾT CODE MỚI ---

// --- HÀM HELPER (Giữ nguyên) ---
const formatTimeAgo = (isoDate, t) => {
  if (!isoDate) return '';
  const now = new Date();
  const date = new Date(isoDate);
  const seconds = Math.floor((now - date) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ` ${t('yearAgo') || 'năm trước'}`;
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ` ${t('monthAgo') || 'tháng trước'}`;
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ` ${t('dayAgo') || 'ngày trước'}`;
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ` ${t('hourAgo') || 'giờ trước'}`;
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ` ${t('minuteAgo') || 'phút trước'}`;
  return Math.floor(seconds) + ` ${t('secondAgo') || 'giây trước'}`;
};
// --- HẾT HÀM HELPER ---


const MedicalNews = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  // Giữ lại state category và sort để dùng cho Filter UI
  const [selectedCategory, setSelectedCategory] = useState("all"); 
  const [sortBy, setSortBy] = useState("latest");

  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- MỚI: XÓA DỮ LIỆU MẪU FALLBACK (Không cần thiết) ---
  // const fallbackNewsData = [ ... ];
  // --- HẾT CODE MỚI ---

  // --------------------------
  // 🔹 GỌI API BACKEND (ĐÃ SỬA LỖI)
  // --------------------------
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);

        // --- SỬA LỖI: Sử dụng API instance và gọi đúng endpoint ---
        const response = await api.get("/news", {
          params: {
             // Backend đang tìm theo q=health, nên ta truyền search term vào q
             q: searchTerm || 'health', 
             pageSize: 20 // Lấy nhiều hơn 
          },
        });
        // --- HẾT SỬA LỖI ---

        const mapped = response.data.map((item, index) => ({
          id: `news-${index + 1}`,
          title: item.title,
          summary: item.description || "Không có tóm tắt.",
          content: item.description,
          author: item.source?.name || "Nguồn tin", // Lấy source.name
          publishDate: item.publishedAt,
          category: selectedCategory !== "all" ? selectedCategory : "general",
          readTime: "5 phút",
          
          // --- SỬA LỖI 1: Sửa item.imageUrl -> item.urlToImage ---
          image: item.urlToImage, 
          // --- HẾT SỬA LỖI 1 ---
          
          url: item.url,
          tags: [selectedCategory],
        }));

        setNewsData(mapped);
      } catch (err) {
        console.error("Lỗi tải tin tức:", err);
        setError("Không thể tải dữ liệu tin tức. Vui lòng kiểm tra API key hoặc kết nối.");
        setNewsData([]); // Đặt rỗng nếu lỗi
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  // Kích hoạt lại khi searchTerm thay đổi
  }, [selectedCategory, searchTerm]); 

  // --------------------------
  // 🔹 FILTER + SORT
  // --------------------------
  const filteredNews = useMemo(() => {
    let filtered = newsData;

    // Lọc theo Category (chỉ lọc nếu không phải 'all', không cần gọi lại API)
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(news => news.category === selectedCategory || news.tags.includes(selectedCategory));
    }
    
    // Tìm kiếm đã được tích hợp vào useEffect (search term)
    // if (searchTerm) { ... } 

    // Sắp xếp
    if (sortBy === "latest") {
      filtered.sort(
        (a, b) => new Date(b.publishDate) - new Date(a.publishDate)
      );
    } else if (sortBy === "oldest") {
      filtered.sort(
        (a, b) => new Date(a.publishDate) - new Date(b.publishDate)
      );
    }

    return filtered;
  }, [newsData, searchTerm, sortBy, selectedCategory]);

  // --------------------------
  // 🔹 CATEGORY DANH MỤC (Giữ nguyên)
  // --------------------------
  const categories = [
    { id: "all", name: t("allCategories") || "Tất cả" },
    { id: "fitness", name: t("fitnessCategory") || "Thể dục" },
    { id: "technology", name: t("technologyCategory") || "Công nghệ" },
    { id: "nutrition", name: t("nutritionCategory") || "Dinh dưỡng" },
    { id: "mental-health", name: t("mentalHealthCategory") || "Tâm lý" },
    { id: "vaccines", name: t("vaccinesCategory") || "Vaccine" },
  ];

  // --------------------------
  // 🔹 COMPONENT CARD (ĐÃ SỬA LỖI ẢNH)
  // --------------------------
  const NewsCard = ({ news }) => (
    <motion.div
      className={`p-6 rounded-xl shadow-lg border cursor-pointer transition-all duration-300 ${
        theme === "dark"
          ? "bg-[var(--glass-bg-primary)] border-[var(--glass-border)]"
          : "bg-white border-gray-200"
      }`}
      whileHover={{ y: -3, scale: 1.01 }}
      onClick={() => window.open(news.url, "_blank")}
    >
      <div className="w-full h-48 mb-4 rounded-lg overflow-hidden">
        <img
          src={
            // --- SỬA LỖI ẢNH: Đã dùng news.image (vốn đã được fix thành urlToImage) ---
            // Thêm logic kiểm tra ảnh lỗi hoặc ảnh mẫu
            (news.image && news.image !== 'null' && !news.image.includes('sitemap')) ? news.image : 
            "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400"
          }
          alt={news.title}
          className="w-full h-full object-cover"
        />
      </div>
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2 line-clamp-2">
        {news.title}
      </h3>
      <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-3">
        {news.summary}
      </p>
      <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
        <div className="flex items-center">
          <UserIcon className="w-4 h-4 mr-1" />
          {news.author}
        </div>
        <div className="flex items-center">
          <CalendarIcon className="w-4 h-4 mr-1" />
          {formatTimeAgo(news.publishDate, t)}
        </div>
      </div>
    </motion.div>
  );

  // --------------------------
  // 🔹 RENDER CHÍNH
  // --------------------------
  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* HEADER */}
      <div
        className={`p-6 rounded-xl shadow-lg border ${
          theme === "dark"
            ? "bg-[var(--glass-bg-primary)] border-[var(--glass-border)]"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
            <NewspaperIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              {t('medicalNews')}
            </h1>
            <p className="text-[var(--text-secondary)]">
              {t('updatenew')}
            </p>
          </div>
        </div>
      </div>

      {/* SEARCH + FILTER */}
      <div
        className={`p-6 rounded-xl shadow-lg border ${
          theme === "dark"
            ? "bg-[var(--glass-bg-primary)] border-[var(--glass-border)]"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm tin tức..."
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-[var(--neutral-100)] border border-[var(--neutral-200)] text-sm outline-none focus:ring-2 focus:ring-[var(--primary-200)]"
            />
            <MagnifyingGlassIcon className="w-5 h-5 text-[var(--neutral-500)] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Category */}
          <div className="lg:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[var(--neutral-100)] border border-[var(--neutral-200)] text-sm outline-none focus:ring-2 focus:ring-[var(--primary-200)]"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="lg:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[var(--neutral-100)] border border-[var(--neutral-200)] text-sm outline-none focus:ring-2 focus:ring-[var(--primary-200)]"
            >
              <option value="latest">{t('latest')}</option>
              <option value="oldest">{t('oldest')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* NỘI DUNG */}
      {loading ? (
        <div className="flex justify-center py-12">
          {/* Thay spinner tự custom bằng LoadingSpinner chung */}
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div
          className={`p-8 rounded-xl text-center border ${
            theme === "dark"
              ? "bg-[var(--glass-bg-primary)] border-[var(--glass-border)]"
              : "bg-white border-gray-200"
          }`}
        >
          <p className="text-red-500 mb-2">{error}</p>
          <p className="text-[var(--text-secondary)]">
            Vui lòng thử tải lại trang hoặc kiểm tra kết nối.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((news) => (
            <NewsCard key={news.id} news={news} />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default MedicalNews;