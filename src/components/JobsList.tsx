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
    return technicians.find((tech) => tech.id === technicianId)?.name || 'Unknown';
  };

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {jobs.map((job) => {
        const technicianName =
          job.technicianIds.length === 0
            ? 'Unassigned'
            : job.technicianIds.map(getTechnicianName).join(', ');

        return (
          <JobCard
            key={job.id}
            job={job}
            technicianName={technicianName}
            onClick={onJobClick}
          />
        );
      })}
    </div>
  );
};

export default JobsList;
