import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Technician } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { TechnicianAddModal } from './TechnicianAddModal';
import { TechnicianEditModal } from './TechnicianEditModal';

const TechnicianManagement: React.FC = () => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [editTechnician, setEditTechnician] = useState<Technician | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadTechnicians();
  }, []);

  const loadTechnicians = async () => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
      console.error('Error loading technicians:', error);
      toast({
        title: 'Error',
        description: 'Failed to load technicians',
        variant: 'destructive',
      });
    } else {
      setTechnicians(data);
    }
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm('Are you sure you want to delete this technician?');
    if (!confirm) return;

    const { error } = await supabase.from('profiles').delete().eq('id', id);

    if (error) {
      console.error('Error deleting technician:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete technician',
        variant: 'destructive',
      });
    } else {
      setTechnicians((prev) => prev.filter((tech) => tech.id !== id));
      toast({
        title: 'Deleted',
        description: 'Technician deleted successfully',
      });
    }
  };

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleAdded = () => {
    setShowAddModal(false);
    loadTechnicians();
  };

  const handleUpdated = () => {
    setEditTechnician(null);
    loadTechnicians();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Technicians</h2>
        <Button onClick={handleAdd}>Add Technician</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {technicians.map((tech) => (
          <Card key={tech.id} className="p-4 space-y-2">
            <div>
              <p className="font-medium">{tech.name}</p>
              <p className="text-sm text-muted-foreground">{tech.email}</p>
              <p className="text-xs text-gray-500 capitalize">{tech.role}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => setEditTechnician(tech)}>
                Edit
              </Button>
              <Button variant="destructive" onClick={() => handleDelete(tech.id)}>
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {showAddModal && (
        <TechnicianAddModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onTechnicianAdded={handleAdded}
        />
      )}

      {editTechnician && (
        <TechnicianEditModal
          isOpen={!!editTechnician}
          technician={editTechnician}
          onClose={() => setEditTechnician(null)}
          onTechnicianUpdated={handleUpdated}
        />
      )}
    </div>
  );
};

export default TechnicianManagement;
