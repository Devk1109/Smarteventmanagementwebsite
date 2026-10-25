import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { addClub } from '../../utils/clubStorage';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface AddClubDialogProps {
  children: React.ReactNode;
  onAddClub: () => void;
}

export function AddClubDialog({ children, onAddClub }: AddClubDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    image: '',
    events: 0,
    organizerName: '',
    organizerEmail: '',
    organizerPassword: '',
  });

  const categories = [
    'Technology',
    'Business',
    'Design',
    'Arts',
    'Environment',
    'Sports',
    'Science',
    'Music',
    'Literature',
    'Other',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category) {
      return;
    }

    // Add club using the storage utility
    const newClub = addClub({
      name: formData.name,
      category: formData.category,
      description: formData.description || 'No description provided',
      image: formData.image || getDefaultImageForCategory(formData.category),
      events: formData.events,
      status: 'active',
    });

    // Save organizer credentials if provided
    if (formData.organizerEmail && formData.organizerPassword) {
      try {
        // Create organizer account in Supabase
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-94da7951/auth/create-organizer`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              name: formData.organizerName || formData.organizerEmail.split('@')[0],
              email: formData.organizerEmail,
              password: formData.organizerPassword,
              clubId: newClub.id,
              clubName: newClub.name,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          toast.error(data.error || 'Failed to create organizer account');
          return;
        }

        // Also save to localStorage for quick access
        const organizers = JSON.parse(localStorage.getItem('clubhub-organizers') || '[]');
        
        const newOrganizer = {
          id: data.organizer.id,
          name: data.organizer.name,
          email: data.organizer.email,
          password: formData.organizerPassword,
          clubId: newClub.id,
          clubName: newClub.name,
          createdAt: new Date().toISOString(),
        };

        organizers.push(newOrganizer);
        localStorage.setItem('clubhub-organizers', JSON.stringify(organizers));
        
        // Also save to Supabase KV store
        fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-94da7951/data/organizers`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify(newOrganizer),
          }
        ).catch(err => console.error('Failed to sync organizer to KV:', err));
        
        toast.success(`Club & organizer created! Email: ${formData.organizerEmail}`, {
          duration: 5000,
        });
      } catch (error) {
        console.error('Error creating organizer:', error);
        toast.error('Failed to create organizer account');
        return;
      }
    } else {
      toast.success('Club added successfully');
    }

    onAddClub(); // Notify parent to reload clubs
    
    // Reset form
    setFormData({
      name: '',
      category: '',
      description: '',
      image: '',
      events: 0,
      organizerName: '',
      organizerEmail: '',
      organizerPassword: '',
    });
    
    setOpen(false);
  };

  const getDefaultImageForCategory = (category: string): string => {
    switch (category) {
      case 'Technology':
        return 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080';
      case 'Business':
        return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080';
      case 'Design':
        return 'https://images.unsplash.com/photo-1649252504304-3d564a12dc52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080';
      case 'Arts':
        return 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080';
      case 'Environment':
        return 'https://images.unsplash.com/photo-1649252504304-3d564a12dc52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080';
      default:
        return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Club</DialogTitle>
          <DialogDescription>
            Create a new club to add to the platform. Fill in all the required information below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Club Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Club Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Computer Science Club"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter club description..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
              />
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="image">Image URL (Optional)</Label>
              <Input
                id="image"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to use default category image
              </p>
            </div>

            {/* Initial Events */}
            <div className="space-y-2">
              <Label htmlFor="events">Initial Event Count</Label>
              <Input
                id="events"
                type="number"
                min="0"
                placeholder="0"
                value={formData.events || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    events: parseInt(e.target.value) || 0,
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Enter the number of events organized (optional)
              </p>
            </div>

            {/* Divider */}
            <div className="border-t pt-4 mt-6">
              <h3 className="font-semibold text-sm mb-2">Organizer Credentials (Optional)</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Create login credentials for the club organizer. They can use these to access the organizer dashboard.
              </p>
            </div>

            {/* Organizer Name */}
            <div className="space-y-2">
              <Label htmlFor="organizerName">Organizer Name</Label>
              <Input
                id="organizerName"
                placeholder="e.g., John Doe"
                value={formData.organizerName}
                onChange={(e) =>
                  setFormData({ ...formData, organizerName: e.target.value })
                }
              />
            </div>

            {/* Organizer Email */}
            <div className="space-y-2">
              <Label htmlFor="organizerEmail">Organizer Email</Label>
              <Input
                id="organizerEmail"
                type="email"
                placeholder="e.g., john.doe@example.com"
                value={formData.organizerEmail}
                onChange={(e) =>
                  setFormData({ ...formData, organizerEmail: e.target.value })
                }
              />
            </div>

            {/* Organizer Password */}
            <div className="space-y-2">
              <Label htmlFor="organizerPassword">Organizer Password</Label>
              <Input
                id="organizerPassword"
                type="password"
                placeholder="Enter password"
                value={formData.organizerPassword}
                onChange={(e) =>
                  setFormData({ ...formData, organizerPassword: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Make sure to save these credentials and share them with the organizer
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name || !formData.category}>
              Add Club
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}