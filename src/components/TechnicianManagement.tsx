// src/components/technicians/TechnicianManagement.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Technician } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { TechnicianAddModal } from './TechnicianAddModal';
import { TechnicianEditModal } from './TechnicianEditModal';

// Proactive refresh threshold: if token expires in < 60s, refresh it.
const EXPIRY_BUFFER_MS = 60_000;

/**
 * Ensure we have a valid (non-expired) session.
 * - Refresh if close to expiry.
 * - If refresh fails or no session, sign out and return null.
 */
async function ensureValidSession() {
  const { data: getData, error: getErr } = await supabase.auth.getSession();
  if (getErr) {
    console.warn('[Technicians] getSession error:', getErr);
  }
  let session = getData?.session ?? null;

  if (session?.expires_at) {
    const msUntilExpiry = session.expires_at * 1000 - Date.now();
    if (msUntilExpiry < EXPIRY_BUFFER_MS) {
      const { data: refData, error: refErr } = await supabase.auth.refreshSession();
      if (refErr || !refData?.session) {
        console.warn('[Technicians] refresh failed; signing out');
        await supabase.auth.signOut();
        return null;
      }
      session = refData.session;
    }
  }

  if (!session) {
    // No valid session; sign out for safety.
    await supabase.auth.signOut();
    return null;
  }

  return session;
}

/**
 * Invoke a Supabase Edge Function with a guaranteed-fresh JWT.
 * Retries once if we hit an "expired token" style error.
 */
async function invokeWithFreshJwt<T = any>(
  fnName: string,
  body: Record<string, any> | undefined
): Promise<{ data: T | null; error: { message: string } | null }> {
  // 1) Ensure session is valid (may refresh)
  const session = await ensureValidSession();
  if (!session) {
    return { data: null, error: { message: 'Not authenticated. Please log in again.' } };
  }

  // 2) First attempt with current (fresh) JWT
  let res = await supabase.functions.invoke<T>(fnName, {
    body,
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  // 3) If token problems, try one refresh + retry once
  const tokenErrors = [
    'JWT expired',
    'Invalid JWT',
    'invalid signature',
    'token is expired',
    'Unauthorized',
  ];

  const failedWithAuth =
    res.error?.message &&
    tokenErrors.some((s) => res.error!.message.toLowerCase().includes(s.toLowerCase()));

  if (failedWithAuth) {
    const { data: refData, error: refErr } = await supabase.auth.refreshSession();
    if (refErr || !refData?.session) {
      await supabase.auth.signOut();
      return { data: null, error: { message: 'Session expired. Please log in again.' } };
    }

    res = await supabase.functions.invoke<T>(fnName, {
      body,
      headers: { Authorization: `Bearer ${refData.session.access_token}` },
    });
  }

  return res;
}

const TechnicianManagement: React.FC = () => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [editTechnician, setEditTechnician] = useState<Technician | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadTechnicians();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTechnicians = async () => {
    setLoading(true);
    try {
      // ✅ Use Edge Function to fetch (works with RLS) with fresh JWT
      const { data, error } = await invokeWithFreshJwt<any>('load-technicians', {});

      if (error) {
        throw new Error(error.message || 'Failed to load technicians');
      }

      const list: Technician[] = Array.isArray(data)
        ? (data as Technician[])
        : Array.isArray((data as any)?.technicians)
        ? ((data as any).technicians as Technician[])
        : [];

      setTechnicians(list ?? []);
    } catch (err: any) {
      console.error('Error loading technicians (edge):', err?.message || err);
      setTechnicians([]);
      toast({
        title: 'Error',
        description: 'Failed to load technicians',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this technician?');
    if (!confirmed) return;

    setDeletingId(userId);
    try {
      // ✅ Delete via Edge Function (fresh JWT + single retry on 401)
      const { data, error } = await invokeWithFreshJwt<any>('delete-technician', {
        userId,
        // NOTE: You already use this shared secret in your function.
        // (Yes, putting this on the client is not ideal, but matches your current setup.)
        secret: 'JosieBeePopulin2023!',
      });

      if (error) {
        throw new Error(error.message || 'Delete function error');
      }
      if ((data as any)?.error) {
        throw new Error((data as any).error);
      }

      // ✅ Remove from UI
      setTechnicians((prev) => prev.filter((t) => t.id !== userId));

      toast({
        title: 'Deleted',
        description: 'Technician deleted successfully',
      });
    } catch (err: any) {
      console.error('Error deleting technician (edge):', err?.message || err);
      toast({
        title: 'Error',
        description: err?.message || 'Failed to delete technician',
        variant: 'destructive',
      });
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
