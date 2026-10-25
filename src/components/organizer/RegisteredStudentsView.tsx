import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Search, Download, Mail, Phone, RefreshCw, Users, TrendingUp, UserCheck } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { getAllEvents, Event } from '../../utils/eventStorage';
import { getRegistrationsByEvent, Registration } from '../../utils/registrationStorage';
import { toast } from 'sonner';
import { useAuth } from '../AuthContext';

export function RegisteredStudentsView() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  // Load events on mount
  useEffect(() => {
    loadEvents();
  }, []);

  // Load registrations when event is selected
  useEffect(() => {
    if (selectedEvent) {
      loadRegistrations();
    }
  }, [selectedEvent]);

  // Auto-refresh every 5 seconds to show new registrations
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedEvent) {
        const newRegistrations = getRegistrationsByEvent(selectedEvent);
        if (newRegistrations.length !== registrations.length) {
          setRegistrations(newRegistrations);
          // Show a subtle notification
          if (newRegistrations.length > registrations.length) {
            const diff = newRegistrations.length - registrations.length;
            toast.success(`${diff} new registration${diff > 1 ? 's' : ''}!`, {
              duration: 2000,
            });
          }
        }
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [selectedEvent, registrations.length]);

  const loadEvents = () => {
    const allEvents = getAllEvents();
    // Filter events to show only those created by this organizer
    const myEvents = allEvents.filter(event => event.organizerId === user?.id);
    setEvents(myEvents);
    
    // Auto-select first event if available
    if (myEvents.length > 0 && !selectedEvent) {
      setSelectedEvent(myEvents[0].id);
    }
  };

  const loadRegistrations = () => {
    if (selectedEvent) {
      const eventRegistrations = getRegistrationsByEvent(selectedEvent);
      setRegistrations(eventRegistrations);
    }
  };

  const handleRefresh = () => {
    loadEvents();
    loadRegistrations();
    toast.success('Student list refreshed');
  };

  const filteredStudents = registrations.filter((reg) =>
    reg.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reg.studentEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const checkedInCount = filteredStudents.filter(s => s.checkedIn).length;

  const handleExport = () => {
    if (filteredStudents.length === 0) {
      toast.error('No students to export');
      return;
    }

    const csv = [
      ['Name', 'Email', 'Registered At', 'Checked In'],
      ...filteredStudents.map(s => [
        s.studentName,
        s.studentEmail,
        new Date(s.registeredAt).toLocaleString(),
        s.checkedIn ? 'Yes' : 'No'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations-${selectedEvent}-${Date.now()}.csv`;
    a.click();
    toast.success('Student list exported');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card className="border-2 border-cyan-200/50 dark:border-cyan-800/50 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 rounded-full blur-3xl"></div>
        
        <CardHeader className="relative">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-2">
                <Users className="h-6 w-6 text-cyan-600" />
                Registered Students
              </CardTitle>
              <CardDescription>
                View and manage student registrations for your events
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                className="border-2 border-cyan-500 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950 hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExport}
                className="border-2 border-teal-500 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950 hover:shadow-lg hover:shadow-teal-500/30 transition-all"
              >
                <Download className="h-4 w-4 mr-2" />
                Export List
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Event</label>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger className="border-2 border-cyan-200 dark:border-cyan-800 focus:border-cyan-500">
                  <SelectValue placeholder="Choose an event" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Search Students</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cyan-600" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-2 border-cyan-200 dark:border-cyan-800 focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-xl border-2 border-blue-200/50 dark:border-blue-800/50 hover:shadow-xl hover:shadow-blue-500/20 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Total Registered</p>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {filteredStudents.length}
              </p>
            </div>

            <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border-2 border-green-200/50 dark:border-green-800/50 hover:shadow-xl hover:shadow-green-500/20 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-500 rounded-lg">
                  <UserCheck className="h-5 w-5 text-white" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Checked In</p>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {checkedInCount}
              </p>
            </div>

            <div className="p-5 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-xl border-2 border-orange-200/50 dark:border-orange-800/50 hover:shadow-xl hover:shadow-orange-500/20 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                {filteredStudents.length - checkedInCount}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-purple-200/50 dark:border-purple-800/50 hover:shadow-xl transition-all">
        <CardContent className="p-0">
          <div className="divide-y divide-purple-100 dark:divide-purple-900">
            {filteredStudents.map((reg, index) => (
              <div 
                key={reg.id} 
                className="p-4 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 dark:hover:from-purple-950/20 dark:hover:to-pink-950/20 transition-all duration-200 animate-in fade-in slide-in-from-left-5"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-purple-200 dark:border-purple-800">
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                        {getInitials(reg.studentName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{reg.studentName}</p>
                        {reg.checkedIn && (
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Checked In
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-purple-600" />
                          {reg.studentEmail}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-300">
                      {new Date(reg.registeredAt).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredStudents.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-muted-foreground">No students found matching your search.</p>
            </div>
          )}

          {registrations.length === 0 && !searchQuery && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <p className="text-muted-foreground mb-2 text-lg">No students registered yet</p>
              <p className="text-sm text-muted-foreground">
                Students will appear here when they register for this event
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}