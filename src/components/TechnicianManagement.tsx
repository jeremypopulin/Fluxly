// src/components/technicians/TechnicianManagement.tsx
import React, { useState, useEffect } from 'react';
import type { Technician } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { TechnicianAddModal } from './TechnicianAddModal';
import { TechnicianEditModal } from './TechnicianEditModal';
import { invokeEdge } from '@/lib/supabase';

// ---- Build signature (shows in UI + console to prove correct file is loaded)
const BUILD_TAG = 'TM-guarded-v2 @ 2025-08-14';
console.log('[TechnicianManagement] build:', BUILD_TAG);

// Optional: prevent infinite “Loading…” if a request hangs
const REQUEST_TIMEOUT_MS = 20000;
function withTimeout<T>(p: Promise<T>, ms = REQUEST_TIMEOUT_MS): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('Request timed out')), ms);
    p.then((v) => {
      clearTimeout(t);
      resolve(v);
    }).catch((e) => {
      clearTimeout(t);
      reject(e);
    });
  });
}

const TechnicianManagement: React.FC = () => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [editTechnician, setEditTechnician] = useState<Technician | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    loadTechnicians();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTechnicians = async () => {
    setLoading(true);
    setLastError(null);
    try {
      // ✅ Always call Edge Function with fresh JWT (handled inside invokeEdge)
      const { data, error } = await withTimeout(invokeEdge<any>('load-technicians', {}));
      if (error) throw new Error(error.message || 'Failed to load technicians');

      const list: Technician[] = Array.isArray(data)
        ? (data as Technician[])
        : Array.isArray((data as any)?.technicians)
        ? ((data as any).technicians as Technician[])
        : [];

      setTechnicians(list ?? []);
      console.log('[TechnicianManagement] loaded technicians:', list.length);
    } catch (err: any) {
      const msg = err?.message || 'Failed to load technicians';
      console.error('[TechnicianManagement] load error:', msg, err);
      setTechnicians([]);
      setLastError(msg);
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this technician?');
    if (!confirmed) return;

    setDeletingId(userId);
    setLastError(null);
    try {
      const { data, error } = await withTimeout(
        invokeEdge<any>('delete-technician', {
          userId,
          // NOTE: matches your current function’s shared secret usage.
          secret: 'JosieBeePopulin2023!',
        })
      );

      if (error) throw new Error(error.message || 'Delete function error');
      if ((data as any)?.error) throw new Error((data as any).error);

      setTechnicians((prev) => prev.filter((t) => t.id !== userId));
      toast({ title: 'Deleted', description: 'Technician deleted successfully' });
    } catch (err: any) {
      const msg = err?.message || 'Failed to delete technician';
      console.error('[TechnicianManagement] delete error:', msg, err);
      setLastError(msg);
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdate = () => {
    loadTechnicians();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Technicians</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground" title="Build signature">
            {BUILD_TAG}
          </span>
          <Button onClick={() => setShowAddModal(true)} disabled={loading}>
            {loading ? 'Loading…' : 'Add Technician'}
          </Button>
        </div>
      </div>

      {lastError && !loading && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
          <div className="font-medium">Couldn’t load technicians</div>
          <div className="text-muted-foreground">{lastError}</div>
          <div className="mt-2">
            <Button variant="outline" onClick={loadTechnicians}>
              Retry
            </Button>
          </div>
        </div>
      )}

      {technicians.length === 0 && !loading && !lastError && (
        <p className="text-sm text-muted-foreground">No technicians found.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {technicians.map((tech) => (
          <Card key={tech.id} className="p-4 space-y-2">
            <div>
              <p className="font-medium">{tech.name || '(no name)'}</p>
              <p className="text-sm text-muted-foreground">{tech.email}</p>
              {tech.role && (
                <p className="text-xs mt-1">
                  Role: <span className="font-medium">{tech.role}</span>
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => setEditTechnician(tech)}>
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(tech.id)}
                disabled={deletingId === tech.id}
              >
                {deletingId === tech.id ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </Card>
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
          onTechnicianUpdated={handleUpdate}
        />
      )}
    </div>
  );
};

export default TechnicianManagement;
