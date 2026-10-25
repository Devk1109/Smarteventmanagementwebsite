import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Plus, Search, Users, Calendar, MoreVertical, Trash, Edit, KeyRound, Copy } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { toast } from 'sonner@2.0.3';
import { AddClubDialog } from './AddClubDialog';
import { getAllClubs, deleteClub, Club } from '../../utils/clubStorage';

export function ClubManagement() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clubToDelete, setClubToDelete] = useState<Club | null>(null);
  const [organizers, setOrganizers] = useState<any[]>([]);

  // Load clubs on mount
  useEffect(() => {
    loadClubs();
    loadOrganizers();
  }, []);

  const loadClubs = () => {
    const allClubs = getAllClubs();
    setClubs(allClubs);
  };

  const loadOrganizers = () => {
    const allOrganizers = JSON.parse(localStorage.getItem('clubhub-organizers') || '[]');
    setOrganizers(allOrganizers);
  };

  const filteredClubs = clubs.filter(club =>
    club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (club: Club) => {
    setClubToDelete(club);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (clubToDelete) {
      const success = deleteClub(clubToDelete.id);
      if (success) {
        loadClubs(); // Reload clubs after deletion
        toast.success('Club removed successfully');
      } else {
        toast.error('Failed to remove club');
      }
    }
    setDeleteDialogOpen(false);
    setClubToDelete(null);
  };

  const handleAddClub = () => {
    // Reload clubs after adding
    loadClubs();
    loadOrganizers();
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">Club Management</h2>
          <p className="text-muted-foreground">Add, edit, or remove clubs from the platform</p>
        </div>
        <AddClubDialog onAddClub={handleAddClub}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Club
          </Button>
        </AddClubDialog>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clubs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredClubs.map((club) => (
              <div
                key={club.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold">{club.name}</h4>
                    <Badge>{club.category}</Badge>
                    <Badge variant="outline">{club.status}</Badge>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{club.members} members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{club.events} events</span>
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Club
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDelete(club)}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Remove Club
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>

          {filteredClubs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No clubs found matching your search.
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently remove "{clubToDelete?.name}" from the platform. 
              All member registrations will also be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Remove Club
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Organizer Credentials Section */}
      {organizers.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              <CardTitle>Organizer Credentials</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Login credentials for club organizers you've created
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {organizers.map((organizer) => (
                <div
                  key={organizer.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-muted/30"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold">{organizer.name}</h4>
                      <Badge variant="secondary">{organizer.clubName}</Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="font-medium">Email:</span>
                        <code className="bg-background px-2 py-0.5 rounded">{organizer.email}</code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(organizer.email, 'Email')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="font-medium">Password:</span>
                        <code className="bg-background px-2 py-0.5 rounded">{organizer.password}</code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(organizer.password, 'Password')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}