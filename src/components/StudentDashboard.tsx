import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Calendar, LayoutGrid, QrCode, Ticket, Users, CalendarDays } from 'lucide-react';
import { StudentEventsView } from './student/StudentEventsView';
import { MyRegistrationsView } from './student/MyRegistrationsView';
import { MyQRCodeView } from './student/MyQRCodeView';
import { StudentClubsView } from './student/StudentClubsView';
import { CalendarView } from './student/CalendarView';
import { Badge } from './ui/badge';
import { useAuth } from './AuthContext';
import { getStudentMemberships } from '../utils/clubStorage';

export function StudentDashboard() {
  const { user } = useAuth();
  const [registeredEventsCount, setRegisteredEventsCount] = useState(0);
  const [joinedClubsCount, setJoinedClubsCount] = useState(0);

  useEffect(() => {
    // Load counts from localStorage and club storage
    const updateCounts = () => {
      // Get user-specific registrations
      const userRegistrationKey = user ? `registeredEvents-${user.id}` : 'registeredEvents';
      const events = localStorage.getItem(userRegistrationKey);
      
      if (events) {
        setRegisteredEventsCount(JSON.parse(events).length);
      }
      
      // Get club memberships from new storage system
      if (user) {
        const clubMemberships = getStudentMemberships(user.id);
        setJoinedClubsCount(clubMemberships.length);
      }
    };

    updateCounts();

    // Set up interval to check for updates
    const interval = setInterval(updateCounts, 1000);

    return () => clearInterval(interval);
  }, [user]);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 p-8 rounded-2xl text-white shadow-xl">
          <h1 className="text-4xl font-bold mb-2">Student Dashboard</h1>
          <p className="text-white/90">
            Discover events, join clubs, and manage your activities
          </p>
        </div>

        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid w-full max-w-4xl grid-cols-5 mb-8 h-auto p-1.5 bg-gradient-to-r from-purple-100 via-blue-100 to-pink-100 dark:from-purple-950 dark:via-blue-950 dark:to-pink-950">
            <TabsTrigger value="events" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white">
              <LayoutGrid className="h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="clubs" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
              <Users className="h-4 w-4" />
              Clubs
              {joinedClubsCount > 0 && (
                <Badge className="ml-1 h-5 px-1.5 text-xs bg-green-500">
                  {joinedClubsCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="registrations" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-rose-600 data-[state=active]:text-white">
              <Ticket className="h-4 w-4" />
              My Events
              {registeredEventsCount > 0 && (
                <Badge className="ml-1 h-5 px-1.5 text-xs bg-orange-500">
                  {registeredEventsCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <CalendarDays className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="qr" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-teal-600 data-[state=active]:text-white">
              <QrCode className="h-4 w-4" />
              QR Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            <StudentEventsView />
          </TabsContent>

          <TabsContent value="clubs">
            <StudentClubsView />
          </TabsContent>

          <TabsContent value="registrations">
            <MyRegistrationsView />
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarView />
          </TabsContent>

          <TabsContent value="qr">
            <MyQRCodeView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}