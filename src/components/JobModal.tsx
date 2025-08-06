import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Job, Technician, Customer } from '@/types';
import JobSheet from './JobSheet';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job?: Job;
  selectedDate?: Date;
  technicians: Technician[];
  customers: Customer[];
  onSave: (job: Job) => void;
  onDelete?: (jobId: string) => void;
}

const JobModal: React.FC<JobModalProps> = ({
  isOpen,
  onClose,
  job,
  selectedDate,
  technicians,
  customers,
  onSave,
  onDelete
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <JobSheet
          job={job}
          selectedDate={selectedDate}
          technicians={technicians}
          customers={customers}
          onSave={onSave}
          onCancel={onClose}
          onDelete={onDelete}
        />
      </DialogContent>
    </Dialog>
  );
};

export default JobModal;
