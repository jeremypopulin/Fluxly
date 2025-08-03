import React from 'react';
import { Job, Technician, Customer } from '@/types';
import JobCard from './Calendar/JobCard';

interface JobsListProps {
  jobs: Job[];
  technicians: Technician[];
  customers: Customer[];
  onJobClick: (job: Job) => void;
  onEditJob: (job: Job) => void;
  onDeleteJob: (jobId: string) => void;
}

const JobsList: React.FC<JobsListProps> = ({
  jobs,
  technicians,
  customers,
  onJobClick,
  onEditJob,
  onDeleteJob,
}) => {
  const getTechnicianName = (technicianId: string) => {
    return technicians.find((tech) => tech.id === technicianId)?.name || 'Unassigned';
  };

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          technicianName={getTechnicianName(job.technicianId)}
          onClick={onJobClick}
        />
      ))}
    </div>
  );
};

export default JobsList;
