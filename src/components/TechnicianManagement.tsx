import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Technician } from '@/types';
import { Button } from '@/components/ui/button';
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

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const res = await fetch('https://diyuewnatraebokzeatl.supabase.co/functions/v1/delete-technician', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        userId: id,
        secret: 'JosieBeePopulin2023!',
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast({
        title: 'Error',
        description: data.error || 'Failed to delete technician',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Deleted',
      description: 'Technician removed from system',
    });

    setTechnicians((prev) => prev.filter((tech) => tech.id !== id));
  };

  const handleAdd = (newTech: Technician) => {
    setTechnicians((prev) => [...prev, newTech]);
  };

  const handleUpdate = (updatedTech: Technician) => {
    setTechnicians((prev) =>
      prev.map((tech) => (tech.id === updatedTech.id ? updatedTech : tech))
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Technicians</h2>
        <Button onClick={() => setShowAddModal(true)}>Add Technician</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {technicians.map((tech) => (
          <div key={tech.id} className="p-4 border rounded shadow">
            <div>
              <p className="font-medium">{tech.name}</p>
              <p className="text-sm text-muted-foreground">{tech.email}</p>
              <p className="text-sm capitalize">{tech.role}</p>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Button variant="outline" onClick={() => setEditTechnician(tech)}>
                Edit
              </Button>
              <Button variant="destructive" onClick={() => handleDelete(tech.id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <TechnicianAddModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onTechnicianAdded={loadTechnicians}
        />
      )}

      {editTechnician && (
        <TechnicianEditModal
          isOpen={!!editTechnician}
          technician={editTechnician}
          onClose={() => setEditTechnician(null)}
          onTechnicianUpdated={loadTechnicians}
        />
      )}
    </div>
  );
};

export default TechnicianManagement;
