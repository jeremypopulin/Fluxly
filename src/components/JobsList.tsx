import React, { useState } from 'react';
import { Job, Technician, Customer } from '@/types';
import JobModal from './JobModal';
import JobCard from './Calendar/JobCard';

interface JobsListProps {
  jobs: Job[];
  technicians: Technician[];
  customers: Customer[];
  onSave: (job: Job) => void;
  onDelete: (jobId: string) => void;
}

const JobsList: React.FC<JobsListProps> = ({
  jobs,
  technicians,
  customers,
  onSave,
  onDelete,
}) => {
  const [selectedJob, setSelectedJob] = useState<Job | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openJobModal = (job?: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const closeJobModal = () => {
    setSelectedJob(undefined);
    setIsModalOpen(false);
  };

  const handleSave = (job: Job) => {
    onSave(job);
    closeJobModal();
  };

  const handleDelete = (jobId: string) => {
    onDelete(jobId);
    closeJobModal();
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {jobs.map((job) => {
        const assignedTechs = technicians.filter(t => job.technicianIds.includes(t.id));
        const technicianName = assignedTechs.length > 0
          ? assignedTechs.map(t => t.name).join(', ')
          : 'Unassigned';

        return (
          <JobCard
            key={job.id}
            job={job}
            technicianName={technicianName}
            onClick={() => openJobModal(job)}
          />
        );
      })}

      <JobModal
        isOpen={isModalOpen}
        onClose={closeJobModal}
        job={selectedJob}
        technicians={technicians}
        customers={customers}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default JobsList;
