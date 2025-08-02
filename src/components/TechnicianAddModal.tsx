import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';


interface TechnicianAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTechnicianAdded: () => void;
}

interface TechnicianData {
  name: string;
  email: string;
  password: string;
  role: string;
}

export function TechnicianAddModal({ isOpen, onClose, onTechnicianAdded }: TechnicianAddModalProps) {
  const [formData, setFormData] = useState<TechnicianData>({
    name: '',
    email: '',
    password: '',
    role: 'tech'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!isAuthenticated) {
        toast({ 
          title: 'Error', 
          description: 'Authentication required',
          variant: 'destructive'
        });
        return;
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        throw new Error('Authentication required');
      }
      
      const { data, error } = await supabase.functions.invoke('create-technician', {
        body: {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: formData.role
        },
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to create technician');
      }

      if (data?.error) {
        if (data.error === 'Email already exists') {
          toast({ 
            title: 'Error', 
            description: 'A user with this email already exists', 
            variant: 'destructive' 
          });
        } else {
          toast({ 
            title: 'Error', 
            description: data.error, 
            variant: 'destructive' 
          });
        }
        return;
      }

      toast({ 
        title: 'Success', 
        description: `Technician ${formData.name} created successfully!` 
      });
      onTechnicianAdded();
      handleClose();
    } catch (error: any) {
      console.error('Error creating technician:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to create technician', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', password: '', role: 'tech' });
    onClose();
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Technician</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="flex space-x-2">
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <Button type="button" variant="outline" onClick={generatePassword}>
                Generate
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="senior_tech">Senior Technician</SelectItem>
                <SelectItem value="tech">Technician</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Technician'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}