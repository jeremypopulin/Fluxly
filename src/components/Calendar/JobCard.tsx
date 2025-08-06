import React from 'react';
import { Job } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JobCardProps {
  job: Job;
  technicianName: string;
  onClick: (job: Job) => void;
  isDragging?: boolean;
  compact?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  technicianName,
  onClick,
  isDragging,
  compact = false
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'high') {
      return <AlertCircle className="w-3 h-3 text-red-500" />;
    }
    return null;
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div
      className={cn(
        'bg-white rounded border cursor-pointer transition-all duration-200 hover:shadow-md relative',
        getStatusColor(job.status),
        compact ? 'p-1 sm:p-2' : 'p-2 sm:p-3',
        isDragging && 'opacity-50 transform rotate-2'
      )}
      onClick={() => onClick(job)}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/json', JSON.stringify(job));
      }}
    >
      {job.status === 'completed' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-blue-600 font-bold text-lg opacity-30 transform rotate-12">
            COMPLETED
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-1">
        <h4
          className={cn(
            'font-medium truncate flex-1',
            compact ? 'text-xs' : 'text-sm'
          )}
        >
          {job.title}
        </h4>
        <div className="flex items-center space-x-1 ml-1">
          {getPriorityIcon(job.priority)}
          {!compact && (
            <Badge variant="secondary" className="text-xs">
              {job.status}
            </Badge>
          )}
        </div>
      </div>

      <div className={cn('space-y-1 text-gray-600', compact ? 'text-xs' : 'text-xs')}>
        {job.start_time && job.end_time && (
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>
              {formatTime(job.start_time)} - {formatTime(job.end_time)}
            </span>
          </div>
        )}

        {job.location && (
          <div className="flex items-center space-x-1">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{job.location}</span>
          </div>
        )}

        {!compact && technicianName && (
          <div className="text-xs text-gray-500 truncate">
            {technicianName}
          </div>
        )}
      </div>

      {!compact && job.description && (
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
          {job.description}
        </p>
      )}
    </div>
  );
};

export default JobCard;
