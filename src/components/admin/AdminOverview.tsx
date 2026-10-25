import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Users, Calendar, Trophy, TrendingUp, UserPlus, CalendarPlus } from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useState, useEffect } from 'react';
import { getAllEvents } from '../../utils/eventStorage';
import { getAllClubs } from '../../utils/clubStorage';
import { getAllRegistrations } from '../../utils/registrationStorage';

export function AdminOverview() {
  const [stats, setStats] = useState([
    {
      title: 'Total Students',
      value: '0',
      change: '+0%',
      trend: 'up',
      icon: Users,
    },
    {
      title: 'Active Clubs',
      value: '0',
      change: '+0',
      trend: 'up',
      icon: Trophy,
    },
    {
      title: 'Total Events',
      value: '0',
      change: '+0',
      trend: 'up',
      icon: Calendar,
    },
    {
      title: 'Avg Attendance',
      value: '0%',
      change: '+0%',
      trend: 'up',
      icon: TrendingUp,
    },
  ]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [clubActivity, setClubActivity] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [topEvents, setTopEvents] = useState([]);

  useEffect(() => {
    loadData();
    
    // Auto-refresh data every 3 seconds
    const interval = setInterval(() => {
      loadData();
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    const allEvents = getAllEvents();
    const allClubs = getAllClubs();
    const allRegistrations = getAllRegistrations();

    // Calculate current month data
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const lastMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth()).padStart(2, '0')}`;
    
    // Current month stats
    const currentMonthRegistrations = allRegistrations.filter(r => r.registeredAt?.startsWith(currentMonth));
    const currentMonthStudents = new Set(currentMonthRegistrations.map(r => r.studentId)).size;
    const currentMonthClubs = allClubs.filter(c => c.createdAt?.startsWith(currentMonth) && c.status === 'active').length;
    const currentMonthEvents = allEvents.filter(e => e.date?.startsWith(currentMonth)).length;
    const currentMonthCheckedIn = allRegistrations.filter(r => r.registeredAt?.startsWith(currentMonth) && r.checkedIn).length;
    
    // Last month stats
    const lastMonthRegistrations = allRegistrations.filter(r => r.registeredAt?.startsWith(lastMonth));
    const lastMonthStudents = new Set(lastMonthRegistrations.map(r => r.studentId)).size;
    const lastMonthClubs = allClubs.filter(c => c.createdAt?.startsWith(lastMonth) && c.status === 'active').length;
    const lastMonthEvents = allEvents.filter(e => e.date?.startsWith(lastMonth)).length;
    const lastMonthCheckedIn = allRegistrations.filter(r => r.registeredAt?.startsWith(lastMonth) && r.checkedIn).length;

    // Calculate overall stats
    const uniqueStudents = new Set(allRegistrations.map(r => r.studentId));
    const totalStudents = uniqueStudents.size;
    const activeClubs = allClubs.filter(c => c.status === 'active').length;
    const totalEvents = allEvents.length;
    const checkedInCount = allRegistrations.filter(r => r.checkedIn).length;
    const avgAttendance = allRegistrations.length > 0 
      ? Math.round((checkedInCount / allRegistrations.length) * 100)
      : 0;
    
    const lastMonthAttendance = lastMonthRegistrations.length > 0
      ? Math.round((lastMonthCheckedIn / lastMonthRegistrations.length) * 100)
      : 0;

    // Calculate percentage changes
    const studentChange = lastMonthStudents > 0 
      ? Math.round(((currentMonthStudents - lastMonthStudents) / lastMonthStudents) * 100)
      : currentMonthStudents > 0 ? 100 : 0;
    
    const clubChange = currentMonthClubs - lastMonthClubs;
    
    const eventChange = currentMonthEvents - lastMonthEvents;
    
    const attendanceChange = avgAttendance - lastMonthAttendance;

    setStats([
      {
        title: 'Total Students',
        value: totalStudents.toString(),
        change: `${studentChange >= 0 ? '+' : ''}${studentChange}%`,
        trend: studentChange >= 0 ? 'up' : 'down',
        icon: Users,
      },
      {
        title: 'Active Clubs',
        value: activeClubs.toString(),
        change: `${clubChange >= 0 ? '+' : ''}${clubChange} new`,
        trend: clubChange >= 0 ? 'up' : 'down',
        icon: Trophy,
      },
      {
        title: 'Total Events',
        value: totalEvents.toString(),
        change: `${eventChange >= 0 ? '+' : ''}${eventChange} new`,
        trend: eventChange >= 0 ? 'up' : 'down',
        icon: Calendar,
      },
      {
        title: 'Avg Attendance',
        value: `${avgAttendance}%`,
        change: `${attendanceChange >= 0 ? '+' : ''}${attendanceChange}%`,
        trend: attendanceChange >= 0 ? 'up' : 'down',
        icon: TrendingUp,
      },
    ]);

    // Calculate monthly data (last 6 months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyStats = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = months[date.getMonth()];
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const monthEvents = allEvents.filter(e => e.date?.startsWith(monthYear));
      const monthRegistrations = allRegistrations.filter(r => r.registeredAt?.startsWith(monthYear));
      const monthCheckedIn = allRegistrations.filter(r => r.registeredAt?.startsWith(monthYear) && r.checkedIn);
      
      monthlyStats.push({
        month: monthName,
        events: monthEvents.length,
        students: new Set(monthRegistrations.map(r => r.studentId)).size,
        attendance: monthCheckedIn.length,
      });
    }
    setMonthlyData(monthlyStats);

    // Calculate REAL club activity based on actual events and memberships
    // Count actual events per club
    const clubEventCounts = new Map<string, number>();
    allEvents.forEach(event => {
      if (event.club) {
        clubEventCounts.set(event.club, (clubEventCounts.get(event.club) || 0) + 1);
      }
    });

    // Get real member counts from memberships
    const memberships = JSON.parse(localStorage.getItem('clubMemberships') || '[]');
    const clubMemberCounts = new Map<string, number>();
    memberships.forEach((m: any) => {
      clubMemberCounts.set(m.clubId, (clubMemberCounts.get(m.clubId) || 0) + 1);
    });

    // Build club stats with real data
    const clubStatsWithActivity = allClubs.map(club => ({
      clubId: club.id,
      clubName: club.name,
      realEvents: clubEventCounts.get(club.name) || 0, // Events use club name, not ID
      realMembers: clubMemberCounts.get(club.id) || 0,
      totalActivity: (clubEventCounts.get(club.name) || 0) + (clubMemberCounts.get(club.id) || 0),
    }))
    .filter(club => club.totalActivity > 0) // Only show clubs with activity
    .sort((a, b) => b.totalActivity - a.totalActivity) // Sort by most active
    .slice(0, 5); // Top 5 clubs

    // If no clubs have activity, show all clubs with their initial data
    const clubStats = clubStatsWithActivity.length > 0 
      ? clubStatsWithActivity.map(club => ({
          club: club.clubName.length > 12 ? club.clubName.substring(0, 12) + '...' : club.clubName,
          events: club.realEvents,
          members: club.realMembers,
        }))
      : allClubs.slice(0, 5).map(club => ({
          club: club.name.length > 12 ? club.name.substring(0, 12) + '...' : club.name,
          events: 0,
          members: 0,
        }));

    setClubActivity(clubStats);

    // Recent Activity - last 4 events
    const sortedEvents = [...allEvents].sort((a, b) => {
      const dateA = new Date(a.date || 0);
      const dateB = new Date(b.date || 0);
      return dateB.getTime() - dateA.getTime();
    });

    const activities = sortedEvents.slice(0, 4).map(event => {
      const eventDate = new Date(event.date || Date.now());
      const now = new Date();
      const diffMs = now.getTime() - eventDate.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      
      let timeAgo = '';
      if (diffDays > 0) {
        timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      } else if (diffHours > 0) {
        timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else {
        timeAgo = 'Just now';
      }

      return {
        icon: CalendarPlus,
        text: `New event: ${event.title}`,
        time: timeAgo,
      };
    });

    // Pad with placeholder if less than 4
    while (activities.length < 4) {
      activities.push({
        icon: Calendar,
        text: 'No recent activity',
        time: '',
      });
    }
    setRecentActivity(activities);

    // Top Events by registration count
    const eventsWithRegistrations = allEvents.map(event => {
      const eventRegs = allRegistrations.filter(r => r.eventId === event.id);
      return {
        name: event.title,
        attendance: eventRegs.length,
        capacity: event.capacity || 100,
      };
    }).filter(e => e.attendance > 0);

    const sorted = eventsWithRegistrations.sort((a, b) => b.attendance - a.attendance);
    const top = sorted.slice(0, 4);

    // Pad with placeholders if less than 4
    while (top.length < 4) {
      top.push({
        name: 'No events yet',
        attendance: 0,
        capacity: 100,
      });
    }
    setTopEvents(top);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const gradients = [
            'bg-gradient-to-br from-blue-500 to-blue-700',
            'bg-gradient-to-br from-purple-500 to-purple-700',
            'bg-gradient-to-br from-emerald-500 to-emerald-700',
            'bg-gradient-to-br from-orange-500 to-orange-700',
          ];
          const iconBgs = [
            'bg-blue-400/20',
            'bg-purple-400/20',
            'bg-emerald-400/20',
            'bg-orange-400/20',
          ];
          return (
            <Card key={stat.title} className={`${gradients[index]} border-0 text-white overflow-hidden relative`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-white/90">
                  {stat.title}
                </CardTitle>
                <div className={`h-12 w-12 rounded-xl ${iconBgs[index]} flex items-center justify-center backdrop-blur-sm`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <p className={`text-sm mt-1 font-medium ${stat.trend === 'up' ? 'text-white/90' : 'text-red-200'}`}>
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </div>
              Platform Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af' }}
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af' }}
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f3f4f6'
                  }}
                  labelStyle={{ color: '#f3f4f6' }}
                  cursor={{ stroke: 'rgba(55, 65, 81, 0.5)' }}
                />
                <Legend 
                  wrapperStyle={{ color: '#9ca3af' }}
                  iconType="line"
                />
                <Line
                  type="monotone"
                  dataKey="students"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  name="Students"
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6, fill: '#3b82f6' }}
                />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  name="Attendance"
                  dot={{ fill: '#8b5cf6', r: 4 }}
                  activeDot={{ r: 6, fill: '#8b5cf6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Trophy className="h-4 w-4 text-orange-500" />
              </div>
              Club Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={clubActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="club" 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af' }}
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af' }}
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f3f4f6'
                  }}
                  labelStyle={{ color: '#f3f4f6' }}
                  cursor={{ fill: 'rgba(55, 65, 81, 0.3)' }}
                />
                <Legend 
                  wrapperStyle={{ color: '#9ca3af' }}
                />
                <Bar dataKey="events" fill="#3b82f6" name="Events" radius={[8, 8, 0, 0]} />
                <Bar dataKey="members" fill="#8b5cf6" name="Members" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <CalendarPlus className="h-4 w-4 text-purple-500" />
              </div>
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, idx) => {
                const Icon = activity.icon;
                const colors = [
                  'bg-blue-500/10 text-blue-500',
                  'bg-emerald-500/10 text-emerald-500',
                  'bg-orange-500/10 text-orange-500',
                  'bg-pink-500/10 text-pink-500',
                ];
                return (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`h-10 w-10 rounded-full ${colors[idx % colors.length]} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.text}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
              Top Events This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topEvents.map((event, idx) => {
                const barColors = [
                  'bg-gradient-to-r from-blue-500 to-blue-600',
                  'bg-gradient-to-r from-purple-500 to-purple-600',
                  'bg-gradient-to-r from-emerald-500 to-emerald-600',
                  'bg-gradient-to-r from-orange-500 to-orange-600',
                ];
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">{event.name}</span>
                      <span className="text-muted-foreground font-medium">
                        {event.attendance}/{event.capacity}
                      </span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColors[idx % barColors.length]} transition-all duration-500`}
                        style={{ width: `${Math.min(100, (event.attendance / event.capacity) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}