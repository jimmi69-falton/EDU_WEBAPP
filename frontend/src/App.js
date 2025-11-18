import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider , useTheme} from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { NotificationProvider, useNotifications } from './contexts/NotificationContext';
import { QueryClient, QueryClientProvider } from 'react-query';
import { setNotificationManager } from './utils/notifications';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import NewSidebar from './components/Layout/NewSidebar';
import Topbar from './components/Layout/Topbar';
import LoadingSpinner from './components/UI/LoadingSpinner';

// Pages
import NewLogin from './pages/Auth/NewLogin';
import Register from './pages/Auth/Register';
import NewDashboard from './pages/Dashboard/NewDashboard';
import NewChatbot from './pages/AI/NewChatbot';
import Lessons from './pages/Lessons/Lessons';
import LessonDetail from './pages/Lessons/LessonDetail';
import Assignments from './pages/Assignments/Assignments';
import AssignmentDetail from './pages/Assignments/AssignmentDetail';
import Calendar from './pages/Calendar/Calendar';
import StudyTime from './pages/StudyTime/StudyTime';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';
// Teacher Pages
import LessonManager from './pages/Teacher/LessonManager';
import StudentProgress from './pages/Teacher/StudentProgress';
import CheckpointEditor from './pages/Teacher/CheckpointEditor';
// Admin Pages
import UserManagement from './pages/Admin/UserManagement';
// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function AppContent() {
  const { user, loading } = useAuth();
  const notificationManager = useNotifications();
  const { theme } = useTheme();

  // Set the global notification manager
  React.useEffect(() => {
    if (notificationManager) {
      setNotificationManager(notificationManager);
    }
  }, [notificationManager]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Public routes (no auth required)
  if (!user) {
    return (
      <div 
        className="min-h-screen bg-no-repeat bg-cover bg-center"
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
      >
        <Routes>
          <Route path="/login" element={<NewLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#FFFFFF',
              border: '1px solid var(--neutral-200)',
              borderRadius: '12px',
              color: 'var(--neutral-800)',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#22C55E',
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: 'white',
              },
            },
          }}
        />
      </div>
    );
  }

  // Protected routes (auth required)
  return (
    <div
      key={theme}
      className="min-h-screen bg-no-repeat bg-cover bg-center transition-all duration-500"
      style={{
        backgroundImage: `url(${theme === 'dark' ? '/bg-dark2.jpg'  : '/bg-light2.jpg'})`,
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <NewSidebar />
        
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden ml-4">
          {/* Topbar */}
          <Topbar />
          
          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-6 bg-transparent">
            <div className="max-w-7xl mx-auto">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<NewDashboard />} />
                
                {/* Student Routes */}
                <Route path="/lessons" element={<Lessons />} />
                <Route path="/lessons/:id" element={<LessonDetail />} />
                <Route path="/assignments" element={<Assignments />} />
                <Route path="/assignments/:id" element={<AssignmentDetail />} />
                <Route path="/study-time" element={<StudyTime />} />
                
                {/* Teacher Routes */}
                <Route path="/teacher/lessons" element={<LessonManager />} />
                <Route path="/teacher/lessons/:lessonId/progress" element={<StudentProgress />} />
                <Route path="/teacher/lessons/:lessonId/checkpoints" element={<CheckpointEditor />} />
                
                {/* Admin Routes */}
                <Route path="/admin/users" element={<UserManagement />} />
                
                {/* Common Routes */}
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/chatbot" element={<NewChatbot />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
      
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#FFFFFF',
            border: '1px solid var(--neutral-200)',
            borderRadius: '12px',
            color: 'var(--neutral-800)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#22C55E',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: 'white',
            },
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <ThemeProvider>
            <LanguageProvider>
              <NotificationProvider>
                <AuthProvider>
                  <AppContent />
                </AuthProvider>
              </NotificationProvider>
            </LanguageProvider>
          </ThemeProvider>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

