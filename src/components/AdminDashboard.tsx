import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BarChart3, Users, Calendar } from 'lucide-react';
import { AdminOverview } from './admin/AdminOverview';
import { ClubManagement } from './admin/ClubManagement';
import { AdminEventsView } from './admin/AdminEventsView';

export function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage the platform and oversee all activities
          </p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="clubs" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Clubs
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminOverview />
          </TabsContent>

          <TabsContent value="clubs">
            <ClubManagement />
          </TabsContent>

          <TabsContent value="events">
            <AdminEventsView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
