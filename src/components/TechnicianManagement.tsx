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
    // Load technicians on mount
    loadTechnicians();
  }, []);

  const loadTechnicians = async () => {
    try {
      const { data, error } = await supabase.from<Technician>('technicians').select('*');
      if (error) throw error;
      console.log('Loaded technicians:', data);
      setTechnicians(data ?? []);
    } catch (err: any) {
      console.error('Error loading technicians:', err.message || err);
      toast({
        title: 'Error',
        description: 'Failed to load technicians',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this technician?')) return;

    try {
      const { error } = await supabase.from('technicians').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Technician deleted successfully' });
      await loadTechnicians();
    } catch (err: any) {
      console.error('Error deleting technician:', err.message || err);
      toast({
        title: 'Error',
        description: 'Failed to delete technician',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Technicians</h2>
        <Button onClick={() => setShowAddModal(true)}>Add Technician</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {technicians.map((tech) => (
          <Card key={tech.id} className="p-4 space-y-2">
            <div>
              <p className="font-medium">{tech.name}</p>
              <p className="text-sm text-muted-foreground">{tech.email}</p>
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
          onTechnicianAdded={async () => {
            setShowAddModal(false);
            await loadTechnicians();
          }}
        />
      )}

      {editTechnician && (
        <TechnicianEditModal
          isOpen={!!editTechnician}
          technician={editTechnician}
          onClose={() => setEditTechnician(null)}
          onTechnicianUpdated={async () => {
            setEditTechnician(null);
            await loadTechnicians();
          }}
        />
      )}
    </div>
  );
};

export default TechnicianManagement;
