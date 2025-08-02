import React from 'react';
import { Technician, Job } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import JobCard from './JobCard';
import { cn } from '@/lib/utils';

interface TechnicianColumnProps {
  technician: Technician;
  jobs: Job[];
  onJobClick: (job: Job) => void;
  onDropJob: (technicianId: string, job: Job) => void;
  isDropTarget?: boolean;
}

const TechnicianColumn: React.FC<TechnicianColumnProps> = ({
  technician,
  jobs,
  onJobClick,
  onDropJob,
  isDropTarget
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const jobData = e.dataTransfer.getData('application/json');
    if (jobData) {
      const job = JSON.parse(jobData);
      onDropJob(technician.id, job);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getJobCount = () => {
    const assigned = jobs.filter(j => j.status === 'assigned').length;
    const inProgress = jobs.filter(j => j.status === 'in-progress').length;
    const completed = jobs.filter(j => j.status === 'completed').length;
    
    return { assigned, inProgress, completed };
  };

  const jobCounts = getJobCount();

  return (
    <div
      className={cn(
        'bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 min-h-[600px] transition-all duration-200',
        isDropTarget && 'border-blue-400 bg-blue-50'
      )}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Technician Header */}
      <div className="p-4 bg-white rounded-t-lg border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={technician.avatar} alt={technician.name} />
            <AvatarFallback className="bg-blue-600 text-white">
              {getInitials(technician.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{technician.name}</h3>
            <p className="text-sm text-gray-500">{technician.email}</p>
          </div>
          <Badge variant={technician.role === 'admin' ? 'default' : 'secondary'}>
            {technician.role}
          </Badge>
        </div>
        
        {/* Job Stats */}
        <div className="flex space-x-2 mt-3">
          <Badge variant="secondary" className="text-xs">
            {jobCounts.assigned} assigned
          </Badge>
          <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
            {jobCounts.inProgress} active
          </Badge>
          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
            {jobCounts.completed} done
          </Badge>
        </div>
      </div>

      {/* Jobs List */}
      <div className="p-4 space-y-3">
        {jobs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No jobs assigned</p>
            <p className="text-xs mt-1">Drag jobs here to assign</p>
          </div>
        ) : (
          jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              technician={technician}
              onJobClick={onJobClick}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TechnicianColumn;