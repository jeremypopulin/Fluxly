import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, UserCheck, Clock, User, Edit, Key, Trash2 } from 'lucide-react';
import { Technician } from '@/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { TechnicianAddModal } from './TechnicianAddModal';
import { TechnicianEditModal } from './TechnicianEditModal';
import { PasswordResetModal } from './PasswordResetModal';
import { useAuth } from '@/contexts/AuthContext';



export const TechnicianManagement: React.FC = () => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const loadTechnicians = async () => {
    try {
      setLoading(true);
      
      if (!isAuthenticated) {
        setTechnicians([]);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setTechnicians([]);
        return;
      }

      const { data, error } = await supabase.functions.invoke('load-technicians', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) {
        console.error('Function error loading technicians:', error);
        toast({ 
          title: 'Error', 
          description: 'Failed to load technicians', 
          variant: 'destructive'
        });
        return;
      }
      
      setTechnicians(data?.technicians || []);
    } catch (error: any) {
      console.error('Failed to load technicians:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to load technicians', 
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTechnicians();
  }, [isAuthenticated]);

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'senior_tech': return 'Senior Technician';
      case 'tech': return 'Technician';
      case 'technician': return 'Technician';
      default: return role;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <UserCheck className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleEditTechnician = (technician: Technician) => {
    setSelectedTechnician(technician);
    setShowEditModal(true);
  };

  const handleResetPassword = (technician: Technician) => {
    setSelectedTechnician(technician);
    setShowPasswordModal(true);
  };

  const handleDeleteTechnician = async (technician: Technician) => {
    if (!window.confirm(`Are you sure you want to delete ${technician.name}? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(technician.id);
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', technician.id);

      if (error) throw error;

      setTechnicians(prev => prev.filter(t => t.id !== technician.id));
      toast({ title: 'Success', description: 'Technician deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting technician:', error);
      toast({ title: 'Error', description: 'Failed to delete technician', variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  const isAdmin = user?.role === 'admin';

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading technicians...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Technician Management</h2>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>

      <ScrollArea className="flex-1 h-[calc(100vh-300px)]">
        <div className="grid gap-4 pr-4">
          {technicians.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No technicians found</p>
              <Button 
                variant="outline" 
                onClick={loadTechnicians}
                className="mt-4"
              >
                Retry Loading
              </Button>
            </div>
          ) : (
            technicians.map((tech) => (
              <Card key={tech.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(tech.status || 'active')}
                    <div>
                      <h3 className="font-semibold">{tech.name}</h3>
                      <p className="text-sm text-gray-600">{tech.email}</p>
                      <p className="text-sm text-gray-500">{getRoleDisplay(tech.role)}</p>
                      {tech.status === 'pending' && (
                        <p className="text-xs text-yellow-600">Invitation pending</p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {isAdmin && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResetPassword(tech)}
                        >
                          <Key className="w-4 h-4 mr-2" />
                          Reset Password
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTechnician(tech)}
                          disabled={deletingId === tech.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {deletingId === tech.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTechnician(tech)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      <TechnicianAddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onTechnicianAdded={loadTechnicians}
      />

      <TechnicianEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTechnician(null);
        }}
        technician={selectedTechnician}
        onTechnicianUpdated={loadTechnicians}
      />

      <PasswordResetModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setSelectedTechnician(null);
        }}
        technician={selectedTechnician}
      />
    </div>
  );
};