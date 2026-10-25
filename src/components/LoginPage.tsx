import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useAuth } from './AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LogIn, ArrowLeft, UserCircle, Users, ShieldCheck, Mail, Lock, Eye, EyeOff, Sun, Moon, Calendar, User } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { Checkbox } from './ui/checkbox';
import { DEMO_ORGANIZERS } from '../utils/demoData';

interface LoginPageProps {
  onNavigateToHome?: () => void;
}

export function LoginPage({ onNavigateToHome }: LoginPageProps) {
  const { login, signup } = useAuth();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [credentials, setCredentials] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleLogin = async (role: 'student' | 'organizer' | 'admin') => {
    setLoading(true);
    setError('');
    try {
      await login(credentials.email, credentials.password, role);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    setError('');
    try {
      await signup(credentials.name, credentials.email, credentials.password);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Signup failed');
      console.error('Signup failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create animated stars/particles
  useEffect(() => {
    const createStar = () => {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 3}s`;
      star.style.animationDuration = `${2 + Math.random() * 3}s`;
      document.querySelector('.stars-container')?.appendChild(star);
    };

    // Create multiple stars
    for (let i = 0; i < 50; i++) {
      createStar();
    }
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-800 to-orange-700 dark:from-purple-950 dark:via-pink-900 dark:to-orange-800" />
      
      {/* Animated stars/particles container */}
      <div className="stars-container absolute inset-0" />
      
      {/* Silhouette overlay - mountains and trees */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 300" className="w-full h-auto">
          <path d="M0,300 L0,150 Q200,80 400,120 T800,100 L1200,140 L1200,300 Z" fill="rgba(0,0,0,0.3)" />
          <path d="M0,300 L0,200 Q300,150 600,180 T1200,200 L1200,300 Z" fill="rgba(0,0,0,0.5)" />
        </svg>
      </div>

      {/* Back button */}
      {onNavigateToHome && (
        <div className="absolute top-6 left-6 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={onNavigateToHome}
            className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      )}
      
      {/* Theme toggle */}
      <div className="absolute top-6 right-6 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20"
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center md:justify-end p-4 md:pr-20">
        <div className="w-full max-w-md">
          {/* Logo and title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Calendar className="h-12 w-12 text-white drop-shadow-lg" />
              <h1 className="text-5xl font-bold text-white drop-shadow-lg">ClubHub</h1>
            </div>
            <p className="text-white/90 drop-shadow-md">
              Smart Event & Club Management Platform
            </p>
          </div>

          {/* Glassmorphism card */}
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20">
            <Tabs 
              defaultValue="student" 
              className="w-full"
              onValueChange={() => {
                setCredentials({ name: '', email: '', password: '' });
                setError('');
                setIsSignup(false);
              }}
            >
              {/* Custom styled tabs */}
              <div className="flex gap-2 mb-8 bg-white/5 p-1 rounded-xl">
                <TabsList className="w-full bg-transparent grid grid-cols-3 gap-1">
                  <TabsTrigger 
                    value="student" 
                    className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 rounded-lg transition-all"
                  >
                    Student
                  </TabsTrigger>
                  <TabsTrigger 
                    value="organizer"
                    className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 rounded-lg transition-all"
                  >
                    Organizer
                  </TabsTrigger>
                  <TabsTrigger 
                    value="admin"
                    className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 rounded-lg transition-all"
                  >
                    Admin
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="student" className="space-y-5">
                <h2 className="text-2xl font-bold text-white text-center mb-6">
                  {isSignup ? 'Create Account' : 'Login'}
                </h2>

                {error && (
                  <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 text-white p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {isSignup && (
                  <div className="space-y-2">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                      <Input
                        type="text"
                        placeholder="Full Name"
                        value={credentials.name}
                        onChange={(e) => setCredentials({ ...credentials, name: e.target.value })}
                        className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-white/40 rounded-xl h-12"
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={credentials.email}
                      onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                      className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-white/40 rounded-xl h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={credentials.password}
                      onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                      className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-white/40 rounded-xl h-12"
                    />
                  </div>
                </div>

                {!isSignup && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="remember" 
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        className="border-white/30 data-[state=checked]:bg-white/20 data-[state=checked]:border-white/40"
                      />
                      <label htmlFor="remember" className="text-white/80 cursor-pointer">
                        Remember Me
                      </label>
                    </div>
                    <button type="button" className="text-white/80 hover:text-white transition-colors">
                      Forgot Password?
                    </button>
                  </div>
                )}

                <Button
                  onClick={isSignup ? handleSignup : () => handleLogin('student')}
                  disabled={loading}
                  className="w-full bg-white text-purple-900 hover:bg-white/90 rounded-full h-12 font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  {loading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Log in'}
                </Button>

                {!isSignup && (
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-3 rounded-xl text-xs text-center">
                    <p className="text-white/70 font-medium mb-1">Demo Account</p>
                    <p className="text-white/60">demo@student.com | demo</p>
                  </div>
                )}

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignup(!isSignup);
                      setError('');
                      setCredentials({ name: '', email: '', password: '' });
                    }}
                    className="text-white/90 hover:text-white transition-colors text-sm"
                  >
                    {isSignup 
                      ? 'Already have an account? Login' 
                      : "Don't have an account? Register"}
                  </button>
                </div>
              </TabsContent>

              <TabsContent value="organizer" className="space-y-5">
                <h2 className="text-2xl font-bold text-white text-center mb-6">
                  Organizer Login
                </h2>

                {error && (
                  <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 text-white p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={credentials.email}
                      onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                      className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-white/40 rounded-xl h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={credentials.password}
                      onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                      className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-white/40 rounded-xl h-12"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="remember-org" 
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      className="border-white/30 data-[state=checked]:bg-white/20 data-[state=checked]:border-white/40"
                    />
                    <label htmlFor="remember-org" className="text-white/80 cursor-pointer">
                      Remember Me
                    </label>
                  </div>
                  <button type="button" className="text-white/80 hover:text-white transition-colors">
                    Forgot Password?
                  </button>
                </div>

                <Button
                  onClick={() => handleLogin('organizer')}
                  disabled={loading}
                  className="w-full bg-white text-purple-900 hover:bg-white/90 rounded-full h-12 font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  {loading ? 'Please wait...' : 'Log in'}
                </Button>

                {/* Demo Organizer Accounts */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-xl">
                  <p className="text-white/70 font-medium mb-3 text-sm text-center">Demo Organizer Accounts</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {DEMO_ORGANIZERS.map((org) => (
                      <button
                        key={org.email}
                        type="button"
                        onClick={() => setCredentials({ name: credentials.name, email: org.email, password: org.password })}
                        className="w-full text-left p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/5 hover:border-white/20"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-white/90 font-medium text-xs truncate">{org.clubName}</p>
                            <p className="text-white/60 text-xs truncate">{org.email}</p>
                          </div>
                          <div className="text-white/50 text-xs whitespace-nowrap">
                            {org.password}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-white/50 text-xs mt-2 text-center">Click any account to auto-fill credentials</p>
                </div>
              </TabsContent>

              <TabsContent value="admin" className="space-y-5">
                <h2 className="text-2xl font-bold text-white text-center mb-6">
                  Admin Login
                </h2>

                {error && (
                  <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 text-white p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={credentials.email}
                      onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                      className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-white/40 rounded-xl h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={credentials.password}
                      onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                      className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-white/40 rounded-xl h-12"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="remember-admin" 
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      className="border-white/30 data-[state=checked]:bg-white/20 data-[state=checked]:border-white/40"
                    />
                    <label htmlFor="remember-admin" className="text-white/80 cursor-pointer">
                      Remember Me
                    </label>
                  </div>
                  <button type="button" className="text-white/80 hover:text-white transition-colors">
                    Forgot Password?
                  </button>
                </div>

                <Button
                  onClick={() => handleLogin('admin')}
                  disabled={loading}
                  className="w-full bg-white text-purple-900 hover:bg-white/90 rounded-full h-12 font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  {loading ? 'Please wait...' : 'Log in'}
                </Button>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-3 rounded-xl text-xs text-center">
                  <p className="text-white/70 font-medium mb-1">Demo Account</p>
                  <p className="text-white/60">admin@thapar.edu | thapar123</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* CSS for animated stars */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        .star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: white;
          border-radius: 50%;
          animation: twinkle linear infinite;
          box-shadow: 0 0 3px rgba(255, 255, 255, 0.8);
        }
      `}</style>
    </div>
  );
}