// src/components/technicians/TechnicianManagement.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Technician } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { TechnicianAddModal } from './TechnicianAddModal';
import { TechnicianEditModal } from './TechnicianEditModal';

const TechnicianManagement: React.FC = () => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [editTechnician, setEditTechnician] = useState<Technician | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTechnicians();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTechnicians = async () => {
    setLoading(true);
    try {
      // ✅ Call secure Edge Function to fetch technicians
      const { data, error } = await supabase.functions.invoke('load-technicians', {
        body: {}, // no params needed
      });

      if (error) {
        throw error;
      }

      // Function may return { technicians: [...] } or just an array. Handle both.
      const list: Technician[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.technicians)
        ? data.technicians
        : [];

      console.log('Loaded technicians (via edge fn):', list);
      setTechnicians(list ?? []);
    } catch (err: any) {
      console.error('Error loading technicians (edge fn):', err?.message || err);
      toast({
        title: 'Error',
        description: 'Failed to load technicians',
        variant: 'destructive',
      });
      setTechnicians([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this technician?');
    if (!confirmDelete) return;

    try {
      // ✅ Use secure deletion through Edge Function (removes from auth.users + profiles)
      const { data, error } = await supabase.functions.invoke('delete-technician', {
        body: { id },
      });

      if (error) {
        throw error;
      }

      // If the function succeeds, refresh list
      toast({
        title: 'Deleted',
        description: 'Technician deleted successfully',
      });
      await loadTechnicians();
    } catch (err: any) {
      console.error('Error deleting technician (edge fn):', err?.message || err);
      toast({
        title: 'Error',
        description: 'Failed to delete technician',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = () => {
    loadTechnicians();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Technicians</h2>
        <Button onClick={() => setShowAddModal(true)} disabled={loading}>
          {loading ? 'Loading…' : 'Add Technician'}
        </Button>
      </div>

      {technicians.length === 0 && !loading && (
        <p className="text-sm text-muted-foreground">No technicians found.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {technicians.map((tech) => (
          <Card key={tech.id} className="p-4 space-y-2">
            <div>
              <p className="font-medium">{tech.name || '(no name)'}</p>
              <p className="text-sm text-muted-foreground">{tech.email}</p>
              <p className="text-xs mt-1">
                Role: <span className="font-medium">{tech.role}</span>
                {tech.status ? (
                  <span className="ml-2 text-muted-foreground">({tech.status})</span>
                ) : null}
              </p>
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
          // After adding, re-fetch from server to avoid stale state
          onTechnicianAdded={loadTechnicians}
        />
      )}

      {editTechnician && (
        <TechnicianEditModal
          isOpen={!!editTechnician}
          technician={editTechnician}
          onClose={() => setEditTechnician(null)}
          onTechnicianUpdated={handleUpdate}
        />
      )}
    </div>
  );
};

export default TechnicianManagement;
