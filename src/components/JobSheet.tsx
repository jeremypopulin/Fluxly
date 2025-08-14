// src/components/jobs/JobSheet.tsx
import React, { useState } from 'react';
import { Job, Technician, Customer } from '@/types';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import JobSheetForm from './JobSheetForm';
import { useAppContext } from '@/contexts/AppContext';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';

interface JobSheetProps {
  job?: Job;
  selectedDate?: Date;
  technicians: Technician[];
  customers: Customer[];
  onSave: (job: Job) => void;
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
    status: (job?.status || 'assigned') as const,
    priority: (job?.priority || 'medium') as const,
    location: job?.location || '',
    quoteNumber: job?.quoteNumber || '',
    partsUsed: job?.partsUsed || '',
    inviteEmail: '',
    files: [] as File[],
    purchaseOrder: null as File | null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTechnicianToggle = (techId: string) => {
    setFormData(prev => ({
      ...prev,
      technicianIds: prev.technicianIds.includes(techId)
        ? prev.technicianIds.filter(id => id !== techId)
        : [...prev.technicianIds, techId]
    }));
  };

  const handleFilesChange = (files: File[]) => {
    setFormData(prev => ({ ...prev, files }));
  };

  const uploadFiles = async (jobId: string, files: File[]) => {
    if (!files || files.length === 0) return;

    try {
      const uploadPromises = files.map(async (file) => {
        const fileName = `${jobId}/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage
          .from('job-files')
          .upload(fileName, file);

        if (error) {
          console.error('File upload error:', error);
          toast({
            title: 'File Upload Warning',
            description: `Failed to upload ${file.name}`,
            variant: 'destructive'
          });
        }
      });

      await Promise.all(uploadPromises);
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: 'File Upload Warning',
        description: 'Some files failed to upload',
        variant: 'destructive'
      });
    }
  };

  const uploadPurchaseOrder = async (jobId: string, file: File) => {
    try {
      const fileName = `${jobId}/purchase-order-${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from('job-files')
        .upload(fileName, file);

      if (error) {
        console.error('Purchase order upload error:', error);
        toast({
          title: 'Upload Warning',
          description: 'Failed to upload purchase order',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Purchase order upload error:', error);
      toast({
        title: 'Upload Warning',
        description: 'Failed to upload purchase order',
        variant: 'destructive'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const endTime = formData.endTime || formData.startTime;
      const jobId = job?.id || uuidv4();

      const jobData: Job = {
        id: jobId,
        jobNumber: formData.jobNumber,
        title: formData.title,
        description: formData.description,
        customerId: formData.customerId,
        technicianIds: formData.technicianIds,
        start_time: new Date(formData.startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        status: formData.status,
        priority: formData.priority,
        location: formData.location,
        quoteNumber: formData.quoteNumber,
        partsUsed: formData.partsUsed || ''
      };

      await onSave(jobData);

      if (formData.files.length > 0) {
        await uploadFiles(jobId, formData.files);
      }

      if (formData.purchaseOrder) {
        await uploadPurchaseOrder(jobId, formData.purchaseOrder);
      }
    } catch (error) {
      console.error('Failed to save job:', error);
      toast({
        title: 'Error',
        description: 'Failed to save job. Please try again.',
        variant: 'destructive'
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
