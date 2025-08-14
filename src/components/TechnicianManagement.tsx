<<<<<<< HEAD
// src/components/TechnicianManagement.tsx
import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// ---- Supabase client (anon) for DB reads (RLS protects data) ----
const SUPABASE_URL = "https://diyuewnatraebokzeatl.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""; // set in your env
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
=======
import React, { useState, useEffect } from 'react';
import type { Technician } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { TechnicianAddModal } from './TechnicianAddModal';
import { TechnicianEditModal } from './TechnicianEditModal';
import { invokeEdge } from '@/lib/supabase';

// ---- Build signature (shows in UI + console to prove correct file is loaded)
const BUILD_TAG = 'TM-guarded-v3-envsecret @ 2025-08-14';
console.log('[TechnicianManagement] build:', BUILD_TAG);
>>>>>>> 8123b47 (Trigger redeploy with updated Vercel env vars)

// ---- Edge Function endpoint + admin header secret for deletes ----
const EDGE_BASE = "https://diyuewnatraebokzeatl.functions.supabase.co";
const DELETE_FN_URL = `${EDGE_BASE}/delete-technician`;
const ADMIN_TOKEN = "JosieBeePopulin2023!";

type Profile = {
  id: string;               // matches auth.users.id
  email: string | null;
  name: string | null;
  role: "admin" | "senior_tech" | "tech" | string;
  initials?: string | null;
};

export default function TechnicianManagement() {
  const [rows, setRows] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Load profiles
  useEffect(() => {
    let cancelled = false;

<<<<<<< HEAD
    async function load() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, name, role, initials")
        .order("name", { ascending: true });
=======
  const loadTechnicians = async () => {
    setLoading(true);
    setLastError(null);
    try {
      const { data, error } = await withTimeout(invokeEdge<any>('load-technicians', {}));
      if (error) throw new Error(error.message || 'Failed to load technicians');
>>>>>>> 8123b47 (Trigger redeploy with updated Vercel env vars)

      if (cancelled) return;
      if (error) {
        setError(error.message);
      } else {
        setRows(data || []);
      }
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r =>
      (r.name || "").toLowerCase().includes(q) ||
      (r.email || "").toLowerCase().includes(q) ||
      (r.role || "").toLowerCase().includes(q)
    );
  }, [rows, search]);

  async function handleDelete(userId: string, email?: string | null) {
    const label = email || userId;
    const ok = window.confirm(`Delete ${label}? This removes their Auth user and profile. This cannot be undone.`);
    if (!ok) return;

    setDeletingId(userId);
    setError(null);

    // optimistic UI
    const prev = rows;
    setRows(cur => cur.filter(r => r.id !== userId));

    try {
<<<<<<< HEAD
      const res = await fetch(DELETE_FN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": ADMIN_TOKEN,
        },
        body: JSON.stringify({ user_id: userId }),
      });
=======
      const { data, error } = await withTimeout(
        invokeEdge<any>('delete-technician', {
          userId,
          secret: process.env.NEXT_PUBLIC_TECH_CREATION_SECRET,
        })
      );
>>>>>>> 8123b47 (Trigger redeploy with updated Vercel env vars)

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Delete failed with status ${res.status}`);
      }
    } catch (e: any) {
      // rollback optimistic update
      setRows(prev);
      setError(e.message || "Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 12 }}>Users / Technicians</h1>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
        <input
          placeholder="Search name, email, role…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 8, flex: 1, border: "1px solid #ccc", borderRadius: 6 }}
        />
        <button
          onClick={async () => {
            setLoading(true);
            const { data, error } = await supabase
              .from("profiles")
              .select("id, email, name, role, initials")
              .order("name", { ascending: true });
            if (error) setError(error.message);
            else setRows(data || []);
            setLoading(false);
          }}
          style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #ccc", background: "#f8f8f8" }}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: 12, color: "#b00020" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div>Loading…</div>
      ) : filtered.length === 0 ? (
        <div>No users found.</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e5e5" }}>
              <th style={{ padding: 8 }}>Name</th>
              <th style={{ padding: 8 }}>Email</th>
              <th style={{ padding: 8 }}>Role</th>
              <th style={{ padding: 8, width: 1 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: 8 }}>
                  <div style={{ fontWeight: 600 }}>{r.name || "—"}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>{r.id}</div>
                </td>
                <td style={{ padding: 8 }}>{r.email || "—"}</td>
                <td style={{ padding: 8 }}>{r.role || "—"}</td>
                <td style={{ padding: 8 }}>
                  <button
                    disabled={deletingId === r.id}
                    onClick={() => handleDelete(r.id, r.email || r.name)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: "1px solid #d33",
                      background: deletingId === r.id ? "#f8d7da" : "#fff",
                      color: "#b00020",
                      cursor: deletingId === r.id ? "not-allowed" : "pointer",
                    }}
                    title="Delete user (Auth + profile)"
                  >
                    {deletingId === r.id ? "Deleting…" : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p style={{ marginTop: 12, fontSize: 12, color: "#666" }}>
        Deleting a user here calls your <code>delete-technician</code> Edge Function to remove their Auth user and their profile row.
      </p>
    </div>
  );
}
