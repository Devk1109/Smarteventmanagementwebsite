import { useState, useEffect } from 'react';
import { Search, Users, Calendar, Award } from 'lucide-react';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner@2.0.3';
import { 
  getAllClubs, 
  joinClub, 
  leaveClub, 
  getStudentMemberships,
  Club 
} from '../../utils/clubStorage';

export function StudentClubsView() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [joinedClubIds, setJoinedClubIds] = useState<string[]>([]);

  // Load clubs and memberships on mount
  useEffect(() => {
    loadClubs();
    if (user) {
      const memberships = getStudentMemberships(user.id);
      setJoinedClubIds(memberships);
    }
  }, [user]);

  const loadClubs = () => {
    const allClubs = getAllClubs();
    setClubs(allClubs);
  };

  const categories = ['All', 'Technology', 'Business', 'Design', 'Arts', 'Environment'];
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Technology': return 'bg-blue-500 hover:bg-blue-600';
      case 'Business': return 'bg-indigo-500 hover:bg-indigo-600';
      case 'Design': return 'bg-pink-500 hover:bg-pink-600';
      case 'Arts': return 'bg-purple-500 hover:bg-purple-600';
      case 'Environment': return 'bg-green-500 hover:bg-green-600';
      default: return 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700';
    }
  };

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         club.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'All' || club.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleJoinClub = (clubId: string, clubName: string) => {
    if (!user) {
      toast.error('Please log in to join clubs');
      return;
    }

    const isJoined = joinedClubIds.includes(clubId);
    
    if (isJoined) {
      // Leave club
      const success = leaveClub(clubId, user.id);
      if (success) {
        setJoinedClubIds(joinedClubIds.filter(id => id !== clubId));
        loadClubs(); // Reload to update member counts
        toast.success(`Left ${clubName}`);
      }
    } else {
      // Join club
      const success = joinClub(clubId, user.id);
      if (success) {
        setJoinedClubIds([...joinedClubIds, clubId]);
        loadClubs(); // Reload to update member counts
        toast.success(`Joined ${clubName}`);
      } else {
        toast.error('Already a member of this club');
      }
    }
  };

  const myClubs = clubs.filter(club => joinedClubIds.includes(club.id));

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Clubs</h2>
            <p className="text-muted-foreground">Join clubs that match your interests</p>
          </div>
          {myClubs.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-lg">
              <Award className="h-5 w-5 text-white" />
              <span className="font-semibold text-white">Joined {myClubs.length} club{myClubs.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clubs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                className={`cursor-pointer transition-all ${
                  selectedCategory === category || (category === 'All' && !selectedCategory) 
                    ? getCategoryColor(category) + ' text-white shadow-lg scale-105' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
                onClick={() => setSelectedCategory(category === 'All' ? null : category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {myClubs.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">My Clubs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myClubs.map((club) => {
              const isJoined = joinedClubIds.includes(club.id);
              return (
                <Card key={club.id} className="overflow-hidden border-2 border-green-500 shadow-xl shadow-green-500/20 hover:shadow-2xl hover:shadow-green-500/30 transition-all">
                  <div className="aspect-video relative overflow-hidden">
                    <ImageWithFallback
                      src={club.image}
                      alt={club.name}
                      className="w-full h-full object-cover"
                    />
                    <Badge className={`absolute top-3 right-3 ${getCategoryColor(club.category)} text-white border-0`}>{club.category}</Badge>
                    <Badge className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">✓ Member</Badge>
                  </div>
                  
                  <CardContent className="pt-4">
                    <h3 className="text-lg font-semibold mb-2">{club.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{club.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{club.members} members</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{club.events} events</span>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full border-2 border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={() => handleJoinClub(club.id, club.name)}
                    >
                      Leave Club
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xl font-semibold mb-4">
          {myClubs.length > 0 ? 'Discover More Clubs' : 'Available Clubs'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => {
            const isJoined = joinedClubIds.includes(club.id);
            
            return (
              <Card key={club.id} className={`overflow-hidden hover:shadow-2xl transition-all hover:scale-[1.02] ${isJoined ? 'border-2 border-green-500/50' : 'border-2 hover:border-blue-500/50'}`}>
                <div className="aspect-video relative overflow-hidden">
                  <ImageWithFallback
                    src={club.image}
                    alt={club.name}
                    className="w-full h-full object-cover"
                  />
                  <Badge className={`absolute top-3 right-3 ${getCategoryColor(club.category)} text-white border-0`}>{club.category}</Badge>
                  {isJoined && (
                    <Badge className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">✓ Member</Badge>
                  )}
                </div>
                
                <CardContent className="pt-4">
                  <h3 className="text-lg font-semibold mb-2">{club.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{club.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{club.members} members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{club.events} events</span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button
                    className={`w-full ${
                      isJoined 
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white' 
                        : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white'
                    }`}
                    onClick={() => handleJoinClub(club.id, club.name)}
                  >
                    {isJoined ? 'Joined ✓' : 'Join Club'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {filteredClubs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No clubs found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
