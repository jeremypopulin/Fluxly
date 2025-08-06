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
    startTime: job ? new Date(job.start_time).toISOString().slice(0, 16) :
      selectedDate ? selectedDate.toISOString().slice(0, 16) : '',
    endTime: job ? new Date(job.end_time).toISOString().slice(0, 16) : '',
    status: job?.status || 'assigned' as const,
    priority: job?.priority || 'medium' as const,
    location: job?.location || '',
    quoteNumber: job?.quoteNumber || '',
    files: [] as File[],
    purchaseOrder: null as File | null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleTechnicianToggle = (techId: string) => {
    setFormData(prev => ({
      ...prev,
      technicianIds: prev.technicianIds.includes(techId)
        ? prev.technicianIds.filter(id => id !== techId)
        : [...prev.technicianIds, techId]
    }));
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
            title: 'File Upload Error',
            description: `Failed to upload ${file.name}`,
            variant: 'destructive'
          });
        }
      });

      await Promise.all(uploadPromises);
    } catch (error) {
      console.error('File upload error:', error);
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
          title: 'Upload Error',
          description: 'Failed to upload purchase order',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Purchase order upload error:', error);
    }
  };

  const handleSubmit = async () => {
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

  // Handler for file input changes
  const handleFilesChange = (files: File[]) => {
    setFormData(prev => ({ ...prev, files }));
  };

  return (
    <JobSheetForm
      formData={formData}
      setFormData={setFormData}
      handleFilesChange={handleFilesChange}
      handleSubmit={handleSubmit}
      handleTechnicianToggle={handleTechnicianToggle}
      onCancel={onCancel}
      onDelete={handleDelete}
      technicians={technicians}
      customers={customers}
      isSubmitting={isSubmitting}
    />
  );
};

export default JobSheet;
