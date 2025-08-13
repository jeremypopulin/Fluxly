import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import type { Technician } from '@/types';

interface TechnicianAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** After a successful add, trigger a refresh in the parent */
  onTechnicianAdded: () => void;
}

export const TechnicianAddModal: React.FC<TechnicianAddModalProps> = ({
  isOpen,
  onClose,
  onTechnicianAdded,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'senior_tech' | 'tech'>('tech');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;

    setLoading(true);
    try {
      // Call secure Edge Function to create + invite technician
      const { data, error } = await supabase.functions.invoke('create-technician', {
        body: { name, email, role },
      });

      if (error) {
        throw error;
      }

      // Optional: if your function returns a technician record, you can use it.
      // But we refresh via onTechnicianAdded() to stay consistent.
      const created: Technician | undefined = data?.technician;

      toast({
        title: 'Success',
        description: 'Technician invited successfully.',
      });

      // Ask parent to reload the list
      onTechnicianAdded();
      onClose();
    } catch (err: any) {
      const message =
        err?.message ||
        err?.error?.message ||
        'Failed to invite technician. Check Edge Function logs.';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Technician</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select
              value={role}
              onValueChange={(val) => setRole(val as Technician['role'])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="senior_tech">Senior Technician</SelectItem>
                <SelectItem value="tech">Technician</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Inviting…' : 'Invite'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TechnicianAddModal;
