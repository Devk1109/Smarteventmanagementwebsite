import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Calendar, QrCode, Users, MessageSquare, BarChart3 } from 'lucide-react';
import { OrganizerEventsView } from './organizer/OrganizerEventsView';
import { QRScannerView } from './organizer/QRScannerView';
import { RegisteredStudentsView } from './organizer/RegisteredStudentsView';
import { FeedbackManagement } from './organizer/FeedbackManagement';

export function OrganizerDashboard() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="py-8 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 px-[30px] py-[0px]">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Organizer Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your events and track attendance
            </p>
          </div>

          <Tabs defaultValue="events" className="w-full">
            <TabsList className="grid w-full max-w-3xl grid-cols-4 mb-8 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-2 border-purple-200/50 dark:border-purple-800/50">
              <TabsTrigger 
                value="events" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white"
              >
                <Calendar className="h-4 w-4" />
                Events
              </TabsTrigger>
              <TabsTrigger 
                value="scanner" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white"
              >
                <QrCode className="h-4 w-4" />
                QR Scanner
              </TabsTrigger>
              <TabsTrigger 
                value="students" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-teal-600 data-[state=active]:text-white"
              >
                <Users className="h-4 w-4" />
                Students
              </TabsTrigger>
              <TabsTrigger 
                value="feedback" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-rose-600 data-[state=active]:text-white"
              >
                <MessageSquare className="h-4 w-4" />
                Feedback
              </TabsTrigger>
            </TabsList>

            <TabsContent value="events">
              <OrganizerEventsView />
            </TabsContent>

            <TabsContent value="scanner">
              <QRScannerView />
            </TabsContent>

            <TabsContent value="students">
              <RegisteredStudentsView />
            </TabsContent>

            <TabsContent value="feedback">
              <FeedbackManagement />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
