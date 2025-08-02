import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Technician } from '@/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Key } from 'lucide-react';
import { PasswordResetModal } from './PasswordResetModal';

interface TechnicianEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  technician: Technician | null;
  onTechnicianUpdated: () => void;
}

export const TechnicianEditModal: React.FC<TechnicianEditModalProps> = ({
  isOpen,
  onClose,
  technician,
  onTechnicianUpdated
}) => {
  const [name, setName] = useState(technician?.name || '');
  const [email, setEmail] = useState(technician?.email || '');
  const [role, setRole] = useState(technician?.role || 'tech');
  const [status, setStatus] = useState(technician?.status || 'active');
  const [loading, setLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (technician) {
      setName(technician.name || '');
      setEmail(technician.email || '');
      setRole(technician.role || 'tech');
      setStatus(technician.status || 'active');
    }
  }, [technician]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!technician) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name,
          email,
          role,
          status
        })
        .eq('id', technician.id);

      if (error) throw error;

      toast({ title: 'Success', description: 'Technician updated successfully' });
      onTechnicianUpdated();
      onClose();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Technician</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
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
              <Select value={role} onValueChange={setRole}>
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
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPasswordReset(true)}
              >
                <Key className="w-4 h-4 mr-2" />
                Reset Password
              </Button>
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update'}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <PasswordResetModal
        isOpen={showPasswordReset}
        onClose={() => setShowPasswordReset(false)}
        technician={technician}
      />
    </>
  );
};