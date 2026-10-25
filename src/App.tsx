import { useState, useEffect } from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider, useAuth } from './components/AuthContext';
import { HomePage } from './components/HomePage';
import { LoginPage } from './components/LoginPage';
import { StudentDashboard } from './components/StudentDashboard';
import { OrganizerDashboard } from './components/OrganizerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Navbar } from './components/Navbar';
import { Toaster } from './components/ui/sonner';
import { startAutoSync } from './utils/syncData';
import { initializeDemoData } from './utils/demoData';

function AppContent() {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  // Initialize demo data and start auto-sync when app loads
  useEffect(() => {
    initializeDemoData();
    startAutoSync();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (showLogin) {
      return <LoginPage onNavigateToHome={() => setShowLogin(false)} />;
    }
    return <HomePage onNavigateToLogin={() => setShowLogin(true)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {user.role === 'student' && <StudentDashboard />}
      {user.role === 'organizer' && <OrganizerDashboard />}
      {user.role === 'admin' && <AdminDashboard />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="clubhub-theme">
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;