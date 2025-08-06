import React, { useState, useMemo } from 'react';
import { Job, Technician, Customer } from '@/types';
import JobModal from './JobModal';
import JobCard from './Calendar/JobCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

  const [searchCustomer, setSearchCustomer] = useState('');
  const [searchDescription, setSearchDescription] = useState('');
  const [searchPO, setSearchPO] = useState('');

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

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const customer = customers.find((c) => c.id === job.customerId);
      const matchesCustomer = customer?.name
        ?.toLowerCase()
        .includes(searchCustomer.toLowerCase());
      const matchesDescription = job.description
        ?.toLowerCase()
        .includes(searchDescription.toLowerCase());
      const matchesPO = (job as any)?.purchaseOrder
        ?.toLowerCase?.()
        ?.includes(searchPO.toLowerCase());

      return (
        (!searchCustomer || matchesCustomer) &&
        (!searchDescription || matchesDescription) &&
        (!searchPO || matchesPO)
      );
    });
  }, [jobs, searchCustomer, searchDescription, searchPO, customers]);

  return (
    <div className="p-4 space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label>Filter by Customer</Label>
          <Input
            value={searchCustomer}
            onChange={(e) => setSearchCustomer(e.target.value)}
            placeholder="Search customer name..."
          />
        </div>
        <div>
          <Label>Filter by Description</Label>
          <Input
            value={searchDescription}
            onChange={(e) => setSearchDescription(e.target.value)}
            placeholder="Search job description..."
          />
        </div>
        <div>
          <Label>Filter by Purchase Order</Label>
          <Input
            value={searchPO}
            onChange={(e) => setSearchPO(e.target.value)}
            placeholder="Search purchase order..."
          />
        </div>
      </div>

      {/* Job Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredJobs.map((job) => {
          const assignedTechs = technicians.filter((t) =>
            job.technicianIds.includes(t.id)
          );
          const technicianName =
            assignedTechs.length > 0
              ? assignedTechs.map((t) => t.name).join(', ')
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
      </div>

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
