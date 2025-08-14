// src/components/jobs/JobSheet.tsx
import React, { useState } from 'react';
import { Job, Technician, Customer } from '@/types';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import JobSheetForm from './JobSheetForm';
import { useAppContext } from '@/contexts/AppContext';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Parse common local strings:
 *  - ISO: 2025-08-14T14:49
 *  - AU/UK: 14/08/2025 02:49 PM
 *  - AU/UK 24h: 14/08/2025 14:49
 */
function parseLocalDateTime(input: string): Date | null {
  if (!input) return null;

  // Let Date try ISO-ish first
  const maybe = new Date(input);
  if (!Number.isNaN(maybe.getTime())) return maybe;

  // DD/MM/YYYY HH:mm [AM|PM]
  const m = input
    .trim()
    .match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?:\s*([AP]M))?$/i);
  if (!m) return null;

  const [, dd, mm, yyyy, hh, ii, ap] = m;
  let hour = parseInt(hh, 10);
  const minute = parseInt(ii, 10);

  if (ap) {
    const upper = ap.toUpperCase();
    if (upper === 'PM' && hour < 12) hour += 12;
    if (upper === 'AM' && hour === 12) hour = 0;
  }

  const day = parseInt(dd, 10);
  const monthIndex = parseInt(mm, 10) - 1;

  const d = new Date();
  d.setFullYear(parseInt(yyyy, 10));
  d.setMonth(monthIndex);
  d.setDate(day);
  d.setHours(hour, minute, 0, 0);

  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function toIsoOrThrow(label: string, value: string): string {
  const d = parseLocalDateTime(value);
  if (!d) throw new Error(`${label} is invalid: "${value}"`);
  return d.toISOString();
}

/** Remove keys that are undefined so we don’t send unknown/nulls */
function compact<T extends Record<string, any>>(obj: T): Partial<T> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────

interface JobSheetProps {
  job?: Job;
  selectedDate?: Date;
  technicians: Technician[];
  customers: Customer[];
  onSave: (job: Job) => void; // will receive the saved row from Supabase
  onCancel: () => void;
  onDelete?: (jobId: string) => void;
}

const JobSheet: React.FC<JobSheetProps> = ({
  job,
  selectedDate,
  technicians,
  customers,
  onSave,
  onCancel,
  onDelete,
}) => {
  const { generateJobNumber } = useAppContext();

  const [formData, setFormData] = useState({
    jobNumber: job?.jobNumber || generateJobNumber(),
    title: job?.title || '',
    description: job?.description || '',
    customerId: job?.customerId || '',
    technicianIds: job?.technicianIds || [],
    startTime: job
      ? new Date(job.start_time).toISOString().slice(0, 16)
      : selectedDate
      ? selectedDate.toISOString().slice(0, 16)
      : '',
    endTime: job ? new Date(job.end_time).toISOString().slice(0, 16) : '',
    status: job?.status || 'assigned',
    priority: job?.priority || 'medium',
    location: job?.location || '',
    quoteNumber: job?.quoteNumber || '',
    partsUsed: job?.partsUsed || '',
    inviteEmail: '',
    files: [] as File[],
    purchaseOrder: null as File | null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTechnicianToggle = (techId: string) => {
    setFormData((prev) => ({
      ...prev,
      technicianIds: prev.technicianIds.includes(techId)
        ? prev.technicianIds.filter((id) => id !== techId)
        : [...prev.technicianIds, techId],
    }));
  };

  const handleFilesChange = (files: File[]) => {
    setFormData((prev) => ({ ...prev, files }));
  };

  // Storage uploads
  const uploadFiles = async (jobId: string, files: File[]) => {
    if (!files || files.length === 0) return;
    try {
      const uploadPromises = files.map(async (file) => {
        const fileName = `${jobId}/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage.from('job-files').upload(fileName, file);
        if (error) {
          console.error('File upload error:', error);
          toast({
            title: 'File Upload Warning',
            description: `Failed to upload ${file.name}`,
            variant: 'destructive',
          });
        }
      });
      await Promise.all(uploadPromises);
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: 'File Upload Warning',
        description: 'Some files failed to upload',
        variant: 'destructive',
      });
    }
  };

  const uploadPurchaseOrder = async (jobId: string, file: File) => {
    try {
      const fileName = `${jobId}/purchase-order-${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from('job-files').upload(fileName, file);
      if (error) {
        console.error('Purchase order upload error:', error);
        toast({
          title: 'Upload Warning',
          description: 'Failed to upload purchase order',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Purchase order upload error:', error);
      toast({
        title: 'Upload Warning',
        description: 'Failed to upload purchase order',
        variant: 'destructive',
      });
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // SAVE → upsert into public.jobs (snake_case columns)
  // ───────────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Use endTime = startTime if blank
      const endTimeStr = formData.endTime || formData.startTime;

      const startIso = toIsoOrThrow('Start Time', formData.startTime);
      const endIso = toIsoOrThrow('End Time', endTimeStr);

      const jobId = job?.id || uuidv4();

      // IMPORTANT: match your DB columns (snake_case)
      const payload = compact({
        id: jobId,                                  // uuid
        job_number: formData.jobNumber,             // text
        title: formData.title,                      // text
        description: formData.description,          // text
        customer_id: formData.customerId,           // text/uuid (match your schema)
        technician_ids: formData.technicianIds,     // text[]  (ensure column type is text[])
        start_time: startIso,                       // timestamptz
        end_time: endIso,                           // timestamptz
        status: formData.status,                    // text
        priority: formData.priority,                // text
        location: formData.location,                // text
        quote_number: formData.quoteNumber,         // text
        parts_used: formData.partsUsed || '',       // text
      });

      console.log('[JobSheet] upsert payload → public.jobs:', payload);

      const { data, error } = await supabase
        .from('jobs')
        .upsert(payload, { onConflict: 'id' })
        .select('*')
        .single();

      if (error) {
        console.error('[JobSheet] save error:', error);
        throw new Error(error.message || 'Failed to save job');
      }

      // Uploads after row exists
      if (formData.files.length > 0) await uploadFiles(jobId, formData.files);
      if (formData.purchaseOrder) await uploadPurchaseOrder(jobId, formData.purchaseOrder);

      toast({ title: 'Saved', description: job ? 'Job updated' : 'Job created' });

      // Map DB snake_case back to your Job type (if your app expects camelCase)
      const savedJob: Job = {
        id: data.id,
        jobNumber: data.job_number,
        title: data.title,
        description: data.description,
        customerId: data.customer_id,
        technicianIds: data.technician_ids || [],
        start_time: data.start_time,
        end_time: data.end_time,
        status: data.status,
        priority: data.priority,
        location: data.location,
        quoteNumber: data.quote_number,
        partsUsed: data.parts_used,
      };

      onSave(savedJob);
    } catch (error: any) {
      console.error('[JobSheet] Failed to save job:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to save job. Please check required fields.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (job && onDelete) onDelete(job.id);
  };

  return (
    <div className="space-y-4">
      {/* Back button */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onCancel}>
          ← Back
        </Button>
      </div>

      <JobSheetForm
        formData={formData}
        setFormData={setFormData}
        technicians={technicians}
        customers={customers}
        handleTechnicianToggle={handleTechnicianToggle}
        handleFilesChange={handleFilesChange}
        handleSubmit={handleSubmit}
        onCancel={onCancel}
        onDelete={handleDelete}
        isSubmitting={isSubmitting}
        job={job}
      />
    </div>
  );
};

export default JobSheet;
