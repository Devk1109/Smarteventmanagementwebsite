import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { DEMO_ORGANIZERS } from '../utils/demoData';

type UserRole = 'student' | 'organizer' | 'admin';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  googleAccessToken?: string;
  clubId?: string;
  clubName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Check for existing local session first
        const savedUser = localStorage.getItem('clubhub-user');
        if (savedUser && mounted) {
          const parsedUser = JSON.parse(savedUser);
          // Only set if it's not a Google user or if we have a valid session
          if (!parsedUser.googleAccessToken) {
            setUser(parsedUser);
          }
        }
        
        // Check for Supabase session (Google OAuth)
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
        }
        
        if (session?.user && mounted) {
          const savedRole = (localStorage.getItem('clubhub-google-role') as UserRole) || 'student';
          const googleUser: User = {
            id: session.user.id,
            name: session.user.user_metadata.full_name || 
                  session.user.user_metadata.name || 
                  session.user.email?.split('@')[0] || 
                  'User',
            email: session.user.email || '',
            role: savedRole,
            googleAccessToken: session.access_token,
          };
          setUser(googleUser);
          localStorage.setItem('clubhub-user', JSON.stringify(googleUser));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);
      
      if (event === 'SIGNED_IN' && session?.user && mounted) {
        const savedRole = (localStorage.getItem('clubhub-google-role') as UserRole) || 'student';
        const googleUser: User = {
          id: session.user.id,
          name: session.user.user_metadata.full_name || 
                session.user.user_metadata.name || 
                session.user.email?.split('@')[0] || 
                'User',
          email: session.user.email || '',
          role: savedRole,
          googleAccessToken: session.access_token,
        };
        setUser(googleUser);
        localStorage.setItem('clubhub-user', JSON.stringify(googleUser));
      } else if (event === 'SIGNED_OUT' && mounted) {
        setUser(null);
        localStorage.removeItem('clubhub-user');
        localStorage.removeItem('clubhub-google-role');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    // Validate input first
    if (!email || !password) {
      throw new Error('Please enter both email and password');
    }
    
    // Check for demo credentials first (all roles)
    if (role === 'student' && email === 'demo@student.com' && password === 'demo') {
      const demoUser: User = {
        id: 'demo-student-123',
        name: 'Demo Student',
        email: 'demo@student.com',
        role: 'student',
      };
      setUser(demoUser);
      localStorage.setItem('clubhub-user', JSON.stringify(demoUser));
      return;
    }
    
    // Check demo organizers from our DEMO_ORGANIZERS array
    if (role === 'organizer') {
      const demoOrganizer = DEMO_ORGANIZERS.find(
        org => org.email === email && org.password === password
      );
      
      if (demoOrganizer) {
        const demoUser: User = {
          id: demoOrganizer.clubId + '-organizer',
          name: demoOrganizer.name,
          email: demoOrganizer.email,
          role: 'organizer',
          clubId: demoOrganizer.clubId,
          clubName: demoOrganizer.clubName,
        };
        setUser(demoUser);
        localStorage.setItem('clubhub-user', JSON.stringify(demoUser));
        return;
      }
      
      // Fallback to old demo organizer
      if (email === 'demo@organizer.com' && password === 'demo') {
        const demoUser: User = {
          id: 'demo-organizer-123',
          name: 'Demo Organizer',
          email: 'demo@organizer.com',
          role: 'organizer',
        };
        setUser(demoUser);
        localStorage.setItem('clubhub-user', JSON.stringify(demoUser));
        return;
      }
    }
    
    if (role === 'admin' && email === 'admin@thapar.edu' && password === 'thapar123') {
      const demoUser: User = {
        id: 'demo-admin-123',
        name: 'Thapar Admin',
        email: 'admin@thapar.edu',
        role: 'admin',
      };
      setUser(demoUser);
      localStorage.setItem('clubhub-user', JSON.stringify(demoUser));
      return;
    }
    
    // For students, check localStorage first (for backward compatibility)
    if (role === 'student') {
      const accounts = JSON.parse(localStorage.getItem('clubhub-accounts') || '[]');
      const account = accounts.find((acc: any) => acc.email === email && acc.password === password);
      
      if (account) {
        const newUser: User = {
          id: account.id,
          name: account.name,
          email: account.email,
          role: 'student',
        };
        setUser(newUser);
        localStorage.setItem('clubhub-user', JSON.stringify(newUser));
        return;
      }
    }
    
    // Try Supabase authentication for real accounts
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase login error:', error);
        throw new Error('Invalid email or password. Please check your credentials or use demo account.');
      }

      if (data.session?.user) {
        const userData = data.session.user;
        const userRole = userData.user_metadata?.role || role;
        
        const newUser: User = {
          id: userData.id,
          name: userData.user_metadata?.name || userData.email?.split('@')[0] || 'User',
          email: userData.email || '',
          role: userRole,
          clubId: userData.user_metadata?.clubId,
          clubName: userData.user_metadata?.clubName,
        };
        
        setUser(newUser);
        localStorage.setItem('clubhub-user', JSON.stringify(newUser));
        return;
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    // Validate input
    if (!name || !email || !password) {
      throw new Error('Please fill in all fields');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    
    try {
      // Create account via our Supabase server (auto-confirms email)
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-94da7951/make-server-94da7951/auth/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ name, email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed. Please try again.');
      }

      if (data.user) {
        // Auto-login the user
        setUser(data.user);
        localStorage.setItem('clubhub-user', JSON.stringify(data.user));
        console.log('Account created successfully!');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const loginWithGoogle = async (role: UserRole) => {
    try {
      // Save the role for later use when the OAuth callback completes
      localStorage.setItem('clubhub-google-role', role);
      
      // Initiate Google OAuth with calendar scope
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/calendar.events',
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Google login error:', error);
        localStorage.removeItem('clubhub-google-role');
        throw new Error(error.message || 'Failed to login with Google. Please try again.');
      }

      // The user will be redirected to Google's OAuth page
      console.log('Redirecting to Google OAuth...');
    } catch (error) {
      console.error('Google login exception:', error);
      localStorage.removeItem('clubhub-google-role');
      throw error;
    }
  };

  const logout = async () => {
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    setUser(null);
    localStorage.removeItem('clubhub-user');
    localStorage.removeItem('clubhub-google-role');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}