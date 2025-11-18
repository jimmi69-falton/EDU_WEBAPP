import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from 'react-query';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  HeartIcon,
  BeakerIcon,
  MoonIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const API_BASE_URL = 'http://localhost:8080/api'; // ✅ backend base

const NewChatbot = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ✅ gọi đúng endpoint backend
  const chatMutation = useMutation(
    (message) =>
      axios.post(`${API_BASE_URL}/ai/chat`, { message }, {
        headers: { 'Content-Type': 'application/json' },
      }),
    {
      onSuccess: (response) => {
        const aiText = response.data.content || response.data.reply || 'Tôi đã nhận được tin nhắn của bạn.';
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            text: aiText,
            sender: 'ai',
            timestamp: new Date(),
          },
        ]);
      },
      onError: () => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            text: '⚠️ Xin lỗi, tôi không thể trả lời lúc này. Vui lòng thử lại.',
            sender: 'ai',
            timestamp: new Date(),
            isError: true,
          },
        ]);
      },
    }
  );

  const handleSend = (msg = inputMessage) => {
    if (!msg.trim() || chatMutation.isLoading) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: msg,
        sender: 'user',
        timestamp: new Date(),
      },
    ]);
    setInputMessage('');
    chatMutation.mutate(msg);
  };

  const quickQuestions = [
    {
      icon: HeartIcon,
      text: 'Giải thích bài học về [tên bài học]',
      color: 'from-[var(--primary-600)] to-[var(--primary-700)]',
    },
    {
      icon: BeakerIcon,
      text: 'Gợi ý câu hỏi checkpoint cho video',
      color: 'from-[var(--accent-600)] to-[var(--accent-700)]',
    },
    {
      icon: FireIcon,
      text: 'Tạo quiz từ nội dung bài học',
      color: 'from-[#FB923C] to-[#F59E0B]',
    },
    {
      icon: MoonIcon,
      text: 'Cách học hiệu quả nhất?',
      color: 'from-[#8B5CF6] to-[#A78BFA]',
    },
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-4 px-6 pt-2">
        <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary-600)] to-[var(--accent-600)] rounded-xl flex items-center justify-center">
          <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="h1">{t('healthAssistant')}</h1>
          <p className="subtitle">
            {t('language') === 'vi'
              ? 'Lưu ý: Đây không phải lời khuyên y khoa chuyên môn'
              : 'Note: This is not professional medical advice'}
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 card flex flex-col overflow-hidden -mt-2">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-start text-center p-4 pt-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[var(--primary-600)] to-[var(--accent-600)] rounded-full flex items-center justify-center mb-6">
                <SparklesIcon className="w-10 h-10 text-white" />
              </div>
              <h2 className="h2 mb-3">
                {t('welcome')}, {user?.firstName}!
              </h2>
              <p className="subtitle mb-6 max-w-md">{t('askMeAnything')}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    className={`p-4 rounded-lg bg-gradient-to-br ${q.color} text-white text-left hover:shadow-lg transition-all`}
                    onClick={() => handleSend(q.text)}
                  >
                    <q.icon className="w-5 h-5 mb-2" />
                    <p className="text-sm font-medium">{q.text}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div
                    className={`max-w-[80%] ${
                      msg.sender === 'user' ? 'flex flex-row-reverse' : 'flex'
                    } items-start space-x-3`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-br from-[var(--primary-600)] to-[var(--accent-600)]'
                          : msg.isError
                          ? 'bg-[var(--status-danger)]'
                          : 'bg-gradient-to-br from-[var(--accent-600)] to-[var(--accent-700)]'
                      }`}
                    >
                      {msg.sender === 'user' ? (
                        <span className="text-white font-semibold text-xs">
                          {user?.firstName?.charAt(0)}
                        </span>
                      ) : (
                        <SparklesIcon className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-br from-[var(--primary-600)] to-[var(--accent-600)] text-white'
                          : msg.isError
                          ? 'bg-red-50 text-[var(--status-danger)] border border-red-200'
                          : 'bg-[var(--neutral-50)] text-[var(--neutral-800)] border border-[var(--neutral-200)]'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      <p
                        className={`text-xs mt-2 ${
                          msg.sender === 'user'
                            ? 'text-white/70'
                            : 'text-[var(--neutral-500)]'
                        }`}
                      >
                        {msg.timestamp.toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {chatMutation.isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-[var(--accent-600)] to-[var(--accent-700)] rounded-full flex items-center justify-center">
                      <SparklesIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-[var(--neutral-50)] rounded-2xl px-4 py-3 border border-[var(--neutral-200)]">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-[var(--neutral-400)] rounded-full animate-bounce" />
                        <div
                          className="w-2 h-2 bg-[var(--neutral-400)] rounded-full animate-bounce"
                          style={{ animationDelay: '150ms' }}
                        />
                        <div
                          className="w-2 h-2 bg-[var(--neutral-400)] rounded-full animate-bounce"
                          style={{ animationDelay: '300ms' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t divider p-6">
          <div className="flex items-center space-x-3">
            <input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) =>
                e.key === 'Enter' && !e.shiftKey && handleSend()
              }
              placeholder={t('typeMessage')}
              className="input flex-1"
              disabled={chatMutation.isLoading}
            />
            <button
              className="btn btn-primary px-4"
              onClick={() => handleSend()}
              disabled={!inputMessage.trim() || chatMutation.isLoading}
            >
              {chatMutation.isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <PaperAirplaneIcon className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-[var(--neutral-400)] text-xs mt-3 text-center">
            AI có thể mắc lỗi. Hãy tham khảo bác sĩ khi cần.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewChatbot;
