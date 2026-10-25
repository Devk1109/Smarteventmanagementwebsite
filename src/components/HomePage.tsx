import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Calendar, Users, QrCode, BarChart3, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface HomePageProps {
  onNavigateToLogin: () => void;
}

export function HomePage({ onNavigateToLogin }: HomePageProps) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Flowing Gradient Background - Multiple Dynamic Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 dark:from-purple-900 dark:via-pink-900 dark:to-rose-900 animate-flow"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 via-violet-500 to-purple-500 dark:from-blue-900 dark:via-violet-900 dark:to-purple-900 animate-flow-reverse animate-pulse-colors"></div>
      <div className="absolute inset-0 bg-gradient-to-bl from-fuchsia-500 via-rose-500 to-orange-500 dark:from-fuchsia-900 dark:via-rose-900 dark:to-orange-900 animate-gradient-slow animate-pulse-colors" style={{ animationDelay: '2s' }}></div>
      <div className="absolute inset-0 bg-gradient-to-tl from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 animate-gradient-reverse-slow animate-pulse-colors" style={{ animationDelay: '4s' }}></div>
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 dark:from-cyan-900 dark:via-blue-900 dark:to-violet-500 animate-flow" style={{ animationDelay: '6s' }}></div>
      <div className="absolute inset-0 backdrop-blur-3xl bg-white/20 dark:bg-black/20"></div>
      
      {/* Content */}
      <div className="relative z-10">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-black/40 backdrop-blur-sm rounded-full border border-white/50 dark:border-white/10">
              <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-gray-700 dark:text-gray-200">Smart Event Management Platform</span>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl text-white drop-shadow-lg">
                Welcome to ClubHub
              </h1>
              <p className="text-xl text-white/90 dark:text-white/80 drop-shadow">
                The all-in-one platform for managing college events, clubs, and student engagement. 
                Connect, organize, and thrive together.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="bg-white text-purple-600 hover:bg-white/90 shadow-xl"
                onClick={onNavigateToLogin}
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-gray-300 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/20 backdrop-blur-sm">
                Learn More
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div>
                <div className="text-3xl text-white drop-shadow-lg">3,200+</div>
                <div className="text-sm text-white/80">Active Students</div>
              </div>
              <div>
                <div className="text-3xl text-white drop-shadow-lg">85+</div>
                <div className="text-sm text-white/80">Clubs & Organizations</div>
              </div>
              <div>
                <div className="text-3xl text-white drop-shadow-lg">180+</div>
                <div className="text-sm text-white/80">Events Monthly</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-white rounded-3xl blur-3xl opacity-40"></div>
            <iframe
              className="relative rounded-3xl shadow-2xl w-full aspect-video border-4 border-white/50"
              src="https://www.youtube.com/embed/zq-1h1XojzY?autoplay=1&mute=1&loop=1&playlist=zq-1h1XojzY&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0"
              title="ClubHub Platform"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            ></iframe>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl mb-4 text-white drop-shadow-lg">
            Everything You Need
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Powerful features designed for students, organizers, and administrators
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-2 border-white/30 bg-white/90 dark:bg-black/40 backdrop-blur-md hover:border-white hover:shadow-2xl hover:shadow-white/20 transition-all">
            <CardContent className="p-6 space-y-4">
              <div className="h-12 w-12 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg animate-gradient" style={{ animationDelay: '0s' }}>
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl">Event Management</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create, manage, and track events with ease. Students can browse and register for events instantly.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-white/30 bg-white/90 dark:bg-black/40 backdrop-blur-md hover:border-white hover:shadow-2xl hover:shadow-white/20 transition-all">
            <CardContent className="p-6 space-y-4">
              <div className="h-12 w-12 bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg animate-gradient" style={{ animationDelay: '2.5s' }}>
                <QrCode className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl">QR Code Check-in</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Streamlined attendance tracking with QR codes. Quick check-ins for seamless event experiences.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-white/30 bg-white/90 dark:bg-black/40 backdrop-blur-md hover:border-white hover:shadow-2xl hover:shadow-white/20 transition-all">
            <CardContent className="p-6 space-y-4">
              <div className="h-12 w-12 bg-gradient-to-br from-rose-500 via-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg animate-gradient" style={{ animationDelay: '5s' }}>
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl">Club Discovery</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Explore and join clubs that match your interests. Build connections and grow your network.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-white/30 bg-white/90 dark:bg-black/40 backdrop-blur-md hover:border-white hover:shadow-2xl hover:shadow-white/20 transition-all">
            <CardContent className="p-6 space-y-4">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg animate-gradient" style={{ animationDelay: '7.5s' }}>
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl">Analytics & Insights</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Track engagement, attendance, and event performance with detailed analytics dashboards.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-white/30 bg-white/90 dark:bg-black/40 backdrop-blur-md hover:border-white hover:shadow-2xl hover:shadow-white/20 transition-all">
            <CardContent className="p-6 space-y-4">
              <div className="h-12 w-12 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg animate-gradient" style={{ animationDelay: '10s' }}>
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl">Role-Based Access</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Secure platform with dedicated dashboards for students, organizers, and administrators.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-white/30 bg-white/90 dark:bg-black/40 backdrop-blur-md hover:border-white hover:shadow-2xl hover:shadow-white/20 transition-all">
            <CardContent className="p-6 space-y-4">
              <div className="h-12 w-12 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg animate-gradient" style={{ animationDelay: '12.5s' }}>
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl">Smart Features</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Feedback forms, team management, registration tracking, and much more in one platform.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <Card className="border-2 border-white/50 bg-white/80 dark:bg-black/30 backdrop-blur-md shadow-2xl">
          <CardContent className="p-12 text-center space-y-6">
            <h2 className="text-3xl lg:text-4xl text-gray-800 dark:text-white">
              Ready to Transform Your Campus Experience?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Join thousands of students and organizers using ClubHub to create amazing events and build stronger communities.
            </p>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl"
              onClick={onNavigateToLogin}
            >
              Sign In to Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="border-t border-white/20 dark:border-gray-800/50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-700 dark:text-gray-300">
            <p>&copy; 2025 ClubHub. All rights reserved.</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}