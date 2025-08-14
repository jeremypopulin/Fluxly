// src/components/jobs/JobSheet.tsx
import React, { useState } from 'react';
import { Job, Technician, Customer } from '@/types';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import JobSheetForm from './JobSheetForm';
import { useAppContext } from '@/contexts/AppContext';
import { v4 as uuidv4 } from 'uuid';

interface JobSheetProps {
  job?: Job;
  selectedDate?: Date;
  technicians: Technician[];
  customers: Customer[];
  onSave: (job: Job) => void;    // will receive the saved row from Supabase
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
  onDelete
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
    status: (job?.status as Job['status']) || ('assigned' as const),
    priority: (job?.priority as Job['priority']) || ('medium' as const),
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

  // ─────────────────────────────────────────────────────────────────────────────
  // Storage uploads
  // ─────────────────────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────────────
  // Save to Supabase (persists technicianIds[] as array)
  // ─────────────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Use endTime = startTime if empty
      const endTime = formData.endTime || formData.startTime;

      // Keep your external ID usage for uploads, otherwise DB can also generate UUIDs
      const jobId = job?.id || uuidv4();

      // Build payload for DB
      const payload: Omit<Job, 'id'> & { id: string } = {
        id: jobId,
        jobNumber: formData.jobNumber,
        title: formData.title,
        description: formData.description,
        customerId: formData.customerId,
        technicianIds: formData.technicianIds, // ← persist multiple techs
        start_time: new Date(formData.startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        status: formData.status,
        priority: formData.priority,
        location: formData.location,
        quoteNumber: formData.quoteNumber,
        partsUsed: formData.partsUsed || '',
      };

      // Upsert (insert new or update if exists)
      const { data, error } = await supabase
        .from('jobs')
        .upsert(payload, { onConflict: 'id' })
        .select('*')
        .single();

      if (error) {
        console.error('Save job error:', error);
        throw new Error(error.message || 'Failed to save job');
      }

      // Upload files (if any)
      if (formData.files.length > 0) {
        await uploadFiles(jobId, formData.files);
      }

      if (formData.purchaseOrder) {
        await uploadPurchaseOrder(jobId, formData.purchaseOrder);
      }

      toast({ title: 'Saved', description: job ? 'Job updated' : 'Job created' });

      // Bubble the saved row to parent (keeps UI/list in sync)
      onSave(data as Job);
    } catch (error: any) {
      console.error('Failed to save job:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to save job. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (job && onDelete) {
      onDelete(job.id);
    }
  };

  return (
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
  );
};

export default JobSheet;
