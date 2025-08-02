import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { InviteData } from '@/types';

interface TechnicianInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteSent: () => void;
}

export function TechnicianInviteModal({ isOpen, onClose, onInviteSent }: TechnicianInviteModalProps) {
  const [formData, setFormData] = useState<InviteData>({ email: '', name: '', role: 'tech' });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const inviteToken = crypto.randomUUID();
      
      // Insert into profiles table
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: crypto.randomUUID(),
          email: formData.email,
          name: formData.name,
          role: formData.role,
          status: 'pending',
          invite_token: inviteToken,
          invited_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      // Send invitation email
      const { error: emailError } = await supabase.functions.invoke('send-technician-invite', {
        body: {
          email: formData.email,
          name: formData.name,
          role: formData.role,
          inviteToken,
          inviterName: 'Super Admin'
        }
      });

      if (emailError) throw emailError;

      toast({ title: 'Success', description: 'Technician invitation sent successfully!' });
      onInviteSent();
      onClose();
      setFormData({ email: '', name: '', role: 'tech' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite New Technician</DialogTitle>
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
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
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
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>Send Invitation</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
