import React, { useState, ReactNode } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Clipboard, 
  BarChart2, 
  Users, 
  LogOut, 
  Menu, 
  X,
  User,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import ParticleBackground from './ParticleBackground';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const { userRole, userName, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const teacherNavItems = [
    { path: '/teacher-dashboard', name: 'Dashboard', icon: <Home size={20} /> },
    { path: '/teacher/mcq-generator', name: 'Generate MCQs', icon: <FileText size={20} /> },
    { path: '/teacher/manage-tests', name: 'Manage Tests', icon: <Clipboard size={20} /> },
    { path: '/teacher/results', name: 'View Results', icon: <BarChart2 size={20} /> },
    { path: '/teacher/students', name: 'Students', icon: <Users size={20} /> },
    { path: '/teacher/profile', name: 'Profile', icon: <User size={20} /> },
    { path: '/teacher/settings', name: 'Settings', icon: <Settings size={20} /> },
  ];

  const studentNavItems = [
    { path: '/student-dashboard', name: 'Dashboard', icon: <Home size={20} /> },
    { path: '/student/generate-mcqs', name: 'Generate MCQs', icon: <FileText size={20} /> },
    { path: '/student/tests', name: 'My Tests', icon: <Clipboard size={20} /> },
    { path: '/student/results', name: 'My Results', icon: <BarChart2 size={20} /> },
    { path: '/student/profile', name: 'Profile', icon: <User size={20} /> },
    { path: '/student/settings', name: 'Settings', icon: <Settings size={20} /> },
  ];

  const navItems = userRole === 'teacher' ? teacherNavItems : studentNavItems;

  return (
    <div className="min-h-screen bg-background">
      <ParticleBackground />
      
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 md:hidden bg-deepBlue/80 backdrop-blur-md border-b border-neonCyan/10 p-4">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="text-softWhite"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold text-neonCyan">{title}</h1>
          <div className="w-6"></div> {/* Empty div for centering title */}
        </div>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed inset-0 z-50 bg-black/50 md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <motion.div
              className="absolute top-0 left-0 bottom-0 w-64 bg-deepBlue border-r border-neonCyan/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 border-b border-neonCyan/10">
                <div className="flex items-center">
                  <div className="text-xl font-bold gradient-text">MCQGenius</div>
                </div>
                <button 
                  className="text-softWhite/70 hover:text-softWhite"
                  onClick={() => setIsMobileSidebarOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="px-2 py-4">
                <div className="mb-6 px-4 py-2 border-b border-neonCyan/10">
                  <p className="text-xs text-softWhite/50 uppercase tracking-wider mb-1">
                    {userRole === 'teacher' ? 'Teacher' : 'Student'}
                  </p>
                  <p className="text-softWhite font-semibold">{userName}</p>
                </div>

                <nav className="space-y-1">
                  {navItems.map((item, index) => (
                    <Link
                      key={`${item.path}-${index}`}
                      to={item.path}
                      className="nav-item"
                      onClick={() => setIsMobileSidebarOpen(false)}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </Link>
                  ))}

                  <button
                    onClick={handleLogout}
                    className="nav-item w-full text-left text-neonPink/80 hover:text-neonPink"
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </nav>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Layout */}
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <AnimatePresence initial={false}>
          {isSidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="hidden md:block h-screen border-r border-neonCyan/10 bg-deepBlue/80 backdrop-blur-md overflow-y-auto"
            >
              <div className="p-4 border-b border-neonCyan/10">
                <div className="text-xl font-bold gradient-text">MCQGenius</div>
              </div>

              <div className="px-2 py-4">
                <div className="mb-6 px-4 py-2 border-b border-neonCyan/10">
                  <p className="text-xs text-softWhite/50 uppercase tracking-wider mb-1">
                    {userRole === 'teacher' ? 'Teacher' : 'Student'}
                  </p>
                  <p className="text-softWhite font-semibold">{userName}</p>
                </div>

                <nav className="space-y-1">
                  {navItems.map((item, index) => {
                    const isActive = window.location.pathname === item.path;
                    return (
                      <Link
                        key={`${item.path}-${index}`}
                        to={item.path}
                        className={`nav-item ${isActive ? 'active' : ''}`}
                      >
                        {item.icon}
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}

                  <button
                    onClick={handleLogout}
                    className="nav-item w-full text-left text-neonPink/80 hover:text-neonPink"
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </nav>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Desktop Header */}
          <header className="hidden md:flex sticky top-0 z-30 h-16 items-center justify-between border-b border-neonCyan/10 bg-deepBlue/80 backdrop-blur-md px-6">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="mr-4 text-softWhite/70 hover:text-softWhite transition-colors"
              >
                <Menu size={20} />
              </button>
              <h1 className="text-xl font-bold text-softWhite">{title}</h1>
            </div>
            <div className="flex items-center">
              <div className="mr-4">
                <p className="text-sm text-softWhite/70">Welcome, <span className="text-neonCyan">{userName}</span></p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-neonPink/80 hover:text-neonPink transition-colors"
              >
                <LogOut size={18} className="mr-1" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;